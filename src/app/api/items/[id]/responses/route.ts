import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/items/[id]/responses - получить все отклики на item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        user:users!responses_user_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .eq('item_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ responses: data });
  } catch (error) {
    console.error('Error in GET /api/items/[id]/responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/items/[id]/responses - создать отклик на item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const body = await request.json();
    const { user_id, message } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'user_id and message are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Проверяем существование item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, author_id, status')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Нельзя откликаться на свой собственный item
    if (item.author_id === user_id) {
      return NextResponse.json(
        { error: 'Cannot respond to own item' },
        { status: 400 }
      );
    }

    // Нельзя откликаться на закрытый item
    if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot respond to completed or cancelled item' },
        { status: 400 }
      );
    }

    // Создаем отклик (upsert для обновления существующего)
    const { data, error } = await supabase
      .from('responses')
      .upsert(
        {
          item_id: itemId,
          user_id,
          message,
          status: 'PENDING',
        },
        {
          onConflict: 'item_id,user_id',
        }
      )
      .select(`
        *,
        user:users!responses_user_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .single();

    if (error) {
      console.error('Error creating response:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ response: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/items/[id]/responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
