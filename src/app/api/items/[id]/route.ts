import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/items/[id] - получить item по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getServerSupabase();

    const { data, error } = await supabase
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
        ),
        reviews(
          id,
          author_id,
          target_user_id,
          rating,
          text,
          created_at,
          author:users!reviews_author_id_fkey(id, username, first_name, last_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Error in GET /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - обновить item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getServerSupabase();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Разрешенные поля для обновления
    const allowedFields = [
      'title',
      'description',
      'price',
      'currency',
      'event_date',
      'latitude',
      'longitude',
      'status',
      'executor_id',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!items_author_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        executor:users!items_executor_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Error in PATCH /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - удалить item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getServerSupabase();

    const { error } = await supabase.from('items').delete().eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
