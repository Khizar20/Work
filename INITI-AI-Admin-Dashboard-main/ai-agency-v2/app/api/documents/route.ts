import { NextResponse } from 'next/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';
import { getHotelDocuments } from '@/app/utils/document-service';
import { handleApiError } from '@/app/utils/error-handling';
import { createClient } from '@/app/utils/supabase/route';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;    const fileType = searchParams.get('fileType') || undefined;    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
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
    }    // Fetch documents for this hotel
    // Option 1: Show ALL hotel documents (admin can see all documents from their hotel)
    const { data, count } = await getHotelDocuments(
      hotelAdmin.hotel_id, 
      {
        limit,
        offset,
        search,
        fileType,
        sortBy,
        sortOrder,
        // Remove uploadedBy filter to show all hotel documents
        // uploadedBy: hotelAdmin.id, // Uncomment this line to show only user's own documents
      },
      supabase // Pass the authenticated server-side client
    );
    
    // Option 2: If you want to show only current user's documents, use:
    // uploadedBy: hotelAdmin.id
    
    return NextResponse.json({
      documents: data,
      total: count
    });  } catch (error) {
    console.error('Error in /api/documents handler:', error);
    const { message, status } = handleApiError(error);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
