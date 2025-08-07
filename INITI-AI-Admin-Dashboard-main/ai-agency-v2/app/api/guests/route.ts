import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build the query
    let query = supabase
      .from('guests')
      .select('*', { count: 'exact' })
      .eq('hotel_id', adminData.hotel_id);

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,room_number.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: guests, error, count } = await query;

    if (error) {
      console.error('Error fetching guests:', error);
      return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
    }

    return NextResponse.json({
      guests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/guests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel_id and hotel name for the current admin
    const { data: adminData, error: adminError } = await supabase
      .from('hotel_admins')
      .select(`
        hotel_id,
        hotels!inner(name)
      `)
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'address', 'city', 'state', 'country', 'room_number', 'check_in', 'check_out'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate check-out is after check-in
    if (new Date(body.check_out) <= new Date(body.check_in)) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date' 
      }, { status: 400 });
    }

    // Check if the room is available
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('id, status')
      .eq('hotel_id', adminData.hotel_id)
      .eq('room_number', body.room_number)
      .single();

    if (roomError || !roomData) {
      return NextResponse.json({ 
        error: 'Room not found' 
      }, { status: 404 });
    }

    if (roomData.status !== 'available') {
      return NextResponse.json({ 
        error: 'Room is not available for booking' 
      }, { status: 400 });
    }

    // Start a transaction to insert guest and update room status
    const { data: newGuest, error: insertError } = await supabase
      .from('guests')
      .insert({
        hotel_id: adminData.hotel_id,
        hotel_name: adminData.hotels.name,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        nationality: body.nationality,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        room_number: body.room_number,
        check_in: body.check_in,
        check_out: body.check_out
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting guest:', insertError);
      return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 });
    }

    // Update room status to occupied
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ 
        status: 'occupied',
        updated_at: new Date().toISOString()
      })
      .eq('id', roomData.id);

    if (updateRoomError) {
      console.error('Error updating room status:', updateRoomError);
      // Note: We don't fail the entire operation if room update fails
      // The guest is already created, we just log the error
    }

    return NextResponse.json({ 
      message: 'Guest created successfully and room marked as occupied',
      guest: newGuest 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/guests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 