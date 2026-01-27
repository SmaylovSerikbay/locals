import { NextRequest, NextResponse } from 'next/server';

/**
 * АРХИТЕКТУРА: TELEGRAM FORUM GROUPS С ТОПИКАМИ
 * 
 * Вместо создания отдельной группы для каждого события:
 * 1. Создаем ОДНУ супергруппу-форум (например "LOCALS Almaty")
 * 2. Для каждого события создаем ТОПИК (ветку) в этом форуме
 * 3. Пользователи присоединяются к конкретному топику
 * 
 * Преимущества:
 * - Не нужно создавать сотни групп
 * - Все события города в одном месте
 * - Легче модерировать
 * - Telegram автоматически организует обсуждения
 */

// Супергруппа-форум BLINK (@blinkappchat)
// Настроена с правами администратора для бота @bblinkappbot
const FORUM_CHAT_ID = process.env.TELEGRAM_FORUM_CHAT_ID || '-1003836967887';

export async function POST(request: NextRequest) {
  try {
    const { title, itemId, itemType } = await request.json();
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Создаем топик в форум-группе
    const topicName = `${itemType === 'EVENT' ? '🎉' : '📦'} ${title}`;
    
    const createTopicResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/createForumTopic`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: FORUM_CHAT_ID,
          name: topicName.substring(0, 128), // Max 128 chars
          icon_color: itemType === 'EVENT' ? 0x6FB9F0 : 0xFFD67E, // Blue for events, yellow for tasks
          // icon_custom_emoji_id: 'optional_emoji_id' // Можно добавить кастомный эмодзи
        })
      }
    );

    const topicData = await createTopicResponse.json();

    if (!topicData.ok) {
      console.error('Failed to create forum topic:', topicData);
      
      // Fallback: если не получилось создать топик, даем ссылку на общий чат
      const botUsername = await getBotUsername(botToken);
      return NextResponse.json({
        success: false,
        error: topicData.description,
        fallbackLink: `https://t.me/${botUsername}?start=item_${itemId}`,
        instructions: 'Не удалось создать топик. Используйте общий чат.'
      });
    }

    const messageThreadId = topicData.result.message_thread_id;
    const topicId = topicData.result.message_thread_id;

    // Отправляем приветственное сообщение в топик
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: FORUM_CHAT_ID,
          message_thread_id: messageThreadId,
          text: `🎯 **${title}**\n\n${itemType === 'EVENT' ? '🎉 Событие' : '📦 Задача'} создано!\n\nОбсуждайте детали и договаривайтесь здесь.\n\n📍 Открыть в приложении: [LOCALS](https://your-app-url.com)`,
          parse_mode: 'Markdown'
        })
      }
    );

    // Формируем ссылку на топик
    // Формат: https://t.me/c/{chat_id без -100}/{topic_id}
    const chatIdNumeric = FORUM_CHAT_ID.replace('-100', '');
    const topicLink = `https://t.me/c/${chatIdNumeric}/${topicId}`;

    return NextResponse.json({
      success: true,
      chatId: `topic_${itemId}`,
      topicId: messageThreadId,
      deepLink: topicLink,
      forumChatId: FORUM_CHAT_ID,
      instructions: 'Topic created in forum group'
    });

  } catch (error) {
    console.error('Error creating forum topic:', error);
    return NextResponse.json({ 
      error: 'Failed to create topic',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
    return 'locals_bot'; // Fallback
  }
}