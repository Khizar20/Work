// Check what documents actually exist and their structure
async function checkDocumentsStructure() {
  console.log('📋 Checking documents structure and data...\n');
  
  const apiUrl = 'http://localhost:3000/api/documents';
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  // First, let's try to get all documents for this hotel
  console.log('1️⃣ Checking documents via API...');
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API Error (${response.status}):`, await response.text());
    } else {
      const result = await response.json();
      console.log('✅ Documents API response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error calling documents API:', error.message);
  }
  
  // Let's try a different approach - create a simple endpoint to check documents
  console.log('\n2️⃣ Creating a test to check documents directly...');
  
  // Test with a simple query first
  const testApiUrl = 'http://localhost:3000/api/botpress-search';
  
  console.log('🔍 Testing with simple search that gets all documents...');
  try {
    const response = await fetch(testApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "", // Empty query to potentially get all documents
        hotel_id: hotelId,
        limit: 10
      })
    });
    
    if (!response.ok) {
      console.log(`❌ API Error (${response.status}):`, await response.text());
    } else {
      const result = await response.json();
      console.log('📊 Empty query results:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error with empty query:', error.message);
  }
}

// Run the test
checkDocumentsStructure(); 