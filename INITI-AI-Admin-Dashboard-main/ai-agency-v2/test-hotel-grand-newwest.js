// Test specifically for Hotel grand newwest document
async function testHotelGrandNewwest() {
  console.log('🏨 Testing Hotel Grand Newwest document search...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const documentId = "26dd134c-7d00-4a73-903b-af507b3cbeb1";
  const apiUrl = 'http://localhost:3000/api/search-documents';
  
  // Test 1: Search within the specific Hotel Grand Newwest document
  console.log('1️⃣ Testing search within Hotel Grand Newwest document...');
  const searchQueries = [
    "hotel information",
    "grand newwest",
    "hotel",
    "information",
    "newwest"
  ];
  
  for (const query of searchQueries) {
    console.log(`\n🔍 Searching for: "${query}"`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          hotel_id: hotelId,
          document_id: documentId, // Search specifically in this document
          match_threshold: 0.0,
          limit: 5
        })
      });
      
      if (!response.ok) {
        console.log(`❌ API Error (${response.status}):`, await response.text());
        continue;
      }
      
      const result = await response.json();
      console.log(`📊 Results for "${query}":`, result.count, 'found');
      
      if (result.results && result.results.length > 0) {
        console.log('✅ SUCCESS! Found results:');
        result.results.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (similarity: ${doc.similarity})`);
          console.log(`      Content: ${doc.content_excerpt}`);
        });
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${query}":`, error.message);
    }
  }
  
  // Test 2: Search all hotel documents (without document_id filter)
  console.log('\n\n2️⃣ Testing search across all hotel documents...');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "hotel grand newwest",
        hotel_id: hotelId,
        // No document_id - search all documents
        match_threshold: 0.0,
        limit: 10
      })
    });
    
    if (!response.ok) {
      console.log('❌ API Error:', await response.text());
      return;
    }
    
    const result = await response.json();
    console.log('📊 Results for "hotel grand newwest" across all documents:', result.count, 'found');
    
    if (result.results && result.results.length > 0) {
      console.log('✅ Found results:');
      result.results.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id}) - similarity: ${doc.similarity}`);
        console.log(`      Content: ${doc.content_excerpt}`);
      });
    } else {
      console.log('❌ No results found in any document');
    }
    
  } catch (error) {
    console.error('❌ Error in general search:', error.message);
  }
  
  // Test 3: Test with very low threshold to see if any matches exist
  console.log('\n\n3️⃣ Testing with zero threshold to find any possible matches...');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "test",
        hotel_id: hotelId,
        match_threshold: 0.0, // Absolutely no threshold
        limit: 20
      })
    });
    
    const result = await response.json();
    console.log('📊 Zero threshold test results:', result.count, 'found');
    
    if (result.results && result.results.length > 0) {
      console.log('✅ Found documents with zero threshold:');
      result.results.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (ID: ${doc.id}) - similarity: ${doc.similarity}`);
      });
    } else {
      console.log('❌ No results even with zero threshold - this indicates a problem');
    }
    
  } catch (error) {
    console.error('❌ Error in zero threshold test:', error.message);
  }
}

// Run the test
testHotelGrandNewwest(); 