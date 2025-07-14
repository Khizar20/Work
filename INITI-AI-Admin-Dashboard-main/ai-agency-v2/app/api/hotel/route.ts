import { NextResponse } from 'next/server';
import { getHotelAdmin, getHotelByAdmin } from '@/app/utils/hotel-admin';
import { createClient } from '@/app/utils/supabase/route';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current authenticated user (secure method)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
      // Get the hotel admin info
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json(
        { error: 'User is not associated with any hotel' },
        { status: 403 }
      );
    }
    
    // Get the hotel details
    const hotel = await getHotelByAdmin(hotelAdmin, supabase);
    
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
      // Return combined data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        userMetadata: user.user_metadata,
      },
      admin: hotelAdmin,
      hotel: hotel
    });
  } catch (error) {
    console.error('Error in /api/hotel handler:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
