import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel admin info to determine which hotel's rooms to fetch
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json({ error: 'Hotel admin not found' }, { status: 403 });
    }

    // Fetch rooms for the admin's hotel
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelAdmin.hotel_id)
      .eq('is_active', true)
      .order('room_number');

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }

    return NextResponse.json(rooms || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel admin info
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json({ error: 'Hotel admin not found' }, { status: 403 });
    }

    const roomData = await request.json();

    // Create new room
    const { data: room, error } = await supabase
      .from('rooms')
      .insert([{
        hotel_id: hotelAdmin.hotel_id,
        room_number: roomData.room_number,
        room_type: roomData.room_type,
        floor_number: roomData.floor_number,
        capacity: roomData.capacity,
        base_price: roomData.base_price,
        status: roomData.status || 'available',
        amenities: roomData.amenities || [],
        description: roomData.description,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
