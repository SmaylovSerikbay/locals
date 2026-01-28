import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

/**
 * PATCH /api/items/[id]/join/[participantId]
 * Approve or reject a join request
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;
    const supabase = getServerSupabase();
    const body = await request.json();
    const { status, authorId } = body; // 'APPROVED' or 'REJECTED'

    if (!authorId || !status) {
      return NextResponse.json(
        { error: 'authorId and status are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // 1. Verify author owns this item
    const { data: item } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (!item || String(item.author_id) !== String(authorId)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only item author can approve/reject.' },
        { status: 403 }
      );
    }

    // 2. If approving, check if event is full
    if (status === 'APPROVED') {
      const { data: isFull } = await supabase
        .rpc('is_event_full', { event_id: id });

      if (isFull) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        );
      }
    }

    // 3. Update participant status
    const { data: participant, error: updateError } = await supabase
      .from('chat_participants')
      .update({
        status,
        approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
        approved_by: status === 'APPROVED' ? authorId : null,
      })
      .eq('id', participantId)
      .eq('item_id', id)
      .select('*, user:users(*)')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      participant,
      message: status === 'APPROVED' 
        ? 'Participant approved!' 
        : 'Participant rejected.',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Approve/reject join error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]/join/[participantId]
 * User leaves event or author kicks user
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get participant and item
    const { data: participant } = await supabase
      .from('chat_participants')
      .select('*, item:items(*)')
      .eq('id', participantId)
      .single();

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if user is participant or item author
    const isAuthor = String((participant.item as any).author_id) === String(userId);
    const isParticipant = String(participant.user_id) === String(userId);

    if (!isAuthor && !isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update status to LEFT
    const { error: updateError } = await supabase
      .from('chat_participants')
      .update({ status: 'LEFT' })
      .eq('id', participantId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isParticipant ? 'Left event successfully' : 'User removed from event',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Leave/kick error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
