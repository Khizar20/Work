/**
 * Test Script: Verify Botpress Embeddings Integration
 * Run this to test your embeddings and search functionality
 */

// Configuration
const SUPABASE_URL = 'https://fxxzotnhkahdrehvkwhb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE'
const API_BASE_URL = 'https://cf71b76d6207.ngrok-free.app' // Your ngrok URL
const HOTEL_ID = '8a1e6805-9253-4dd5-8893-0de3d7815555'

// Simple HTTP client for testing
async function httpRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return {
      success: response.ok,
      status: response.status,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Test 1: Check if documents exist with embeddings
 */
async function testDocumentEmbeddings() {
  console.log('🧪 Test 1: Checking documents with embeddings...\n')
  
  try {
    const response = await httpRequest(`${SUPABASE_URL}/rest/v1/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (response.success) {
      const documents = response.data
      console.log(`✅ Found ${documents.length} documents in database`)
      
      const docsWithEmbeddings = documents.filter(doc => doc.embedding !== null)
      console.log(`📊 ${docsWithEmbeddings.length} documents have embeddings`)
      
      if (docsWithEmbeddings.length > 0) {
        console.log('📄 Documents with embeddings:')
        docsWithEmbeddings.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.title} (${doc.file_type}) - Hotel: ${doc.hotel_id}`)
        })
      } else {
        console.log('❌ No documents have embeddings! Check your upload process.')
      }
    } else {
      console.log('❌ Failed to fetch documents:', response.error)
    }
  } catch (error) {
    console.error('❌ Error testing documents:', error.message)
  }
}

/**
 * Test 2: Test the API endpoint directly
 */
async function testAPIEndpoint() {
  console.log('\n🧪 Test 2: Testing API endpoint...\n')
  
  const testQuery = 'hotel information'
  
  try {
    const response = await httpRequest(`${API_BASE_URL}/api/search-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        query: testQuery,
        hotel_id: HOTEL_ID,
        limit: 3,
        match_threshold: 0.1
      })
    })
    
    if (response.success) {
      console.log('✅ API endpoint is working!')
      console.log('📊 Response:', JSON.stringify(response.data, null, 2))
      
      if (response.data.results && response.data.results.length > 0) {
        console.log('\n📄 Search results:')
        response.data.results.forEach((result, i) => {
          console.log(`   ${i + 1}. ${result.title} (similarity: ${result.similarity})`)
        })
      } else {
        console.log('❌ No search results returned')
      }
    } else {
      console.log('❌ API endpoint failed:', response.error)
      console.log('Status:', response.status)
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
  }
}

/**
 * Test 3: Test Supabase search function directly
 */
async function testSupabaseFunction() {
  console.log('\n🧪 Test 3: Testing Supabase search function directly...\n')
  
  try {
    // Generate a simple test embedding
    const testEmbedding = new Array(384).fill(0.1)
    
    const response = await httpRequest(`${SUPABASE_URL}/rest/v1/rpc/search_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        query_embedding: testEmbedding,
        target_hotel_id: HOTEL_ID,
        match_threshold: 0.0,
        match_count: 5,
        target_document_id: null
      })
    })
    
    if (response.success) {
      console.log('✅ Supabase search function is working!')
      console.log('📊 Results:', JSON.stringify(response.data, null, 2))
      
      if (response.data && response.data.length > 0) {
        console.log('\n📄 Direct search results:')
        response.data.forEach((result, i) => {
          console.log(`   ${i + 1}. ${result.title} (similarity: ${result.similarity})`)
        })
      } else {
        console.log('❌ No results from direct search')
      }
    } else {
      console.log('❌ Supabase function failed:', response.error)
    }
  } catch (error) {
    console.error('❌ Error testing Supabase function:', error.message)
  }
}

/**
 * Test 4: Test with actual document embedding
 */
async function testWithActualEmbedding() {
  console.log('\n🧪 Test 4: Testing with actual document embedding...\n')
  
  try {
    // First, get a document with an embedding
    const docResponse = await httpRequest(`${SUPABASE_URL}/rest/v1/documents?hotel_id=eq.${HOTEL_ID}&embedding=not.is.null&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (docResponse.success && docResponse.data.length > 0) {
      const doc = docResponse.data[0]
      console.log(`✅ Found document with embedding: ${doc.title}`)
      
      // Use this document's embedding to search
      const searchResponse = await httpRequest(`${SUPABASE_URL}/rest/v1/rpc/search_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          query_embedding: doc.embedding,
          target_hotel_id: HOTEL_ID,
          match_threshold: 0.0,
          match_count: 5,
          target_document_id: null
        })
      })
      
      if (searchResponse.success) {
        console.log('✅ Search with actual embedding works!')
        console.log('📊 Found', searchResponse.data.length, 'results')
        
        if (searchResponse.data.length > 0) {
          console.log('\n📄 Results:')
          searchResponse.data.forEach((result, i) => {
            console.log(`   ${i + 1}. ${result.title} (similarity: ${result.similarity})`)
          })
        }
      } else {
        console.log('❌ Search with actual embedding failed:', searchResponse.error)
      }
    } else {
      console.log('❌ No documents with embeddings found')
    }
  } catch (error) {
    console.error('❌ Error testing with actual embedding:', error.message)
  }
}

/**
 * Test 5: Test embedding generation API
 */
async function testEmbeddingGeneration() {
  console.log('\n🧪 Test 5: Testing embedding generation API...\n')
  
  const testText = 'What are the hotel amenities?'
  
  try {
    const response = await httpRequest(`${API_BASE_URL}/api/generate-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        text: testText
      })
    })
    
    if (response.success && response.data.embedding) {
      console.log('✅ Embedding generation API working!')
      console.log('📊 Embedding dimensions:', response.data.dimensions)
      console.log('🔢 First 5 values:', response.data.embedding.slice(0, 5))
      console.log('🤖 Model used:', response.data.model)
    } else {
      console.log('❌ Embedding generation API failed:', response.error)
    }
  } catch (error) {
    console.error('❌ Error testing embedding generation:', error.message)
  }
}

/**
 * Test 6: Simulate Botpress workflow
 */
async function testBotpressWorkflow() {
  console.log('\n🧪 Test 6: Simulating Botpress workflow...\n')
  
  // Simulate the Botpress environment
  const mockEvent = {
    payload: { text: 'What are the hotel amenities?' }
  }
  
  const mockUser = {
    hotel_id: HOTEL_ID,
    hotel_name: 'Hotel Grand Latest'
  }
  
  const mockWorkflow = {}
  
  console.log('📝 Simulating user query:', mockEvent.payload.text)
  console.log('🏨 Hotel:', mockUser.hotel_name)
  console.log('🆔 Hotel ID:', mockUser.hotel_id)
  
  try {
    // Test the API call (same as Botpress would do)
    const response = await httpRequest(`${API_BASE_URL}/api/search-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        query: mockEvent.payload.text,
        hotel_id: mockUser.hotel_id,
        limit: 3,
        match_threshold: 0.15
      })
    })
    
    if (response.success && response.data.results && response.data.results.length > 0) {
      console.log('✅ Botpress workflow simulation successful!')
      
      // Generate response (same as Botpress would do)
      const topResult = response.data.results[0]
      let botResponse = `Based on our ${mockUser.hotel_name} documentation:\n\n`
      botResponse += `📄 **${topResult.title}**\n`
      botResponse += `${topResult.content_excerpt || topResult.description}\n\n`
      botResponse += `💡 *If you need more specific information, please contact our front desk.*`
      
      console.log('\n🤖 Generated bot response:')
      console.log(botResponse)
    } else {
      console.log('❌ Botpress workflow simulation failed - no results found')
    }
  } catch (error) {
    console.error('❌ Error in Botpress workflow simulation:', error.message)
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Botpress Embeddings Integration Tests...\n')
  
  await testDocumentEmbeddings()
  await testAPIEndpoint()
  await testSupabaseFunction()
  await testWithActualEmbedding()
  await testEmbeddingGeneration()
  await testBotpressWorkflow()
  
  console.log('\n✅ All tests completed!')
  console.log('\n📋 Next steps:')
  console.log('1. If embeddings are missing, check your document upload process')
  console.log('2. If API tests fail, verify your ngrok URL and API endpoint')
  console.log('3. If Supabase tests fail, check your database functions and permissions')
  console.log('4. Use the working code in botpress-fixed-document-search.js or botpress-direct-supabase-search.js')
  console.log('5. The new embedding generation API is available at /api/generate-embedding')
}

// Run the tests
runAllTests().catch(console.error) 