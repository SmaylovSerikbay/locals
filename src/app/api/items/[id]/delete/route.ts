import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

/**
 * DELETE /api/items/[id]/delete
 * Delete an item (only by author)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    if (!authorId) {
      return NextResponse.json(
        { error: 'authorId is required' },
        { status: 400 }
      );
    }

    // 1. Get item to verify author
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // 2. Verify author
    if (String(item.author_id) !== String(authorId)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only author can delete this item.' },
        { status: 403 }
      );
    }

    // 3. Delete item (cascade will delete related data)
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
