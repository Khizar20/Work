// Test script for Hotel Document Search Integration
// Run with: node test-document-search-integration.js

const axios = require('axios');

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000', // Change to your admin dashboard URL
  HOTEL_ID: '8a1e6805-9253-4dd5-8893-0de3d7815555', // Your test hotel ID
  SUPABASE_URL: 'https://fxxzotnhkahdrehvkwhb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE'
};

// Test queries to validate the system
const TEST_QUERIES = [
  'What time is breakfast served?',
  'What are the hotel amenities?',
  'What is the WiFi password?',
  'Are pets allowed in the hotel?',
  'What time is checkout?',
  'Where is the swimming pool?',
  'How do I request room service?',
  'What are the hotel policies?',
  'Where can I find the restaurant?',
  'What activities are available nearby?'
];

/**
 * Test 1: Check if documents exist in database
 */
async function testDocumentsExist() {
  console.log('\n🔍 Test 1: Checking if documents exist for hotel...');
  
  try {
    const response = await axios.get(`${CONFIG.SUPABASE_URL}/rest/v1/documents`, {
      params: {
        hotel_id: `eq.${CONFIG.HOTEL_ID}`,
        processed: 'eq.true',
        select: 'id,title,processed,created_at'
      },
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });

    const documents = response.data;
    console.log(`✅ Found ${documents.length} processed documents for hotel`);
    
    if (documents.length === 0) {
      console.log('❌ No documents found! Please upload and process some documents first.');
      return false;
    }

    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.title} (${doc.created_at})`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error checking documents:', error.message);
    return false;
  }
}

/**
 * Test 2: Check if embeddings exist
 */
async function testEmbeddingsExist() {
  console.log('\n🧮 Test 2: Checking if embeddings exist...');
  
  try {
    const response = await axios.get(`${CONFIG.SUPABASE_URL}/rest/v1/documents`, {
      params: {
        hotel_id: `eq.${CONFIG.HOTEL_ID}`,
        processed: 'eq.true',
        select: 'id,title,embedding',
        not: 'embedding.is.null'
      },
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });

    const documentsWithEmbeddings = response.data;
    console.log(`✅ Found ${documentsWithEmbeddings.length} documents with embeddings`);
    
    if (documentsWithEmbeddings.length === 0) {
      console.log('❌ No embeddings found! Documents need to be processed with AI embeddings.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking embeddings:', error.message);
    return false;
  }
}

/**
 * Test 3: Check if search API endpoint exists
 */
async function testSearchAPIEndpoint() {
  console.log('\n🌐 Test 3: Testing search API endpoint...');
  
  try {
    const response = await axios.post(`${CONFIG.API_BASE_URL}/api/search-documents`, {
      query: 'test query',
      hotel_id: CONFIG.HOTEL_ID,
      limit: 1
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Search API endpoint is accessible');
    console.log('Response structure:', {
      found: response.data.found,
      resultsCount: response.data.results?.length || 0
    });

    return true;
  } catch (error) {
    console.error('❌ Search API endpoint error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Make sure your admin dashboard is running on', CONFIG.API_BASE_URL);
    }
    return false;
  }
}

/**
 * Test 4: Check if vector search function exists in database
 */
async function testVectorSearchFunction() {
  console.log('\n⚡ Test 4: Checking vector search function...');
  
  try {
    const response = await axios.get(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/search_hotel_documents`, {
      params: {
        hotel_id_param: CONFIG.HOTEL_ID,
        query_embedding: '[0.1,0.2,0.3]', // Dummy embedding
        similarity_threshold: 0.5,
        match_count: 1
      },
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });

    console.log('✅ Vector search function exists and is callable');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Vector search function not found');
      console.log('   Run the setup-hotel-document-search.sql script in Supabase');
    } else {
      console.log('⚠️ Vector search function may exist but had an error:', error.message);
    }
    return false;
  }
}

/**
 * Test 5: Run actual search queries
 */
async function testSearchQueries() {
  console.log('\n💬 Test 5: Testing search queries...');
  
  let successCount = 0;
  let totalTime = 0;
  
  for (const query of TEST_QUERIES.slice(0, 5)) { // Test first 5 queries
    try {
      console.log(`\n   Testing: "${query}"`);
      
      const startTime = Date.now();
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/search-documents`, {
        query: query,
        hotel_id: CONFIG.HOTEL_ID,
        limit: 3
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      totalTime += responseTime;

      if (response.data.found && response.data.results.length > 0) {
        console.log(`   ✅ Found ${response.data.results.length} results (${responseTime}ms)`);
        console.log(`   📄 Top result: "${response.data.results[0].title}"`);
        successCount++;
      } else {
        console.log(`   ⚠️ No results found (${responseTime}ms)`);
      }
      
    } catch (error) {
      console.log(`   ❌ Query failed: ${error.message}`);
    }
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const averageTime = totalTime / TEST_QUERIES.slice(0, 5).length;
  const successRate = (successCount / 5) * 100;
  
  console.log(`\n📊 Search Results Summary:`);
  console.log(`   Success Rate: ${successRate}% (${successCount}/5)`);
  console.log(`   Average Response Time: ${averageTime.toFixed(0)}ms`);
  
  if (successRate >= 60) {
    console.log('✅ Search performance is good!');
  } else {
    console.log('⚠️ Low success rate - consider uploading more documents or improving content');
  }
  
  return successRate >= 60;
}

/**
 * Test 6: Simulate Botpress scenario
 */
async function testBotpressScenario() {
  console.log('\n🤖 Test 6: Simulating Botpress scenario...');
  
  // Simulate the data that Botpress would have
  const mockBotpressData = {
    userQuery: 'What amenities does the hotel have?',
    hotelId: CONFIG.HOTEL_ID,
    hotelName: 'Test Hotel',
    sessionId: 'test-session-123'
  };
  
  try {
    console.log('   Simulating Botpress execute code logic...');
    
    // This mimics what happens in the Botpress execute code
    const response = await axios.post(`${CONFIG.API_BASE_URL}/api/search-documents`, {
      query: mockBotpressData.userQuery,
      hotel_id: mockBotpressData.hotelId,
      limit: 3
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Simulate response generation
    let botResponse = '';
    if (response.data.found && response.data.results.length > 0) {
      const topResult = response.data.results[0];
      botResponse = `Based on our ${mockBotpressData.hotelName} documentation: ${topResult.content || topResult.description || 'Information found in ' + topResult.title}`;
    } else {
      botResponse = `I couldn't find specific information about "${mockBotpressData.userQuery}" in our ${mockBotpressData.hotelName} documents. Please contact our front desk for assistance.`;
    }
    
    console.log('   ✅ Botpress scenario simulation successful');
    console.log(`   🤖 Bot would respond: "${botResponse.substring(0, 100)}..."`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Botpress scenario failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runAllTests() {
  console.log('🧪 Hotel Document Search Integration Tests');
  console.log('==========================================');
  console.log(`Hotel ID: ${CONFIG.HOTEL_ID}`);
  console.log(`API Base: ${CONFIG.API_BASE_URL}`);
  
  const results = {
    documentsExist: await testDocumentsExist(),
    embeddingsExist: await testEmbeddingsExist(),
    apiEndpoint: await testSearchAPIEndpoint(),
    vectorFunction: await testVectorSearchFunction(),
    searchQueries: await testSearchQueries(),
    botpressScenario: await testBotpressScenario()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} - ${testName}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const overallSuccess = passedTests / totalTests;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} (${(overallSuccess * 100).toFixed(0)}%)`);
  
  if (overallSuccess >= 0.8) {
    console.log('🎉 Great! Your document search integration is ready for Botpress!');
  } else if (overallSuccess >= 0.6) {
    console.log('⚠️ Good progress! Fix the failing tests and you\'ll be ready.');
  } else {
    console.log('🔧 Needs work. Focus on the basic setup first.');
  }
  
  console.log('\n📚 Next Steps:');
  if (!results.documentsExist) {
    console.log('   1. Upload hotel documents via admin dashboard');
  }
  if (!results.embeddingsExist) {
    console.log('   2. Ensure documents are processed with embeddings');
  }
  if (!results.apiEndpoint) {
    console.log('   3. Start your admin dashboard server');
  }
  if (!results.vectorFunction) {
    console.log('   4. Run setup-hotel-document-search.sql in Supabase');
  }
  if (!results.searchQueries) {
    console.log('   5. Upload more relevant documents for better search results');
  }
  
  console.log('   6. Implement the Botpress execute code using the provided scripts');
  console.log('   7. Test the complete flow from QR code to bot response');
}

// Run the tests
runAllTests().catch(console.error); 