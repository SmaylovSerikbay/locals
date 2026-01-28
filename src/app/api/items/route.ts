import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/items - получить все items с фильтрами
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'TASK' | 'EVENT'
    const status = searchParams.get('status'); // 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
    const authorId = searchParams.get('author_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = getServerSupabase();

    let query = supabase
      .from('items')
      .select(`
        *,
        author:users!items_author_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        executor:users!items_executor_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        responses(
          id,
          user_id,
          message,
          status,
          created_at,
          user:users!responses_user_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
        )
      `, { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    } else {
      // По умолчанию показываем только активные
      query = query.in('status', ['OPEN', 'IN_PROGRESS']);
    }

    if (authorId) {
      query = query.eq('author_id', parseInt(authorId));
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/items - создать новый item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      description,
      price,
      currency,
      event_date,
      latitude,
      longitude,
      author_id,
      max_participants,
      requires_approval,
    } = body;

    // Валидация
    if (!type || !title || !description || !latitude || !longitude || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['TASK', 'EVENT'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be TASK or EVENT' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Проверяем существование пользователя
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('id', author_id)
      .single();

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Создаем item
    const { data, error } = await supabase
      .from('items')
      .insert({
        type,
        title,
        description,
        price: price || null,
        currency: currency || 'USD',
        event_date: event_date || null,
        latitude,
        longitude,
        author_id,
        status: 'OPEN',
        max_participants: max_participants || null,
        requires_approval: requires_approval || false,
        current_participants: 0,
      })
      .select(`
        *,
        author:users!items_author_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create Telegram topic for the item
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const topicResponse = await fetch(`${baseUrl}/api/telegram/create-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: data.id,
          title: data.title,
          type: data.type,
        }),
      });

      if (!topicResponse.ok) {
        console.error('Failed to create Telegram topic:', await topicResponse.text());
      } else {
        console.log('Telegram topic created successfully');
      }
    } catch (telegramError) {
      console.error('Telegram topic creation error:', telegramError);
      // Don't fail the item creation if Telegram fails
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
