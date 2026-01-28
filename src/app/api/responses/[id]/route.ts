import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// PATCH /api/responses/[id] - обновить статус отклика (accept/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, author_id } = body;

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or REJECTED' },
        { status: 400 }
      );
    }

    if (!author_id) {
      return NextResponse.json(
        { error: 'author_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Получаем response и проверяем права
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select(`
        *,
        item:items!responses_item_id_fkey(id, author_id, status)
      `)
      .eq('id', id)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    // Проверяем, что запрос делает автор item
    if ((response.item as any).author_id !== author_id) {
      return NextResponse.json(
        { error: 'Only item author can accept/reject responses' },
        { status: 403 }
      );
    }

    // Обновляем статус response
    const { data: updatedResponse, error: updateError } = await supabase
      .from('responses')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating response:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Если ACCEPTED, обновляем item
    if (status === 'ACCEPTED') {
      // Отклоняем все остальные responses
      await supabase
        .from('responses')
        .update({ status: 'REJECTED' })
        .eq('item_id', response.item_id)
        .neq('id', id)
        .eq('status', 'PENDING');

      // Обновляем item - ставим executor и меняем статус
      await supabase
        .from('items')
        .update({
          executor_id: response.user_id,
          status: 'IN_PROGRESS',
        })
        .eq('id', response.item_id);
    }

    return NextResponse.json({ response: updatedResponse });
  } catch (error) {
    console.error('Error in PATCH /api/responses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
