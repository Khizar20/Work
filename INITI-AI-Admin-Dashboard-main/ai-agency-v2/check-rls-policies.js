// Check if RLS policies are blocking the search results
const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS for testing
const supabaseUrl = 'https://aqfqfzaqeprxtxkihprp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS policies and permissions...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const documentId = "26dd134c-7d00-4a73-903b-af507b3cbeb1";
  
  try {
    // Test with anon key (same as API uses)
    console.log('1️⃣ Testing with anon key (same as API)...');
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check if we can see documents directly (without RPC)
    const { data: directDocs, error: directError } = await supabaseAnon
      .from('documents')
      .select('id, title, hotel_id, file_type, description')
      .eq('hotel_id', hotelId)
      .limit(5);
    
    if (directError) {
      console.error('❌ Direct documents query error:', directError);
    } else {
      console.log('✅ Direct documents query successful');
      console.log('📄 Documents visible:', directDocs?.length || 0);
      if (directDocs && directDocs.length > 0) {
        directDocs.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id})`);
        });
      }
    }
    
    // Test the specific document
    console.log('\n2️⃣ Testing specific document access...');
    const { data: specificDoc, error: specificError } = await supabaseAnon
      .from('documents')
      .select('id, title, hotel_id, file_type, description')
      .eq('id', documentId)
      .single();
    
    if (specificError) {
      console.error('❌ Specific document query error:', specificError);
    } else {
      console.log('✅ Specific document query successful');
      console.log('📄 Document:', specificDoc);
    }
    
    // Test search function with simple parameters
    console.log('\n3️⃣ Testing search function with anon key...');
    const dummyEmbedding = new Array(384).fill(0.1);
    
    const { data: searchResults, error: searchError } = await supabaseAnon.rpc('search_documents', {
      query_embedding: dummyEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 5,
      target_document_id: null // Search all documents first
    });
    
    if (searchError) {
      console.error('❌ Search function error with anon key:', searchError);
    } else {
      console.log('✅ Search function successful with anon key');
      console.log('📊 Results:', searchResults?.length || 0);
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
        });
      }
    }
    
    // Test if the function exists and is accessible
    console.log('\n4️⃣ Testing function accessibility...');
    const { data: functionTest, error: functionError } = await supabaseAnon.rpc('search_documents', {
      query_embedding: [0.1, 0.2, 0.3], // Simple 3D embedding
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 1,
      target_document_id: null
    });
    
    if (functionError) {
      console.error('❌ Function accessibility error:', functionError);
      console.log('🔍 This suggests the function might not be accessible or have wrong signature');
    } else {
      console.log('✅ Function is accessible');
      console.log('📊 Function test results:', functionTest?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
checkRLSPolicies(); 