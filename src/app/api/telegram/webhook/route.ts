import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

/**
 * Telegram Webhook для синхронизации сообщений
 * 
 * Когда пользователи пишут в Telegram топик, сообщения попадают сюда
 * и сохраняются в БД для отображения в приложении
 */

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  message_thread_id?: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

    // Игнорируем обновления без сообщений
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;

    // Игнорируем сообщения от ботов
    if (message.from.is_bot) {
      return NextResponse.json({ ok: true });
    }

    // Игнорируем сообщения без текста
    if (!message.text) {
      return NextResponse.json({ ok: true });
    }

    // Проверяем, что это сообщение из топика (message_thread_id присутствует)
    if (!message.message_thread_id) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getServerSupabase();

    // Ищем item по telegram_topic_id
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id')
      .eq('telegram_topic_id', message.message_thread_id)
      .single();

    if (itemError || !item) {
      console.error('Item not found for topic:', message.message_thread_id);
      return NextResponse.json({ ok: true });
    }

    // Создаем или обновляем пользователя из Telegram
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: message.from.id,
          username: message.from.username || null,
          first_name: message.from.first_name,
          last_name: message.from.last_name || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (userError) {
      console.error('Error upserting user:', userError);
      return NextResponse.json({ ok: true });
    }

    // Сохраняем сообщение в БД
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        item_id: item.id,
        sender_id: message.from.id,
        text: message.text,
        telegram_message_id: message.message_id,
        is_system: false,
      });

    if (messageError) {
      console.error('Error saving message:', messageError);
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    console.log('Message saved successfully');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET для верификации webhook (Telegram проверяет доступность)
export async function GET() {
  return NextResponse.json({ status: 'Webhook is active' });
}
