import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

/**
 * POST /api/items/[id]/join
 * User joins an event (or applies to task)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    const body = await request.json();
    const { userId, message } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 1. Get item details
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*, author:users!items_author_id_fkey(*)')
      .eq('id', id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // 2. Check if user is author
    if (String(item.author_id) === String(userId)) {
      return NextResponse.json(
        { error: 'Cannot join your own item' },
        { status: 400 }
      );
    }

    // 3. For EVENTS: Check if requires approval and if event is full
    if (item.type === 'EVENT') {
      // Check if event is full (only if function exists)
      try {
        const { data: isFull, error: fullError } = await supabase
          .rpc('is_event_full', { event_id: id });

        if (!fullError && isFull) {
          return NextResponse.json(
            { error: 'Event is full' },
            { status: 400 }
          );
        }
      } catch (e) {
        console.log('is_event_full function not available yet');
      }

      // Check if already joined
      const { data: existing, error: existError } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('item_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'Already joined or pending approval' },
          { status: 400 }
        );
      }

      // Create join request
      const status = item.requires_approval ? 'PENDING' : 'APPROVED';
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .insert({
          item_id: id,
          user_id: userId,
          status,
          approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
          approved_by: status === 'APPROVED' ? item.author_id : null,
        })
        .select('*')
        .single();

      if (participantError) {
        return NextResponse.json(
          { error: participantError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        participant,
        requiresApproval: item.requires_approval,
        message: item.requires_approval 
          ? 'Join request sent. Waiting for approval.' 
          : 'Successfully joined the event!',
      }, { status: 201 });
    }

    // 4. For TASKS: Create response
    else {
      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert({
          item_id: id,
          user_id: userId,
          message: message || 'I want to help!',
          status: 'PENDING',
        })
        .select('*, user:users(*)')
        .single();

      if (responseError) {
        return NextResponse.json(
          { error: responseError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        response,
        message: 'Response sent successfully!',
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Join error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/items/[id]/join
 * Get all join requests for an event
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'PENDING', 'APPROVED', 'REJECTED'

    // Check if chat_participants table exists, if not return empty array
    const { data: tableCheck, error: tableError } = await supabase
      .from('chat_participants')
      .select('id')
      .limit(1);

    // If table doesn't exist yet (migration not applied), return empty array
    if (tableError && tableError.message.includes('does not exist')) {
      return NextResponse.json({ participants: [] }, { status: 200 });
    }

    // Use explicit relationship name to avoid ambiguity
    let query = supabase
      .from('chat_participants')
      .select('*, user:users!chat_participants_user_id_fkey(*)')
      .eq('item_id', id)
      .order('joined_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: participants, error } = await query;

    if (error) {
      console.error('Get join requests error:', error);
      // If error, return empty array instead of 500
      return NextResponse.json({ participants: [] }, { status: 200 });
    }

    return NextResponse.json({ participants: participants || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Get join requests error:', error);
    // Return empty array on error to prevent UI breaking
    return NextResponse.json({ participants: [] }, { status: 200 });
  }
}
