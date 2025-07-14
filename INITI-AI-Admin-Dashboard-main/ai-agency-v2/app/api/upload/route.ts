import { NextResponse } from 'next/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';
import { uploadDocument } from '@/app/utils/document-upload';
import { handleApiError } from '@/app/utils/error-handling';
import { createClient } from '@/app/utils/supabase/route';

// Configure runtime for handling larger uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout for large file processing

export async function POST(request: Request) {
  try {
    // Log Supabase env variables for debugging
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const supabase = await createClient();
    
    // Get the current authenticated user (secure method)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Authenticated user:', user.id);
    
    // Get the hotel admin info (pass server-side client)
    const hotelAdmin = await getHotelAdmin(user, supabase);
    
    if (!hotelAdmin) {
      console.log('No hotel admin found for user:', user.id);
      console.log('User email:', user.email);
      
      // Let's help with debugging by suggesting next steps
      return NextResponse.json(
        { 
          error: 'User is not associated with any hotel',
          details: {
            userId: user.id,
            email: user.email,
            suggestion: 'Please ensure this user has a record in the hotel_admins table'
          }
        },
        { status: 403 }
      );
    }
    
    console.log('Found hotel admin:', { 
      id: hotelAdmin.id, 
      hotel_id: hotelAdmin.hotel_id, 
      role: hotelAdmin.role 
    });
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | undefined;
    
    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing required file or title' },
        { status: 400 }
      );
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
        { status: 413 }
      );
    }
    
    // Upload the document
    const result = await uploadDocument(file, {
      hotel_id: hotelAdmin.hotel_id,
      uploaded_by: hotelAdmin.id,
      title,
      file_type: file.type,
      description
    }, supabase); // Pass the server-side client
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      documentId: result.documentId 
    });
  } catch (error) {
    console.error('Error in /api/upload handler:', error);
    // Always return JSON, even for unexpected errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
