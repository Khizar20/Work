// Test the search API endpoint
// Run this with: node test-search-api-endpoint.js

async function testSearchEndpoint() {
  console.log('🔍 Testing Search API Endpoint...\n');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if your dev server runs on different port
  const endpoint = `${baseUrl}/api/search-documents`;
  
  // Test data
  const testCases = [
    {
      name: "Basic Hotel Search",
      data: {
        query: "hotel information",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        limit: 5,
        match_threshold: 0.1
      }
    },
    {
      name: "Safety Guidelines Search", 
      data: {
        query: "safety guidelines emergency",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        limit: 3,
        match_threshold: 0.2
      }
    },
    {
      name: "Room Service Search",
      data: {
        query: "room service menu food",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555", 
        limit: 5,
        match_threshold: 0.1
      }
    },
    {
      name: "Specific Document Search",
      data: {
        query: "hotel grand",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
        document_id: "d2f9b63e-fa72-483b-bf11-80c7e63158b8", // From our previous test
        limit: 3,
        match_threshold: 0.0
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`📝 Query: "${testCase.data.query}"`);
    console.log(`🏨 Hotel ID: ${testCase.data.hotel_id}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      const responseText = await response.text();
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log(`✅ Success! Found ${result.count} results`);
        
        if (result.results && result.results.length > 0) {
          console.log('📄 Results:');
          result.results.forEach((doc, i) => {
            console.log(`   ${i + 1}. "${doc.title}" (similarity: ${doc.similarity?.toFixed(3)})`);
            console.log(`      Excerpt: ${doc.content_excerpt?.substring(0, 100)}...`);
          });
        } else {
          console.log('📭 No results found');
        }
      } else {
        console.log(`❌ Error Response: ${responseText}`);
        
        try {
          const errorData = JSON.parse(responseText);
          console.log(`❌ Error Details:`, JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.log(`❌ Raw Error Response: ${responseText}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Request Failed: ${error.message}`);
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.log('💡 Make sure your Next.js dev server is running: npm run dev');
      }
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n🏁 API Endpoint Testing Complete!');
  console.log('\n💡 Tips:');
  console.log('   - Make sure your Next.js dev server is running (npm run dev)');
  console.log('   - Check the console logs in your dev server for detailed API logs');
  console.log('   - Adjust the baseUrl if your server runs on a different port');
}

// Run the test
testSearchEndpoint().catch(console.error); 