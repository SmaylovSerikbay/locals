import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// GET /api/items/nearby - получить items рядом с локацией
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '5000'); // meters
    const type = searchParams.get('type'); // 'TASK' | 'EVENT' | null

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    // Используем SQL функцию nearby_items
    const { data: nearbyItems, error } = await supabase.rpc('nearby_items', {
      lat,
      lng,
      radius_meters: radius,
      item_type: type || null,
    });

    if (error) {
      console.error('Error fetching nearby items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Получаем полные данные для каждого item включая автора
    const itemIds = nearbyItems.map((item: any) => item.id);

    if (itemIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const { data: fullItems, error: fullError } = await supabase
      .from('items')
      .select(`
        *,
        author:users!items_author_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        executor:users!items_executor_id_fkey(id, username, first_name, last_name, avatar_url, reputation),
        responses(count)
      `)
      .in('id', itemIds);

    if (fullError) {
      console.error('Error fetching full item data:', fullError);
      return NextResponse.json({ error: fullError.message }, { status: 500 });
    }

    // Merge distance info
    const itemsWithDistance = fullItems.map((item) => {
      const nearbyItem = nearbyItems.find((ni: any) => ni.id === item.id);
      return {
        ...item,
        distance_meters: nearbyItem?.distance_meters || 0,
      };
    });

    // Sort by distance
    itemsWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);

    return NextResponse.json({ items: itemsWithDistance });
  } catch (error) {
    console.error('Error in GET /api/items/nearby:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
