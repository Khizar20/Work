// Test database function with exact API parameters
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqfqfzaqeprxtxkihprp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseDirect() {
  console.log('🔍 Testing database function with exact API parameters...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const documentId = "26dd134c-7d00-4a73-903b-af507b3cbeb1";
  
  try {
    // Test 1: Check if the document exists and has embedding
    console.log('1️⃣ Checking if document exists and has embedding...');
    const { data: docCheck, error: docError } = await supabase
      .from('documents')
      .select('id, title, hotel_id')
      .eq('hotel_id', hotelId)
      .eq('id', documentId)
      .not('embedding', 'is', null);
    
    if (docError) {
      console.error('❌ Error checking document:', docError);
      return;
    }
    
    console.log('📄 Document check result:', docCheck);
    
    if (!docCheck || docCheck.length === 0) {
      console.log('❌ Document not found or has no embedding!');
      return;
    }
    
    // Test 2: Test with 384-dimension dummy embedding (same as API generates)
    console.log('\n2️⃣ Testing search function with 384D dummy embedding...');
    const dummyEmbedding = new Array(384).fill(0.1);
    
    const { data: searchResults, error: searchError } = await supabase.rpc('search_documents', {
      query_embedding: dummyEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 5,
      target_document_id: documentId
    });
    
    if (searchError) {
      console.error('❌ Search function error:', searchError);
      console.error('❌ Error details:', JSON.stringify(searchError, null, 2));
      return;
    }
    
    console.log('✅ Search function call successful');
    console.log('📊 Results found:', searchResults?.length || 0);
    
    if (searchResults && searchResults.length > 0) {
      console.log('🎉 SUCCESS! Found results with dummy embedding:');
      searchResults.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
      });
    } else {
      console.log('❌ No results with dummy embedding');
    }
    
    // Test 3: Test without document_id filter (search all documents)
    console.log('\n3️⃣ Testing search function without document filter...');
    const { data: allDocsResults, error: allDocsError } = await supabase.rpc('search_documents', {
      query_embedding: dummyEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 10,
      target_document_id: null
    });
    
    if (allDocsError) {
      console.error('❌ All docs search error:', allDocsError);
      return;
    }
    
    console.log('📊 All docs results found:', allDocsResults?.length || 0);
    
    if (allDocsResults && allDocsResults.length > 0) {
      console.log('🎉 Found results when searching all documents:');
      allDocsResults.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id}) - similarity: ${doc.similarity}`);
      });
    } else {
      console.log('❌ No results even when searching all documents');
    }
    
    // Test 4: Check all documents with embeddings
    console.log('\n4️⃣ Checking all documents with embeddings in this hotel...');
    const { data: allDocs, error: allDocsCheckError } = await supabase
      .from('documents')
      .select('id, title, hotel_id')
      .eq('hotel_id', hotelId)
      .not('embedding', 'is', null);
    
    if (allDocsCheckError) {
      console.error('❌ Error checking all documents:', allDocsCheckError);
      return;
    }
    
    console.log('📄 Documents with embeddings:', allDocs?.length || 0);
    if (allDocs && allDocs.length > 0) {
      allDocs.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Run the test
testDatabaseDirect(); 