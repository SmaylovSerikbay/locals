import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/messages?item_id=xxx - получить сообщения для item
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('item_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const before = searchParams.get('before'); // Для пагинации

    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, first_name, last_name, avatar_url)
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Reverse для хронологического порядка
    return NextResponse.json({ messages: data.reverse() });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - отправить сообщение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, sender_id, text, is_system } = body;

    if (!item_id || !sender_id || !text) {
      return NextResponse.json(
        { error: 'item_id, sender_id and text are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Проверяем существование item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Создаем сообщение
    const { data, error } = await supabase
      .from('messages')
      .insert({
        item_id,
        sender_id,
        text,
        is_system: is_system || false,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, first_name, last_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Отправить в Telegram если есть telegram_topic_id
    // Реализуется в telegram webhook

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
