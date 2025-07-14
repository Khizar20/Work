import { NextResponse } from 'next/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';
import { createClient } from '@/app/utils/supabase/route';

/**
 * Test API endpoint to verify Supabase connection and authentication
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
      // Get the current authenticated user (secure method)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', authenticated: false },
        { status: 401 }
      );
    }    // Get the hotel admin info to confirm association
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      return NextResponse.json(        { 
          error: 'User is not associated with any hotel', 
          authenticated: true,
          userHasHotel: false,
          user: {
            id: user.id,
            email: user.email
          }
        },
        { status: 403 }
      );
    }
    
    // Get hotel details
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, slug')
      .eq('id', hotelAdmin.hotel_id)
      .single();
    
    if (hotelError) {
      return NextResponse.json(
        { 
          error: 'Error fetching hotel information',          authenticated: true,
          userHasHotel: true,
          hotelAdminInfo: hotelAdmin,
          user: {
            id: user.id,
            email: user.email
          }
        },
        { status: 500 }
      );
    }
    
    // Count documents
    const { count: documentCount, error: countError } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('hotel_id', hotelAdmin.hotel_id);
    
    // Test successful
    return NextResponse.json({      success: true,
      authenticated: true,
      userHasHotel: true,
      user: {
        id: user.id,
        email: user.email
      },
      hotelAdmin: {
        id: hotelAdmin.id,
        role: hotelAdmin.role
      },
      hotel: {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug
      },
      documentCount: documentCount || 0,
      apiConnectionStatus: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/test-connection handler:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        apiConnectionStatus: 'Error',
        errorDetails: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
