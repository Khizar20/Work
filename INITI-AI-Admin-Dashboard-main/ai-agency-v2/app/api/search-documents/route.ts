import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { pipeline } from '@xenova/transformers';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { 
      query, 
      hotel_id, 
      limit = 5, 
      document_id = null, 
      document_ids = null,
      match_threshold = 0.1,
      use_chunks = true // Default to chunk-based search for better semantic results
    } = await request.json();
    
    if (!query || !hotel_id) {
      return NextResponse.json(
        { error: 'Query and hotel_id are required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Searching documents for hotel:', hotel_id);
    console.log('📝 Query:', query);
    console.log('🎯 Document ID:', document_id);
    console.log('🎯 Document IDs:', document_ids);
    console.log('📊 Match threshold:', match_threshold);
    console.log('📊 Limit:', limit);
    console.log('🧩 Use chunks:', use_chunks);
    
    // 1. Generate embedding for the search query
    console.log('🧠 Generating query embedding...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingTensor = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(embeddingTensor.data as Float32Array);
    
    console.log('✅ Query embedding generated, dimensions:', queryEmbedding.length);
    console.log('🔢 First 5 embedding values:', queryEmbedding.slice(0, 5));
    
    // 2. Create Supabase client
    const supabase = await createClient();
    
    // 3. Perform vector similarity search with chunk-based approach
    console.log('🔎 Performing vector similarity search...');
    
    let documents, error;
    
    // Try chunk-based search first if enabled (better semantic matching)
    if (use_chunks) {
      console.log('🧩 Trying chunk-based search first...');
      const chunkSearchParams = {
        query_embedding: queryEmbedding,
        target_hotel_id: hotel_id,
        match_threshold: match_threshold,
        match_count: limit
      };
      
      ({ data: documents, error } = await supabase.rpc('search_documents_with_chunks' as any, chunkSearchParams));
    }
    
    // If chunk search is disabled, fails, or returns no results, fall back to document search
    if (!use_chunks || error || !documents || documents.length === 0) {
      console.log('🔄 Using document-level search...');
      
      if (document_ids && Array.isArray(document_ids)) {
        // Search within multiple specific document IDs
        console.log('🔍 Searching within multiple specific documents');
        const searchParams = {
          query_embedding: queryEmbedding,
          target_hotel_id: hotel_id,
          target_document_ids: document_ids,
          match_threshold: match_threshold,
          match_count: limit
        };
        
        ({ data: documents, error } = await supabase.rpc('search_documents_by_ids' as any, searchParams));
      } else {
        // Search all documents or specific single document
        console.log(document_id ? '🔍 Searching within specific document' : '🔍 Searching all hotel documents');
        const searchParams = {
          query_embedding: queryEmbedding,
          target_hotel_id: hotel_id,
          match_threshold: match_threshold,
          match_count: limit,
          target_document_id: document_id
        };
        
        ({ data: documents, error } = await supabase.rpc('search_documents' as any, searchParams));
      }
    }
    
    if (error) {
      console.error('❌ Vector search error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Database search failed', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Database call successful');
    console.log('📊 Found', documents?.length || 0, 'relevant documents');
    
    if (documents && documents.length > 0) {
      console.log('📄 First result:', JSON.stringify(documents[0], null, 2));
    } else {
      console.log('❌ No documents returned from database');
    }
    
    // 4. Return search results
    return NextResponse.json({
      success: true,
      query: query,
      hotel_id: hotel_id,
      document_id: document_id,
      document_ids: document_ids,
      results: documents || [],
      count: documents?.length || 0,
      search_type: use_chunks && documents && documents.length > 0 && documents[0].chunk_content ? 'rag_chunks' : 
                   document_ids ? 'multiple_documents' : 
                   document_id ? 'single_document' : 'all_documents',
      use_chunks: use_chunks
    });
    
  } catch (error) {
    console.error('❌ Search API error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 