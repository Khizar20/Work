const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqfqfzaqeprxtxkihprp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmbeddingGeneration() {
  console.log('🧪 Testing embedding generation and database search...\n');
  
  // Test 1: Generate embedding using API method
  console.log('1️⃣ Testing API call...');
  try {
    const apiResponse = await fetch('http://localhost:3000/api/search-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "hotel information",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        match_threshold: 0.0,
        limit: 10
      })
    });
    
    const apiResult = await apiResponse.json();
    console.log('API Result:', JSON.stringify(apiResult, null, 2));
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
  
  // Test 2: Direct database call using known working SQL
  console.log('\n2️⃣ Testing direct database call...');
  try {
    const { data: dbResults, error: dbError } = await supabase.rpc('search_documents', {
      query_embedding: [0.1, 0.2, 0.3], // Dummy embedding for testing
      target_hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
      match_threshold: 0.0,
      match_count: 10,
      target_document_id: null
    });
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
    } else {
      console.log('✅ Database results:', JSON.stringify(dbResults, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
  
  // Test 3: Check if documents exist with embeddings
  console.log('\n3️⃣ Checking documents with embeddings...');
  try {
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id, title, hotel_id')
      .eq('hotel_id', "8a1e6805-9253-4dd5-8893-0de3d7815555")
      .not('embedding', 'is', null);
    
    if (docsError) {
      console.error('❌ Documents query error:', docsError);
    } else {
      console.log('✅ Documents with embeddings:', JSON.stringify(docs, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Documents check failed:', error.message);
  }
  
  // Test 4: Test the search function manually with a real embedding
  console.log('\n4️⃣ Testing with real document embedding...');
  try {
    // First get a real embedding from one of the documents
    const { data: docWithEmbedding, error: embError } = await supabase
      .from('documents')
      .select('id, title, embedding')
      .eq('hotel_id', "8a1e6805-9253-4dd5-8893-0de3d7815555")
      .not('embedding', 'is', null)
      .limit(1)
      .single();
    
    if (embError || !docWithEmbedding) {
      console.error('❌ Could not get document with embedding:', embError);
      return;
    }
    
    console.log('📄 Using embedding from document:', docWithEmbedding.title);
    
    // Use this real embedding to search
    const { data: realSearchResults, error: realSearchError } = await supabase.rpc('search_documents', {
      query_embedding: docWithEmbedding.embedding,
      target_hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
      match_threshold: 0.0,
      match_count: 10,
      target_document_id: null
    });
    
    if (realSearchError) {
      console.error('❌ Real embedding search error:', realSearchError);
    } else {
      console.log('✅ Real embedding search results:', JSON.stringify(realSearchResults, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Real embedding test failed:', error.message);
  }
}

// Run the test
testEmbeddingGeneration(); 