// Test the new Botpress search endpoint
async function testBotpressEndpoint() {
  console.log('🤖 Testing Botpress search endpoint...\n');
  
  const apiUrl = 'http://localhost:3000/api/botpress-search';
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  const testQueries = [
    "hotel information",
    "grand newwest", 
    "hotel",
    "information",
    "hotel grand"
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          hotel_id: hotelId,
          limit: 5
        })
      });
      
      if (!response.ok) {
        console.log(`❌ API Error (${response.status}):`, await response.text());
        continue;
      }
      
      const result = await response.json();
      console.log(`📊 Results: ${result.count} found`);
      console.log(`📝 Message: ${result.message}`);
      
      if (result.results && result.results.length > 0) {
        console.log('🎉 SUCCESS! Found results:');
        result.results.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title}`);
          console.log(`      Content: ${doc.content.substring(0, 100)}...`);
          console.log(`      Type: ${doc.type}`);
        });
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${query}":`, error.message);
    }
  }
  
  console.log('\n✅ Botpress endpoint testing complete!');
  console.log('🔗 Use this endpoint for Botpress: /api/botpress-search');
  console.log('📋 Request format:');
  console.log('   POST /api/botpress-search');
  console.log('   Body: { "query": "user question", "hotel_id": "hotel-uuid", "limit": 5 }');
}

// Run the test
testBotpressEndpoint(); 