// Test with exact embedding values from API logs
async function testExactAPIEmbedding() {
  console.log('🎯 Testing with exact embedding values from API logs...\n');
  
  // From the API logs: First 5 embedding values for "hotel information"
  // [0.10090452432632446, 0.05560174956917763, -0.04924327880144119, 0.08252409845590591, -0.016636544838547707]
  
  // Create a test that simulates the exact same call the API makes
  const apiUrl = 'http://localhost:3000/api/search-documents';
  
  // Let's test a few scenarios to narrow down the issue
  const testCases = [
    {
      name: "Exact API test - with document_id",
      data: {
        query: "hotel information",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        document_id: "26dd134c-7d00-4a73-903b-af507b3cbeb1",
        match_threshold: 0.0,
        limit: 5
      }
    },
    {
      name: "Exact API test - without document_id",
      data: {
        query: "hotel information", 
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        match_threshold: 0.0,
        limit: 10
      }
    },
    {
      name: "Simple query test",
      data: {
        query: "hotel",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555", 
        match_threshold: 0.0,
        limit: 10
      }
    },
    {
      name: "Very high threshold test",
      data: {
        query: "hotel information",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        match_threshold: 0.9, // Very high threshold
        limit: 10
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}...`);
    console.log('📤 Request:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (!response.ok) {
        console.log(`❌ API Error (${response.status}):`, await response.text());
        continue;
      }
      
      const result = await response.json();
      console.log(`📊 Results: ${result.count} found`);
      
      if (result.results && result.results.length > 0) {
        console.log('🎉 SUCCESS! Found results:');
        result.results.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
        });
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error in ${testCase.name}:`, error.message);
    }
  }
  
  // Final test: Check if the API logs show any additional errors
  console.log('\n📝 Check the server console for detailed embedding and database logs...');
  console.log('🔍 Key things to look for in server logs:');
  console.log('   - Embedding generation success/failure');
  console.log('   - Database connection success/failure');  
  console.log('   - Search function call parameters');
  console.log('   - Any database errors or warnings');
}

// Run the test
testExactAPIEmbedding(); 