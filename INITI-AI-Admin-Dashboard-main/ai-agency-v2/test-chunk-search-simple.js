// Simple test for chunk search function
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChunkSearch() {
  console.log('🧪 Testing chunk search function...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  try {
    // Test the function with a dummy embedding
    console.log('🔍 Testing search_documents_with_chunks function...');
    
    // Create a dummy embedding (384 dimensions of zeros)
    const dummyEmbedding = new Array(384).fill(0);
    
    const { data: searchResult, error: searchError } = await supabase.rpc('search_documents_with_chunks', {
      query_embedding: dummyEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 3
    });
    
    if (searchError) {
      console.error('❌ Search function error:', searchError);
      console.error('❌ Error details:', JSON.stringify(searchError, null, 2));
      
      // Try the regular search function as fallback
      console.log('\n🔄 Trying regular search function...');
      const { data: fallbackResult, error: fallbackError } = await supabase.rpc('search_documents', {
        query_embedding: dummyEmbedding,
        target_hotel_id: hotelId,
        match_threshold: 0.0,
        match_count: 3
      });
      
      if (fallbackError) {
        console.error('❌ Fallback search error:', fallbackError);
      } else {
        console.log('✅ Fallback search working!');
        console.log(`📊 Found ${fallbackResult.length} documents`);
      }
      
      return;
    }
    
    console.log('✅ Chunk search function working!');
    console.log(`📊 Found ${searchResult.length} chunk results`);
    
    if (searchResult.length > 0) {
      console.log('\n📄 Sample chunk result:');
      const sample = searchResult[0];
      console.log(`- ID: ${sample.id}`);
      console.log(`- Title: ${sample.title}`);
      console.log(`- Chunk Content: ${sample.chunk_content?.substring(0, 100)}...`);
      console.log(`- Chunk Index: ${sample.chunk_index}`);
      console.log(`- Chunk Type: ${sample.chunk_type}`);
      console.log(`- Similarity: ${sample.similarity}`);
    } else {
      console.log('⚠️ No chunk results found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testChunkSearch(); 