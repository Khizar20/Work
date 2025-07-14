// Test the search API with the same parameters that worked in the database
async function testSearchAPI() {
  const apiUrl = 'http://localhost:3000/api/search-documents';
  
  // Test 1: Basic search that should return results
  const searchQuery = {
    query: "hotel information",
    hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
    match_threshold: 0.0,  // Same as database test
    limit: 10
  };
  
  console.log('🧪 Testing search API with query that worked in database...');
  console.log('Request:', JSON.stringify(searchQuery, null, 2));
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.results && result.results.length > 0) {
      console.log('\n🎉 SUCCESS! Found results:');
      result.results.forEach((doc, i) => {
        console.log(`${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
      });
    } else {
      console.log('\n❌ No results returned despite database test working');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test 2: Test with specific document ID
async function testSearchWithDocumentId() {
  const apiUrl = 'http://localhost:3000/api/search-documents';
  
  const searchQuery = {
    query: "hotel information",
    hotel_id: "8a1e6805-9253-4dd5-8893-0de3d7815555",
    document_id: "26dd134c-7d00-4a73-903b-af507b3cbeb1",
    match_threshold: 0.0,
    limit: 10
  };
  
  console.log('\n🧪 Testing search API with specific document ID...');
  console.log('Request:', JSON.stringify(searchQuery, null, 2));
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('✅ API Response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
(async () => {
  console.log('🚀 Starting API tests...\n');
  await testSearchAPI();
  await testSearchWithDocumentId();
})(); 