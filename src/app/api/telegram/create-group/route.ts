import { NextRequest, NextResponse } from 'next/server';

// Telegram Bot API integration for group chat
export async function POST(request: NextRequest) {
  try {
    const { title, itemId, itemType } = await request.json();
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Extract bot username from token (format: botId:token)
    const botId = botToken.split(':')[0];
    
    // Solution: Use Telegram's startgroup deep link
    // This opens Telegram with a pre-filled group creation dialog
    // The bot will be automatically added to the group
    const botUsername = await getBotUsername(botToken);
    
    // Create a deep link that:
    // 1. Opens Telegram group creation
    // 2. Adds the bot automatically
    // 3. Pre-fills the group name
    const deepLink = `https://t.me/${botUsername}?startgroup=${itemId}&admin=change_info+post_messages+delete_messages+invite_users+pin_messages`;
    
    // Alternative: Direct group creation link (requires user to click)
    const inviteLink = `tg://msg?text=${encodeURIComponent(
      `Join the ${itemType === 'EVENT' ? 'event' : 'task'}: ${title}\n\nClick to join our coordination group!`
    )}`;

    return NextResponse.json({
      success: true,
      chatId: `group_${itemId}`,
      deepLink,
      inviteLink,
      botUsername,
      instructions: 'Click the button to create a Telegram group with the bot'
    });

  } catch (error) {
    console.error('Error creating Telegram group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

// Helper to get bot username
async function getBotUsername(botToken: string): Promise<string> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    if (data.ok && data.result) {
      return data.result.username;
    }
    throw new Error('Failed to get bot info');
  } catch (error) {
    console.error('Error getting bot username:', error);
    // Fallback: extract from token or use a default
    return 'your_bot'; // You'll need to replace this with actual bot username
  }
}