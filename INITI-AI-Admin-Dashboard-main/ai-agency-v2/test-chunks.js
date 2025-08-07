// Test if chunks were created successfully
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChunks() {
  console.log('🧪 Testing chunk creation...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  try {
    // 1. Check if chunks exist
    const { data: chunks, error: chunkError } = await supabase
      .from('content_chunks')
      .select('id, content, chunk_index, chunk_type')
      .eq('hotel_id', hotelId)
      .order('chunk_index')
      .limit(5);
    
    if (chunkError) {
      console.error('❌ Error getting chunks:', chunkError);
      return;
    }
    
    console.log(`✅ Found ${chunks.length} chunks`);
    chunks.forEach((chunk, i) => {
      console.log(`${i + 1}. Chunk ${chunk.chunk_index} (${chunk.chunk_type}):`);
      console.log(`   ${chunk.content.substring(0, 100)}...`);
      console.log('');
    });
    
    // 2. Test a simple search for local guide content
    console.log('🔍 Searching for chunks containing "local" or "guide"...');
    const { data: searchResults, error: searchError } = await supabase
      .from('content_chunks')
      .select('id, content, chunk_index, chunk_type')
      .eq('hotel_id', hotelId)
      .or('content.ilike.%local%,content.ilike.%guide%,content.ilike.%attraction%,content.ilike.%restaurant%')
      .limit(3);
    
    if (searchError) {
      console.error('❌ Error searching chunks:', searchError);
    } else {
      console.log(`📊 Found ${searchResults.length} chunks with local/guide content:`);
      searchResults.forEach((chunk, i) => {
        console.log(`${i + 1}. Chunk ${chunk.chunk_index}:`);
        console.log(`   ${chunk.content.substring(0, 150)}...`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testChunks(); 