import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Optional query parameters
    const available = searchParams.get('available') !== 'false'; // Default to true
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';
    const search = searchParams.get('search') || '';
    
    const supabase = createClient();
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel admin info to determine which hotel's items to fetch
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json({ error: 'Hotel admin not found' }, { status: 403 });
    }

    console.log('🍽️ Fetching room service items for hotel:', hotelAdmin.hotel_id);

    // Build the query
    let query = supabase
      .from('room_service_items')
      .select('*')
      .eq('hotel_id', hotelAdmin.hotel_id);

    // Filter by availability if specified
    if (available) {
      query = query.eq('available', true);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add sorting and limit
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(limit);

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching room service items:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch room service items',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Found', items?.length || 0, 'room service items');

    // Return the items with metadata
    return NextResponse.json({
      success: true,
      data: items || [],
      count: items?.length || 0,
      hotel_id: hotelAdmin.hotel_id,
      filters: {
        available,
        search,
        sortBy,
        sortOrder,
        limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in room service API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for creating new room service items (optional)
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel admin info
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json({ error: 'Hotel admin not found' }, { status: 403 });
    }

    const itemData = await request.json();

    // Validate required fields
    if (!itemData.name || !itemData.price) {
      return NextResponse.json({ 
        error: 'Missing required fields: name and price are required' 
      }, { status: 400 });
    }

    // Create new room service item
    const { data: newItem, error } = await supabase
      .from('room_service_items')
      .insert({
        hotel_id: hotelAdmin.hotel_id,
        name: itemData.name,
        description: itemData.description || null,
        price: parseFloat(itemData.price),
        available: itemData.available !== false, // Default to true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room service item:', error);
      return NextResponse.json({ 
        error: 'Failed to create room service item',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Created new room service item:', newItem.id);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Room service item created successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating room service item:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 