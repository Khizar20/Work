import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { 
      query = "", 
      hotel_id = "8a1e6805-9253-4dd5-8893-0de3d7815555", // Default to your hotel
      limit = 5 
    } = await request.json();
    
    console.log('🔧 Fixed Botpress search:', { query, hotel_id, limit });
    
    const supabase = await createClient();
    
    // Try different approaches to access the documents
    let documents, error;
    
    // Approach 1: Direct query with exact columns from your table
    console.log('1️⃣ Trying direct query with exact columns...');
    ({ data: documents, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        description,
        file_type,
        hotel_id,
        created_at,
        processed
      `)
      .eq('hotel_id', hotel_id)
      .eq('processed', true)
      .limit(limit));
    
    if (error) {
      console.error('❌ Direct query error:', error);
      
      // Approach 2: Try without RLS (using service role if available)
      console.log('2️⃣ Trying simpler query...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type')
        .limit(limit));
    }
    
    if (error) {
      console.error('❌ All queries failed:', error);
      return NextResponse.json(
        { error: 'Database access failed', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Query successful, found:', documents?.length || 0, 'documents');
    
    // Filter by query if provided
    let filteredDocs = documents || [];
    if (query && query.trim() !== '') {
      const queryLower = query.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.title?.toLowerCase().includes(queryLower) ||
        doc.description?.toLowerCase().includes(queryLower)
      );
    }
    
    // Format results for Botpress
    const formattedResults = filteredDocs.map(doc => ({
      id: doc.id,
      title: doc.title || 'Untitled Document',
      content: doc.description || 'No description available',
      type: doc.file_type || 'unknown',
      relevance: 1.0,
      source: `Document: ${doc.title || 'Untitled'}`,
      hotel_id: doc.hotel_id || hotel_id
    }));
    
    console.log('📤 Returning', formattedResults.length, 'formatted results');
    
    return NextResponse.json({
      success: true,
      query: query || 'all',
      hotel_id: hotel_id,
      results: formattedResults,
      count: formattedResults.length,
      search_type: query ? 'text_search' : 'all_documents',
      message: formattedResults.length > 0 
        ? `Found ${formattedResults.length} document(s)`
        : 'No documents found',
      debug: {
        total_documents_found: documents?.length || 0,
        filtered_results: formattedResults.length,
        hotel_id_used: hotel_id
      }
    });
    
  } catch (error) {
    console.error('❌ Fixed Botpress search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 