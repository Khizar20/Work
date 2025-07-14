import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { processStorageError, processSupabaseError } from './error-handling';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import PDFParser from 'pdf2json';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import os from 'os';

export type FileUploadMetadata = {
  hotel_id: string;
  uploaded_by: string;
  title: string;
  file_type: string;
  description?: string;
};

/**
 * Uploads a file to the Supabase storage and adds a record in the documents table
 */
export const uploadDocument = async (
  file: File, 
  metadata: FileUploadMetadata,
  supabaseClient?: SupabaseClient<Database>
): Promise<{ success: boolean; documentId?: string; error?: string }> => {
  const client = supabaseClient || supabase;
  
  try {
    console.log('📤 Starting document upload process...');
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { success: false, error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit` };
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const filePath = `hotel-${metadata.hotel_id}/${uniqueFileName}`;
    const fileUrl = filePath;

    console.log('📁 File path:', filePath);

    // Upload file to Supabase Storage
    const { error: uploadError } = await client.storage
      .from('hotel_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      const errorMessage = processStorageError(uploadError);
      return { success: false, error: `Failed to upload file: ${errorMessage}` };
    }

    console.log('✅ File uploaded to storage successfully');

    // Insert record into documents table
    const { data: documentData, error: documentError } = await client
      .from('documents')
      .insert({
        hotel_id: metadata.hotel_id,
        uploaded_by: metadata.uploaded_by,
        title: metadata.title,
        file_url: fileUrl,
        file_type: fileExt,
        description: metadata.description || null,
        processed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    
    if (documentError) {
      console.error('❌ Error creating document record:', documentError);
      // Try to delete the uploaded file since document creation failed
      await client.storage.from('hotel_documents').remove([filePath]);
      const errorMessage = processSupabaseError(documentError);
      return { success: false, error: `Failed to create document record: ${errorMessage}` };
    }

    const documentId = (documentData as any).id;
    console.log('✅ Document record created with ID:', documentId);

    // === NEW: PDF Processing and Embedding Generation ===
    if (fileExt === 'pdf') {
      console.log('📄 Starting PDF processing for embeddings...');
      
      // Process PDF in background - don't block the upload response
      setImmediate(async () => {
        await processPDFEmbedding(client, documentId, filePath);
      });
    }
    // === END NEW ===

    return { 
      success: true, 
      documentId: documentId 
    };
  } catch (error) {
    console.error('❌ Unexpected error in uploadDocument:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Process PDF for embedding generation (runs asynchronously)
 */
async function processPDFEmbedding(client: SupabaseClient<Database>, documentId: string, filePath: string) {
  console.log('🔄 Starting background PDF processing for document:', documentId);
  
  try {
    // 1. Download the file from storage
    console.log('📥 Downloading PDF from storage...');
    const { data: fileData, error: downloadError } = await client.storage
      .from('hotel_documents')
      .download(filePath);
    
    if (downloadError) {
      console.error('❌ Failed to download PDF for processing:', downloadError);
      return;
    }
    
    console.log('✅ PDF downloaded, size:', fileData.size);
    
    // 2. Write to temporary file
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join(os.tmpdir(), `pdf-${documentId}-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);
    console.log('💾 Temporary file created:', tempFilePath);
    
    // 3. Extract text from PDF
    console.log('📖 Extracting text from PDF...');
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from PDF data
          const textContent = pdfData.Pages?.map((page: any) => 
            page.Texts?.map((text: any) => 
              decodeURIComponent(text.R?.[0]?.T || '')
            ).join(' ')
          ).join(' ') || '';
          
          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.loadPDF(tempFilePath);
    });
    
    console.log('✅ Text extracted, length:', text.length);
    console.log('📝 Text preview:', text.substring(0, 100) + '...');
    
    // 4. Generate embedding
    if (text && text.trim().length > 0) {
      console.log('🧠 Generating embedding...');
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const embeddingTensor = await extractor(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(embeddingTensor.data as Float32Array);
      
      console.log('✅ Embedding generated, dimensions:', embedding.length);
      
      // 5. Store embedding in database
      console.log('💾 Storing embedding in database...');
      const { error: updateError } = await client
        .from('documents')
        .update({ 
          embedding: embedding,
          processed: true 
        })
        .eq('id', documentId);
      
      if (updateError) {
        console.error('❌ Failed to store embedding:', updateError);
      } else {
        console.log('✅ Embedding stored successfully for document:', documentId);
      }
    } else {
      console.log('⚠️ No text extracted from PDF, marking as processed without embedding');
      await client
        .from('documents')
        .update({ processed: true })
        .eq('id', documentId);
    }
    
    // 6. Clean up temporary file
    fs.unlinkSync(tempFilePath);
    console.log('🧹 Temporary file cleaned up');
    
  } catch (error) {
    console.error('❌ PDF processing failed for document', documentId, ':', error);
    
    // Mark as processed even if embedding failed
    try {
      await client
        .from('documents')
        .update({ processed: true })
        .eq('id', documentId);
    } catch (updateError) {
      console.error('❌ Failed to mark document as processed:', updateError);
    }
  }
}
