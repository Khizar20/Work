// Check all documents and hotel IDs
async function checkAllDocuments() {
  console.log('📋 Checking all documents and hotel IDs...\n');
  
  // Test with an endpoint that gets all documents (without hotel_id filter)
  const apiUrl = 'http://localhost:3000/api/botpress-search';
  
  console.log('1️⃣ Testing with empty query to get all documents...');
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "",
        hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555", // Our test hotel ID
        limit: 20
      })
    });
    
    const result = await response.json();
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Let me create a simple test endpoint to bypass hotel_id filtering
  console.log('\n2️⃣ The issue might be RLS policies or hotel_id mismatch');
  console.log('💡 IMMEDIATE SOLUTION FOR BOTPRESS:');
  console.log('');
  console.log('🔧 Use this working endpoint: /api/botpress-search');
  console.log('📝 Request format:');
  console.log('   POST http://localhost:3000/api/botpress-search');
  console.log('   {');
  console.log('     "query": "user question here",');
  console.log('     "hotel_id": "your-hotel-id",');
  console.log('     "limit": 5');
  console.log('   }');
  console.log('');
  console.log('🚀 TO CONNECT WITH BOTPRESS:');
  console.log('');
  console.log('1. In your Botpress flow, add an HTTP Request action');
  console.log('2. Set URL: http://localhost:3000/api/botpress-search');
  console.log('3. Set Method: POST');
  console.log('4. Set Body: {');
  console.log('     "query": "{{event.text}}",');
  console.log('     "hotel_id": "8a1e6805-9253-4dd5-8893-0de3d7815555",');
  console.log('     "limit": 3');
  console.log('   }');
  console.log('5. In the response, use: {{response.data.results}}');
  console.log('');
  console.log('💡 The endpoint will work even if no vector search works');
  console.log('   because it falls back to text-based search');
  console.log('');
  console.log('🔄 If you get no results, try these hotel IDs:');
  console.log('   - Check your admin dashboard for the correct hotel_id');
  console.log('   - Or modify the endpoint to not filter by hotel_id for testing');
}

// Run the test
checkAllDocuments(); 