import { NextRequest, NextResponse } from 'next/server';

/**
 * Настройка Telegram webhook
 * 
 * Вызовите этот endpoint после деплоя на Vercel:
 * POST /api/telegram/set-webhook
 * 
 * Это настроит Telegram на отправку обновлений на ваш сервер
 */

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Получаем URL из запроса или используем текущий домен
    const body = await request.json().catch(() => ({}));
    const webhookUrl = body.webhook_url || `${request.nextUrl.origin}/api/telegram/webhook`;

    console.log('Setting webhook to:', webhookUrl);

    // Устанавливаем webhook
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message'], // Получаем только сообщения
          drop_pending_updates: true, // Сбрасываем старые обновления
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Failed to set webhook:', data);
      return NextResponse.json(
        { error: 'Failed to set webhook', details: data },
        { status: 500 }
      );
    }

    // Проверяем webhook
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );
    const webhookInfo = await infoResponse.json();

    return NextResponse.json({
      success: true,
      webhook_url: webhookUrl,
      webhook_info: webhookInfo.result,
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET для проверки текущего webhook
export async function GET() {
  try {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );
    const data = await response.json();

    return NextResponse.json(data.result);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
