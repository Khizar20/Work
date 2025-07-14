import { NextResponse } from 'next/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';
import { getDocumentById } from '@/app/utils/document-service';
import { handleApiError } from '@/app/utils/error-handling';
import { createClient } from '@/app/utils/supabase/route';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current authenticated user
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

    // Get document to verify ownership and get file path
    const { document } = await getDocumentById(documentId, hotelAdmin.hotel_id, supabase);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }    // Extract file path from the stored URL
    const fileUrl = document.file_url;
    console.log('Original file URL:', fileUrl);
    
    // The stored URL is a public URL, but we need the storage path for signed URLs
    // Extract the path after '/hotel_documents/' from the public URL
    let filePath;
    
    if (fileUrl.includes('/storage/v1/object/public/hotel_documents/')) {
      // Extract everything after '/public/hotel_documents/'
      filePath = fileUrl.split('/storage/v1/object/public/hotel_documents/')[1];
    } else {
      // Fallback: construct from hotel_id and filename
      const fileName = fileUrl.split('/').pop();
      filePath = `hotel-${document.hotel_id}/${fileName}`;
    }
    
    console.log('Extracted file path for signed URL:', filePath);
    
    // For debugging: Let's check if this exact path exists in storage
    try {
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('hotel_documents')
        .download(filePath);
      
      if (checkError) {
        console.error('File check failed:', checkError);
        
        // If file doesn't exist at expected path, try alternative paths
        const fileName = filePath.split('/').pop();
        const alternatives = [
          `${document.hotel_id}/${fileName}`, // Without 'hotel-' prefix
          fileName, // Just filename
          `hotel_${document.hotel_id}/${fileName}` // With underscore
        ];
        
        for (const altPath of alternatives) {
          console.log('Trying alternative path:', altPath);
          const { error: altError } = await supabase.storage
            .from('hotel_documents')
            .download(altPath);
          
          if (!altError) {
            console.log('✅ Found file at alternative path:', altPath);
            filePath = altPath;
            break;
          }
        }
      } else {
        console.log('✅ File exists at expected path');
      }
    } catch (e) {
      console.log('File existence check failed, proceeding with original path');
    }    // Generate signed URL for viewing (valid for 1 hour)
    // Use service role client for storage operations as it has admin permissions
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
      .from('hotel_documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate view URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      viewUrl: signedUrlData.signedUrl 
    });

  } catch (error) {
    console.error('Error in /api/documents/[id]/view handler:', error);
    const { message, status } = handleApiError(error);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
