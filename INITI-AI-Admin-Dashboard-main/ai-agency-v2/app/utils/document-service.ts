import { supabase } from './supabase';
import { processSupabaseError } from './error-handling';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Document = {
  id: string;
  hotel_id: string;
  uploaded_by: string;
  title: string;
  file_url: string;
  file_type: string;
  description: string | null;
  processed: boolean;
  created_at: string;
  updated_at: string;
  uploader?: {
    id: string;
    user_id: string;
    role: string;
  };
};

/**
 * Fetch documents for a specific hotel
 */
export const getHotelDocuments = async (
  hotelId: string,
  options: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    fileType?: string;
    uploadedBy?: string; // Add filter for specific uploader
  } = {},
  supabaseClient?: SupabaseClient // Accept optional server-side client
): Promise<{ data: Document[]; count: number; error?: string }> => {
  try {
    const {
      limit = 10,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
      fileType,
      uploadedBy,
    } = options;

    // Use provided client or fallback to default
    const client = supabaseClient || supabase;    // Build query with simplified join to avoid schema cache issues
    let query = client
      .from('documents')
      .select(`
        *,
        uploader:hotel_admins!uploaded_by (
          id,
          user_id,
          role
        )
      `, { count: 'exact' });

    // Add default filters
    // @ts-ignore: Type issue with Supabase client
    query = query.eq('hotel_id', hotelId);
    
    // Filter by uploader if specified (for user-specific documents)
    if (uploadedBy) {
      // @ts-ignore: Type issue with Supabase client
      query = query.eq('uploaded_by', uploadedBy);
    }
    
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    // Add optional filters if provided
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (fileType) {
      // @ts-ignore: Type issue with Supabase client
      query = query.eq('file_type', fileType);
    }

    const { data, error, count } = await query;

    if (error) {
      const errorMessage = processSupabaseError(error);
      console.error('Error fetching documents:', errorMessage);
      return { data: [], count: 0, error: errorMessage };
    }

    return { 
      data: data as any as Document[], 
      count: count || 0 
    };
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Error in getHotelDocuments:', errorMessage);
    return { data: [], count: 0, error: errorMessage };
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (
  documentId: string, 
  hotelId?: string,
  supabaseClient?: SupabaseClient // Accept optional server-side client
): Promise<{ document: Document | null; error?: string }> => {
  try {
    // Use provided client or fallback to default
    const client = supabaseClient || supabase;
      // Create the query with simplified join
    let query = client
      .from('documents')
      .select(`
        *,
        uploader:hotel_admins!uploaded_by (
          id,
          user_id,
          role
        )
      `)
      // @ts-ignore: Type issue with Supabase client
      .eq('id', documentId);
    
    // Add hotel filter if provided (for added security)
    if (hotelId) {
      // @ts-ignore: Type issue with Supabase client
      query = query.eq('hotel_id', hotelId);
    }
    
    // Execute query
    const { data, error } = await query.single();

    if (error) {
      const errorMessage = processSupabaseError(error);
      console.error('Error fetching document:', errorMessage);
      return { document: null, error: errorMessage };
    }

    return { document: data as any as Document };
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Error in getDocumentById:', errorMessage);
    return { document: null, error: errorMessage };
  }
};

/**
 * Delete a document by ID (with archiving)
 */
export const deleteDocument = async (
  documentId: string,
  supabaseClient?: SupabaseClient, // Accept optional server-side client
  deletedBy?: string // Hotel admin ID of who is deleting
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use provided client or fallback to default
    const client = supabaseClient || supabase;
    
    // First get the complete document to archive it
    const { data: document, error: fetchError } = await client
      .from('documents')
      .select('*')
      // @ts-ignore: Type issue with Supabase client
      .eq('id', documentId)
      .single();
    
    if (fetchError || !document) {
      const errorMessage = processSupabaseError(fetchError);
      console.error('Error fetching document for deletion:', errorMessage);
      return { success: false, error: errorMessage };
    }

    // Archive the document before deletion
    if (deletedBy) {
      const archiveData = {
        original_document_id: document.id,
        hotel_id: document.hotel_id,
        uploaded_by: document.uploaded_by,
        title: document.title,
        file_url: document.file_url,
        file_type: document.file_type,
        description: document.description,
        processed: document.processed,
        original_created_at: document.created_at,
        original_updated_at: document.updated_at,
        metadata: document.metadata,
        vector_id: document.vector_id,
        deleted_by: deletedBy,
        storage_path: `hotel-${document.hotel_id}/${document.file_url.split('/').pop()}`,
        file_size: null // We could get this from storage metadata if needed
      };

      const { error: archiveError } = await client
        .from('deleted_documents')
        .insert(archiveData);

      if (archiveError) {
        console.error('Error archiving document:', processSupabaseError(archiveError));
        // Continue with deletion even if archiving fails
      } else {
        console.log('✅ Document archived successfully');
      }
    }// Extract filename from the URL with improved parsing
    const fileUrl = (document as any).file_url;
    console.log('Delete - Original file URL:', fileUrl);
    
    // Handle different URL formats based on your storage setup
    let filePath;
    if (fileUrl.includes('/storage/v1/object/public/hotel_documents/')) {
      // Public URL format: extract path after /public/hotel_documents/
      filePath = fileUrl.split('/storage/v1/object/public/hotel_documents/')[1];
    } else if (fileUrl.includes('/hotel_documents/')) {
      // Direct path format
      filePath = fileUrl.split('/hotel_documents/')[1];
    } else {
      // Fallback: construct from hotel_id and filename
      // Based on debug info, the format is: hotel-{hotel_id}/{filename}
      const fileName = fileUrl.split('/').pop();
      // We need the hotel_id - let's get it from the document
      const docWithHotel = await client
        .from('documents')
        .select('hotel_id')
        .eq('id', documentId)
        .single();
      
      if (docWithHotel.data) {
        filePath = `hotel-${docWithHotel.data.hotel_id}/${fileName}`;
      } else {
        filePath = fileName; // Last resort
      }
    }
    
    console.log('Delete - Extracted file path:', filePath);
      // Delete from storage
    const { error: storageError } = await client.storage
      .from('hotel_documents')
      .remove([filePath]);
    
    if (storageError) {
      const errorMessage = processSupabaseError(storageError);
      console.error('Error deleting file from storage:', errorMessage);
      // Continue with deleting the record even if file delete fails
    }
    
    // Delete record from database
    const { error: dbError } = await client
      .from('documents')
      .delete()
      // @ts-ignore: Type issue with Supabase client
      .eq('id', documentId);
    
    if (dbError) {
      const errorMessage = processSupabaseError(dbError);
      console.error('Error deleting document record:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Error in deleteDocument:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Upload a new document
 */
export const uploadDocument = async (
  hotelId: string,
  adminId: string,
  file: File,
  metadata: {
    title: string;
    description?: string;
  }
): Promise<{ document: Document | null; error?: string }> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `${hotelId}/${uniqueFileName}`;
      // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hotel_documents')
      .upload(filePath, file);
    
    if (uploadError) {
      const errorMessage = processSupabaseError(uploadError);
      console.error('Error uploading document:', errorMessage);
      return { document: null, error: errorMessage };
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('hotel_documents')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      return { document: null, error: 'Failed to generate public URL for document' };
    }
    
    // Prepare insert data
    const documentInsertData = {
      hotel_id: hotelId,
      uploaded_by: adminId,
      title: metadata.title,
      description: metadata.description || null,
      file_url: urlData.publicUrl,
      file_type: fileExtension.toLowerCase()
    };
      // Insert record in database
    // @ts-ignore: Type issue with Supabase client
    const { data: documentData, error: insertError } = await supabase
      .from('documents')
      // @ts-ignore: Type issue with Supabase client
      .insert(documentInsertData)
      .select()
      .single();
    
    if (insertError) {
      const errorMessage = processSupabaseError(insertError);
      console.error('Error inserting document record:', errorMessage);
      return { document: null, error: errorMessage };
    }
    
    return { document: documentData as any as Document };
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Error in uploadDocument:', errorMessage);
    return { document: null, error: errorMessage };
  }
};

/**
 * Update document metadata
 */
export const updateDocument = async (
  documentId: string,
  updates: {
    title?: string;
    description?: string | null;
  },
  supabaseClient?: SupabaseClient // Accept optional server-side client
): Promise<{ success: boolean; document?: Document; error?: string }> => {
  try {
    // Use provided client or fallback to default
    const client = supabaseClient || supabase;
    
    // Update the document metadata with updated timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
      // Perform update
    // @ts-ignore: Type issue with Supabase client
    const { data, error } = await client
      .from('documents')
      // @ts-ignore: Type issue with Supabase client
      .update(updateData)
      // @ts-ignore: Type issue with Supabase client
      .eq('id', documentId)      .select(`
        *,
        uploader:hotel_admins!uploaded_by (
          id,
          user_id,
          role
        )
      `)
      .single();
    
    if (error) {
      const errorMessage = processSupabaseError(error);
      console.error('Error updating document:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true, document: data as any as Document };
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Error in updateDocument:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
