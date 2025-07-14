const http = require('http');

console.log('🧪 Testing Embedding Generation in Search API\n');

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

async function testEmbeddingGeneration() {
  console.log('🔍 Testing different queries and thresholds...\n');
  
  const testCases = [
    {
      name: 'Simple word',
      query: 'hotel',
      threshold: 0.0
    },
    {
      name: 'Document title match',
      query: 'Hotel grand newwest',
      threshold: 0.0
    },
    {
      name: 'Partial title match',
      query: 'grand newwest',
      threshold: 0.0
    },
    {
      name: 'Single word from title',
      query: 'newwest',
      threshold: 0.0
    },
    {
      name: 'Generic hotel terms',
      query: 'information services',
      threshold: 0.0
    }
  ];
  
  const hotelId = '8a1e6805-9253-4dd5-8893-0de3d7815555';
  
  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Threshold: ${testCase.threshold}`);
    
    try {
      const result = await makeRequest('/api/search-documents', {
        query: testCase.query,
        hotel_id: hotelId,
        limit: 10,
        match_threshold: testCase.threshold
      });
      
      console.log(`Status: ${result.statusCode}`);
      
      if (result.statusCode === 200) {
        console.log(`✅ API Response Success`);
        console.log(`Count: ${result.data.count}`);
        console.log(`Search Type: ${result.data.search_type}`);
        
        if (result.data.results && result.data.results.length > 0) {
          console.log('📄 Documents found:');
          result.data.results.forEach((doc, index) => {
            console.log(`  ${index + 1}. "${doc.title}" (similarity: ${doc.similarity?.toFixed(3)})`);
            console.log(`     File type: ${doc.file_type}`);
            console.log(`     ID: ${doc.id}`);
          });
        } else {
          console.log('❌ No documents returned');
        }
        
        // Check if there are any additional details
        if (result.data.details) {
          console.log('Additional details:', result.data.details);
        }
      } else {
        console.log('❌ API Error:', result.data);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
  }
}

async function testDirectDocumentRetrieval() {
  console.log('🔍 Testing direct document retrieval API...\n');
  
  try {
    const result = await makeRequest('/api/documents', {});
    
    console.log(`Status: ${result.statusCode}`);
    
    if (result.statusCode === 200) {
      console.log('✅ Documents API Response Success');
      
      if (result.data.documents && result.data.documents.length > 0) {
        console.log(`📄 Found ${result.data.documents.length} documents:`);
        result.data.documents.forEach((doc, index) => {
          console.log(`  ${index + 1}. "${doc.title}"`);
          console.log(`     ID: ${doc.id}`);
          console.log(`     Hotel ID: ${doc.hotel_id}`);
          console.log(`     File Type: ${doc.file_type}`);
          console.log(`     Processed: ${doc.processed}`);
          console.log(`     Has Embedding: ${!!doc.embedding}`);
          
          if (doc.embedding) {
            console.log(`     Embedding Length: ${Array.isArray(doc.embedding) ? doc.embedding.length : 'Not an array'}`);
          }
        });
      } else {
        console.log('❌ No documents found in documents API');
      }
    } else {
      console.log('❌ Documents API Error:', result.data);
    }
  } catch (error) {
    console.log('❌ Documents API request failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

async function runDiagnosticTests() {
  console.log('🚀 Running Diagnostic Tests for Search API\n');
  
  // First test document retrieval
  await testDirectDocumentRetrieval();
  
  // Then test embedding generation and search
  await testEmbeddingGeneration();
  
  console.log('🏁 Diagnostic tests completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Check the SQL debug script: debug-search-results.sql');
  console.log('2. Verify embeddings exist in your Supabase database');
  console.log('3. Ensure the vector extension is properly installed');
  console.log('4. Check if document processing completed successfully');
}

// Run the diagnostic tests
runDiagnosticTests().catch(console.error); 