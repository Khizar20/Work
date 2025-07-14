// Test the endpoint that searches all documents
async function testBotpressAll() {
  console.log('🤖 Testing Botpress search ALL documents endpoint...\n');
  
  const apiUrl = 'http://localhost:3000/api/botpress-search-all';
  
  const testCases = [
    { query: "", description: "Get all documents" },
    { query: "hotel", description: "Search for 'hotel'" },
    { query: "grand", description: "Search for 'grand'" },
    { query: "information", description: "Search for 'information'" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.description}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          limit: 10
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
        console.log('🎉 SUCCESS! Found documents:');
        result.results.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (Hotel: ${doc.hotel_id})`);
          console.log(`      Type: ${doc.type}`);
          console.log(`      Content: ${doc.content.substring(0, 100)}...`);
        });
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error in ${testCase.description}:`, error.message);
    }
  }
  
  console.log('\n✅ Testing complete!');
  console.log('');
  console.log('🚀 BOTPRESS INTEGRATION INSTRUCTIONS:');
  console.log('');
  console.log('📍 Endpoint: http://localhost:3000/api/botpress-search-all');
  console.log('🔧 Method: POST');
  console.log('📝 Request Body:');
  console.log('   {');
  console.log('     "query": "{{event.text}}",');
  console.log('     "limit": 3');
  console.log('   }');
  console.log('');
  console.log('📤 Response Format:');
  console.log('   - results: Array of documents');
  console.log('   - count: Number of results');
  console.log('   - message: Human-readable message');
  console.log('');
  console.log('🎯 Use in Botpress:');
  console.log('   1. Add HTTP Request action in your flow');
  console.log('   2. Use the endpoint above');
  console.log('   3. Display: {{response.data.results[0].content}}');
  console.log('   4. Or loop through: {{response.data.results}}');
}

// Run the test
testBotpressAll(); 