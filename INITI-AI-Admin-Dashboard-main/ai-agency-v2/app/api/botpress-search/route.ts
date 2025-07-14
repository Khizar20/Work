import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { 
      query, 
      hotel_id, 
      limit = 5 
    } = await request.json();
    
    if (!hotel_id) {
      return NextResponse.json(
        { error: 'hotel_id is required' },
        { status: 400 }
      );
    }
    
    console.log('🤖 Botpress search request:', { query, hotel_id, limit });
    
    const supabase = await createClient();
    
    let documents, error;
    
    if (!query || query.trim() === '') {
      // If no query, return all documents for the hotel
      console.log('📄 Getting all documents for hotel...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type, hotel_id, created_at')
        .eq('hotel_id', hotel_id)
        .limit(limit));
    } else {
      // Search with query
      console.log('🔍 Searching documents with query...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type, hotel_id, created_at')
        .eq('hotel_id', hotel_id)
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
    
    console.log('✅ Botpress search found:', documents?.length || 0, 'documents');
    
    // If no results with search, try getting all documents
    if (query && (!documents || documents.length === 0)) {
      console.log('🔄 No search results, trying to get all documents...');
      ({ data: documents, error } = await supabase
        .from('documents')
        .select('id, title, description, file_type, hotel_id, created_at')
        .eq('hotel_id', hotel_id)
        .limit(limit));
      
      if (error) {
        console.error('❌ Error getting all documents:', error);
      } else {
        console.log('📄 Found', documents?.length || 0, 'total documents');
      }
    }
    
    // Format results for Botpress
    const formattedResults = (documents || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.description || 'No description available',
      type: doc.file_type,
      relevance: query && doc.title?.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.8,
      source: `Document: ${doc.title}`,
      created_at: doc.created_at
    }));
    
    return NextResponse.json({
      success: true,
      query: query || 'all',
      hotel_id: hotel_id,
      results: formattedResults,
      count: formattedResults.length,
      search_type: query ? 'text_search' : 'all_documents',
      message: formattedResults.length > 0 
        ? `Found ${formattedResults.length} document(s)`
        : 'No documents found for this hotel'
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