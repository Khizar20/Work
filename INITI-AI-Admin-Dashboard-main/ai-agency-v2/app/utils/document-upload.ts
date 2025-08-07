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
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import fetch from 'node-fetch';

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

    // After upload, if metadata.menuUpload is true, extract text and process menu
    if (metadata.menuUpload) {
      try {
        const text = await extractTextFromFile(file, fileExt);
        if (text && text.length > 20) {
          const menuItems = await sendTextToGroqLLM(text);
          if (Array.isArray(menuItems) && menuItems.length > 0) {
            await insertMenuItemsToSupabase(menuItems, metadata.hotel_id, client);
            console.log('✅ Menu items inserted to room_service_items');
          } else {
            console.warn('⚠️ No menu items found by LLM');
          }
        } else {
          console.warn('⚠️ No text extracted from menu file');
        }
      } catch (err) {
        console.error('❌ Error processing menu upload:', err);
      }
    }

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
      
      // 5. Store embedding and content in database
      console.log('💾 Storing embedding and content in database...');
      const { error: updateError } = await client
        .from('documents')
        .update({ 
          embedding: embedding,
          content: text, // Store the extracted text content
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

// Extract text from file (image, pdf, docx)
async function extractTextFromFile(file: File, fileExt: string) {
  if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
    // OCR for images
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  } else if (fileExt === 'pdf') {
    // Use PDFParser (already in use)
    return await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser();
      const tempFilePath = path.join(os.tmpdir(), `menu-upload-${Date.now()}.pdf`);
      file.arrayBuffer().then(arrayBuffer => {
        fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
        pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            const textContent = pdfData.Pages?.map((page: any) =>
              page.Texts?.map((text: any) => decodeURIComponent(text.R?.[0]?.T || '')).join(' ')
            ).join(' ') || '';
            fs.unlinkSync(tempFilePath);
            resolve(textContent);
          } catch (e: any) { reject(e); }
        });
        pdfParser.loadPDF(tempFilePath);
      });
    });
  } else if (fileExt === 'docx') {
    // Use mammoth for DOCX
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return result.value;
  }
  return '';
}

// Send extracted text to Groq LLM to get structured menu items
async function sendTextToGroqLLM(text: string) {
  const apiKey = process.env.GROQ_API_KEY;
  const prompt = `Extract all menu items from the following text and return them as a JSON array. Each item should have: name (string), price (number), available (bool, default true), and description (string if available).\nText:\n${text}`;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts menu items from text and returns a JSON array.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2048,
      temperature: 0.2
    })
  });
  const data = await response.json();
  // Try to parse JSON from the LLM response
  let menuItems: any[] = [];
  try {
    const match = data.choices[0].message.content.match(/\[.*\]/s);
    if (match) {
      menuItems = JSON.parse(match[0]);
    }
  } catch (e) {
    // fallback: try to parse whole content
    try { menuItems = JSON.parse(data.choices[0].message.content); } catch {}
  }
  return menuItems;
}

// Insert menu items into Supabase
async function insertMenuItemsToSupabase(menuItems: any[], hotelId: string, supabaseClient: SupabaseClient<Database>) {
  for (const item of menuItems) {
    if (!item.name || !item.price) continue;
    await supabaseClient.from('room_service_items').insert({
      hotel_id: hotelId,
      name: item.name,
      price: item.price,
      available: item.available !== false,
      description: item.description || null
    });
  }
}
