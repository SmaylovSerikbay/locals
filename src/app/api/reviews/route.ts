import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/reviews?target_user_id=xxx - получить отзывы о пользователе
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('target_user_id');
    const itemId = searchParams.get('item_id');

    if (!targetUserId && !itemId) {
      return NextResponse.json(
        { error: 'target_user_id or item_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    let query = supabase
      .from('reviews')
      .select(`
        *,
        author:users!reviews_author_id_fkey(id, username, first_name, last_name, avatar_url),
        target_user:users!reviews_target_user_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        item:items!reviews_item_id_fkey(id, title, type)
      `)
      .order('created_at', { ascending: false });

    if (targetUserId) {
      query = query.eq('target_user_id', parseInt(targetUserId));
    }

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - оставить отзыв
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, author_id, target_user_id, rating, text } = body;

    if (!item_id || !author_id || !target_user_id || !rating) {
      return NextResponse.json(
        { error: 'item_id, author_id, target_user_id and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (author_id === target_user_id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Проверяем, что item завершен
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, status, author_id, executor_id')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed items' },
        { status: 400 }
      );
    }

    // Проверяем права на отзыв
    const isAuthor = item.author_id === author_id;
    const isExecutor = item.executor_id === author_id;

    if (!isAuthor && !isExecutor) {
      return NextResponse.json(
        { error: 'Only item participants can leave reviews' },
        { status: 403 }
      );
    }

    // Автор может оценить исполнителя, исполнитель - автора
    if ((isAuthor && target_user_id !== item.executor_id) ||
        (isExecutor && target_user_id !== item.author_id)) {
      return NextResponse.json(
        { error: 'Invalid target user for review' },
        { status: 400 }
      );
    }

    // Создаем отзыв (upsert для обновления существующего)
    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        {
          item_id,
          author_id,
          target_user_id,
          rating,
          text: text || null,
        },
        {
          onConflict: 'item_id,author_id,target_user_id',
        }
      )
      .select(`
        *,
        author:users!reviews_author_id_fkey(id, username, first_name, last_name, avatar_url),
        target_user:users!reviews_target_user_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
