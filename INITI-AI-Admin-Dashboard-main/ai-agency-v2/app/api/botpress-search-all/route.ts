import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { 
      query = "", 
      limit = 5 
    } = await request.json();
    
    console.log('🤖 Botpress search ALL documents:', { query, limit });
    
    const supabase = await createClient();
    
    let documents, error;
    
    if (!query || query.trim() === '') {
      // Get all documents
      console.log('📄 Getting all documents...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type, hotel_id, created_at')
        .limit(limit));
    } else {
      // Search all documents with query
      console.log('🔍 Searching ALL documents with query...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type, hotel_id, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit));
    }
    
    if (error) {
      console.error('❌ Botpress search error:', error);
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Found:', documents?.length || 0, 'documents');
    
    // Format results for Botpress
    const formattedResults = (documents || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.description || 'No description available',
      type: doc.file_type,
      hotel_id: doc.hotel_id,
      relevance: query && doc.title?.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.8,
      source: `Document: ${doc.title}`,
      created_at: doc.created_at
    }));
    
    return NextResponse.json({
      success: true,
      query: query || 'all',
      results: formattedResults,
      count: formattedResults.length,
      search_type: query ? 'text_search_all' : 'all_documents',
      message: formattedResults.length > 0 
        ? `Found ${formattedResults.length} document(s) across all hotels`
        : 'No documents found in database'
    });
    
  } catch (error) {
    console.error('❌ Botpress search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 