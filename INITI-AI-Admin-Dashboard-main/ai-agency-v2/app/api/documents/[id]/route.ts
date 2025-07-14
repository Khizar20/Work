import { NextResponse } from 'next/server';
import { getHotelAdmin } from '@/app/utils/hotel-admin';
import { deleteDocument, getDocumentById } from '@/app/utils/document-service';
import { handleApiError } from '@/app/utils/error-handling';
import { createClient } from '@/app/utils/supabase/route';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );    }    const supabase = await createClient();
    
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
    }    // Get document to verify ownership
    // Pass the hotel ID to ensure we only get documents from this hotel
    const { document } = await getDocumentById(documentId, hotelAdmin.hotel_id, supabase);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Verify the document was uploaded by the current user
    if (document.uploaded_by !== hotelAdmin.id) {
      return NextResponse.json(
        { error: 'You can only delete documents you uploaded' },
        { status: 403 }
      );
    }    // Delete the document (with archiving)
    const { success } = await deleteDocument(documentId, supabase, hotelAdmin.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });  } catch (error) {
    console.error('Error in /api/documents/[id] DELETE handler:', error);
    const { message, status } = handleApiError(error);
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
