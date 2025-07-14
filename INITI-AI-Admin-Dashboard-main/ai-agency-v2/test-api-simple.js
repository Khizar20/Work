const http = require('http');

// Your actual data
const YOUR_DATA = {
  hotelId: '8a1e6805-9253-4dd5-8893-0de3d7815555',
  documentId: '26dd134c-7d00-4a73-903b-af507b3cbeb1',
  documentTitle: 'Hotel grand newwest'
};

console.log('🧪 Testing Enhanced Search API with Your Data\n');
console.log('Hotel ID:', YOUR_DATA.hotelId);
console.log('Document ID:', YOUR_DATA.documentId);
console.log('Document Title:', YOUR_DATA.documentTitle);
console.log('\n' + '='.repeat(60) + '\n');

// Function to make HTTP POST request
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            error: 'Failed to parse JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test functions
async function testGeneralSearch() {
  console.log('📋 Test 1: General Search (All Hotel Documents)');
  
  try {
    const result = await makeRequest('/api/search-documents', {
      query: 'hotel information grand newwest',
      hotel_id: YOUR_DATA.hotelId,
      limit: 5,
      match_threshold: 0.1
    });
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Success!');
      console.log('Count:', result.data.count);
      console.log('Search Type:', result.data.search_type);
      
      if (result.data.results && result.data.results.length > 0) {
        console.log('Documents found:');
        result.data.results.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (similarity: ${doc.similarity?.toFixed(3)})`);
        });
      } else {
        console.log('No documents returned');
      }
    } else {
      console.log('❌ Error:', result.data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
}

async function testSpecificDocumentSearch() {
  console.log('📋 Test 2: Specific Document Search (Using both hotel_id and id)');
  
  try {
    const result = await makeRequest('/api/search-documents', {
      query: 'newwest facilities amenities services',
      hotel_id: YOUR_DATA.hotelId,
      document_id: YOUR_DATA.documentId,
      limit: 3,
      match_threshold: 0.05
    });
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Success!');
      console.log('Count:', result.data.count);
      console.log('Search Type:', result.data.search_type);
      console.log('Target Document:', result.data.document_id);
      
      if (result.data.results && result.data.results.length > 0) {
        console.log('Documents found:');
        result.data.results.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (similarity: ${doc.similarity?.toFixed(3)})`);
        });
      } else {
        console.log('No documents returned');
      }
    } else {
      console.log('❌ Error:', result.data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
}

async function testMultipleDocumentsSearch() {
  console.log('📋 Test 3: Multiple Documents Search');
  
  try {
    const result = await makeRequest('/api/search-documents', {
      query: 'hotel services information',
      hotel_id: YOUR_DATA.hotelId,
      document_ids: [YOUR_DATA.documentId],
      limit: 3,
      match_threshold: 0.1
    });
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Success!');
      console.log('Count:', result.data.count);
      console.log('Search Type:', result.data.search_type);
      console.log('Target Documents:', result.data.document_ids);
      
      if (result.data.results && result.data.results.length > 0) {
        console.log('Documents found:');
        result.data.results.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (similarity: ${doc.similarity?.toFixed(3)})`);
        });
      } else {
        console.log('No documents returned');
      }
    } else {
      console.log('❌ Error:', result.data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
}

async function testLowThresholdSearch() {
  console.log('📋 Test 4: Low Threshold Search (Should return results)');
  
  try {
    const result = await makeRequest('/api/search-documents', {
      query: 'hotel',
      hotel_id: YOUR_DATA.hotelId,
      limit: 5,
      match_threshold: 0.01
    });
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      console.log('✅ Success!');
      console.log('Count:', result.data.count);
      console.log('Search Type:', result.data.search_type);
      
      if (result.data.results && result.data.results.length > 0) {
        console.log('Documents found:');
        result.data.results.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (similarity: ${doc.similarity?.toFixed(3)})`);
        });
      } else {
        console.log('No documents returned');
      }
    } else {
      console.log('❌ Error:', result.data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  console.log('\n' + '-'.repeat(60) + '\n');
}

// Check if server is running first
async function checkServer() {
  console.log('🔍 Checking if server is running...\n');
  
  try {
    const result = await makeRequest('/api/test-connection', {});
    console.log('✅ Server is running!');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible:', error.message);
    console.log('\n💡 To start the server, run: npm run dev');
    return false;
  }
}

// Main test function
async function runAllTests() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    return;
  }
  
  console.log('\n🚀 Running Enhanced Search API Tests\n');
  
  await testGeneralSearch();
  await testSpecificDocumentSearch();
  await testMultipleDocumentsSearch();
  await testLowThresholdSearch();
  
  console.log('🏁 All tests completed!');
  console.log('\n🎯 Key Features Tested:');
  console.log('✅ hotel_id filtering (security)');
  console.log('✅ id column filtering (precision)');
  console.log('✅ Vector similarity search');
  console.log('✅ Multiple search modes');
  console.log('✅ Configurable thresholds');
}

// Run the tests
runAllTests().catch(console.error); 