// Simple test to trigger API and see server logs
async function testSimpleRequest() {
  console.log('🧪 Making simple API request to see server logs...\n');
  
  const apiUrl = 'http://localhost:3000/api/search-documents';
  
  const requestData = {
    query: "hotel information",
    hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
    match_threshold: 0.0,
    limit: 5
  };
  
  console.log('📤 Sending request:', JSON.stringify(requestData, null, 2));
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Response received:');
    console.log('   - Success:', result.success);
    console.log('   - Results count:', result.count);
    console.log('   - Search type:', result.search_type);
    
    if (result.results && result.results.length > 0) {
      console.log('🎉 Found results!');
      result.results.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
      });
    } else {
      console.log('❌ No results found');
      console.log('📝 Check the server console for detailed logs...');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testSimpleRequest(); 