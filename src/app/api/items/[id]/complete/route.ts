import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// POST /api/items/[id]/complete - завершить задачу
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Получаем item и проверяем права
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Только автор может завершить задачу
    if ((item as any).author_id !== user_id) {
      return NextResponse.json(
        { error: 'Only item author can complete the task' },
        { status: 403 }
      );
    }

    // Обновляем статус
    // @ts-ignore - Supabase type issue
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ status: 'COMPLETED' })
      .eq('id', id)
      .select(`
        *,
        author:users!items_author_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        executor:users!items_executor_id_fkey(id, username, first_name, last_name, avatar_url, reputation)
      `)
      .single();

    if (updateError) {
      console.error('Error completing item:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error in POST /api/items/[id]/complete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
