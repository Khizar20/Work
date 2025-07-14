import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Update room (ensure it belongs to the admin's hotel)
    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        room_number: roomData.room_number,
        room_type: roomData.room_type,
        floor_number: roomData.floor_number,
        capacity: roomData.capacity,
        base_price: roomData.base_price,
        status: roomData.status,
        amenities: roomData.amenities,
        description: roomData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('hotel_id', hotelAdmin.hotel_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Soft delete - set is_active to false instead of actual deletion
    const { data: room, error } = await supabase
      .from('rooms')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('hotel_id', hotelAdmin.hotel_id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting room:', error);
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
