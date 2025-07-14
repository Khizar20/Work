import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { processSupabaseError, processStorageError } from './error-handling';
import { Json } from './database.types';

export interface DocumentMetadata {
  title: string;
  description?: string;
  hotelId: string;
  documentType: string;
  tags?: string[];
  language?: string;
  [key: string]: any;
}

export interface UploadedDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  description?: string | null;
  metadata?: DocumentMetadata | Json | null;
  vectorId?: string | null;
  hotelId: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload a document to Supabase storage and record its metadata
 */
export async function uploadHotelDocument(
  userId: string, 
  hotelId: string, 
  file: File, 
  metadata: DocumentMetadata
): Promise<{ data: UploadedDocument | null; error: string | null }> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${hotelId}/${fileName}`;    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('hotel_documents')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the file URL
    const { data: urlData } = supabase.storage
      .from('hotel_documents')
      .getPublicUrl(filePath);
      
    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    // Save document metadata to the database
    const documentData = {
      hotel_id: hotelId,
      uploaded_by: userId,
      title: metadata.title || file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      description: metadata.description || null,
      metadata: metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      processed: false
    };
    
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select('*')
      .single();
      
    if (docError) throw docError;
    
    // Queue the document for processing by the vector database service
    // This would typically be handled by a serverless function or webhook
    // For now, we'll just return the document data
      return { 
      data: {
        id: docData.id,
        title: docData.title,
        fileUrl: docData.file_url,
        fileType: docData.file_type,
        description: docData.description || undefined,
        metadata: docData.metadata || undefined,
        vectorId: docData.vector_id || undefined,
        hotelId: docData.hotel_id,
        uploadedBy: docData.uploaded_by,
        createdAt: docData.created_at,
        updatedAt: docData.updated_at
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { data: null, error: processStorageError(error) };
  }
}

/**
 * Get a list of documents for a specific hotel
 */
export async function getHotelDocuments(
  hotelId: string
): Promise<{ data: UploadedDocument[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (!data) return { data: [], error: null };
      const documents: UploadedDocument[] = data.map(doc => ({
      id: doc.id,
      title: doc.title,
      fileUrl: doc.file_url,
      fileType: doc.file_type,
      description: doc.description || undefined,
      metadata: doc.metadata || undefined,
      vectorId: doc.vector_id || undefined,
      hotelId: doc.hotel_id,
      uploadedBy: doc.uploaded_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    }));
    
    return { data: documents, error: null };
  } catch (error) {
    console.error('Error getting hotel documents:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get the document first to get the file path
    const { data: document, error: getError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
      
    if (getError) throw getError;
    
    if (!document) {
      throw new Error('Document not found');
    }    // Delete from storage
    const filePath = document.file_url.split('hotel_documents/')[1];
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('hotel_documents')
        .remove([filePath]);
        
      if (storageError) {
        console.warn('Error removing file from storage:', storageError);
      }
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
      
    if (deleteError) throw deleteError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: processSupabaseError(error) };
  }
}
