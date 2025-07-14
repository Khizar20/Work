// Test embedding generation independently
async function testEmbeddingGeneration() {
  console.log('🧠 Testing embedding generation...\n');
  
  try {
    // Import the transformer pipeline
    const { pipeline } = await import('@xenova/transformers');
    
    console.log('📦 Loading model...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Model loaded successfully');
    
    // Test embedding generation
    const testQuery = "hotel information";
    console.log(`🔍 Generating embedding for: "${testQuery}"`);
    
    const embeddingTensor = await extractor(testQuery, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(embeddingTensor.data);
    
    console.log('✅ Embedding generated successfully');
    console.log('📏 Embedding dimensions:', queryEmbedding.length);
    console.log('🔢 First 10 values:', queryEmbedding.slice(0, 10));
    
    // Check if embedding values are valid
    const hasNaN = queryEmbedding.some(val => isNaN(val));
    const hasInfinite = queryEmbedding.some(val => !isFinite(val));
    
    console.log('🔍 Embedding validation:');
    console.log('   Contains NaN:', hasNaN);
    console.log('   Contains Infinite:', hasInfinite);
    
    if (hasNaN || hasInfinite) {
      console.log('❌ Invalid embedding detected!');
      return;
    }
    
    console.log('✅ Embedding is valid');
    
    // Test with Supabase client
    console.log('\n🔗 Testing direct database call with generated embedding...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = 'https://aqfqfzaqeprxtxkihprp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: searchResults, error: searchError } = await supabase.rpc('search_documents', {
      query_embedding: queryEmbedding,
      target_hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
      match_threshold: 0.0,
      match_count: 10,
      target_document_id: null
    });
    
    if (searchError) {
      console.error('❌ Database search error:', searchError);
    } else {
      console.log('✅ Database search successful');
      console.log('📊 Results found:', searchResults?.length || 0);
      
      if (searchResults && searchResults.length > 0) {
        console.log('🎉 SUCCESS! The embedding generation and search work correctly!');
        searchResults.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
        });
      } else {
        console.log('❌ No results found even with direct database call');
      }
    }
    
  } catch (error) {
    console.error('❌ Error in embedding test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testEmbeddingGeneration(); 