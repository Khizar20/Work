import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel_id for the current admin
    const { data: adminData, error: adminError } = await supabase
      .from('hotel_admins')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('room_type');
    const capacity = searchParams.get('capacity');

    // Build the query for available rooms
    let query = supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        room_type,
        capacity,
        base_price,
        status,
        floor_number,
        amenities,
        description,
        is_active
      `)
      .eq('hotel_id', adminData.hotel_id)
      .eq('is_active', true)
      .eq('status', 'available'); // Only show rooms with status 'available'

    // Apply filters
    if (roomType) {
      query = query.eq('room_type', roomType);
    }

    if (capacity) {
      query = query.gte('capacity', parseInt(capacity));
    }

    const { data: rooms, error } = await query.order('room_number');

    if (error) {
      console.error('Error fetching available rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch available rooms' }, { status: 500 });
    }

    return NextResponse.json({ 
      rooms,
      total: rooms?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/rooms/available:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 