// Test the API route logic directly without HTTP
async function testAPILogicDirect() {
  console.log('🧪 Testing API route logic directly...\n');
  
  try {
    // Import dependencies like the API does
    const { createClient } = require('@supabase/supabase-js');
    const { pipeline } = require('@xenova/transformers');
    
    // Use the same environment variables/config as the API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqfqfzaqeprxtxkihprp.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
    
    // Simulate the API request data
    const requestData = {
      query: "hotel information",
      hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
      limit: 5,
      document_id: "26dd134c-7d00-4a73-903b-af507b3cbeb1",
      document_ids: null,
      match_threshold: 0.0
    };
    
    console.log('📝 Request data:', JSON.stringify(requestData, null, 2));
    
    // Step 1: Generate embedding (same as API)
    console.log('\n🧠 Generating query embedding...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingTensor = await extractor(requestData.query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(embeddingTensor.data);
    
    console.log('✅ Query embedding generated, dimensions:', queryEmbedding.length);
    console.log('🔢 First 5 embedding values:', queryEmbedding.slice(0, 5));
    
    // Step 2: Create Supabase client (same as API)
    console.log('\n🔗 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    // Step 3: Test the exact same database call as the API
    console.log('\n🔎 Performing vector similarity search...');
    
    const searchParams = {
      query_embedding: queryEmbedding,
      target_hotel_id: requestData.hotel_id,
      match_threshold: requestData.match_threshold,
      match_count: requestData.limit,
      target_document_id: requestData.document_id
    };
    
    console.log('📋 Search params:', JSON.stringify({
      ...searchParams,
      query_embedding: `[${queryEmbedding.length} values]`
    }, null, 2));
    
    const { data: documents, error } = await supabase.rpc('search_documents', searchParams);
    
    if (error) {
      console.error('❌ Vector search error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Database call successful');
    console.log('📊 Found', documents?.length || 0, 'relevant documents');
    
    if (documents && documents.length > 0) {
      console.log('🎉 SUCCESS! Found results:');
      documents.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id}) - similarity: ${doc.similarity}`);
        console.log(`      Content: ${doc.content_excerpt}`);
      });
    } else {
      console.log('❌ No documents returned from database');
      
      // Additional debugging: Let's check if documents exist
      console.log('\n🔍 Debugging: Checking if documents exist...');
      const { data: allDocs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, hotel_id, embedding')
        .eq('hotel_id', requestData.hotel_id)
        .not('embedding', 'is', null);
        
      if (docsError) {
        console.error('❌ Error checking documents:', docsError);
      } else {
        console.log('📄 Documents with embeddings:', allDocs?.length || 0);
        if (allDocs && allDocs.length > 0) {
          allDocs.forEach((doc, i) => {
            console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id})`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

// Run the test
testAPILogicDirect(); 