/**
 * Botpress Execute Code: RAG Chunk-based Document Search
 * Uses new chunking system for semantically relevant answers
 * Compatible with Botpress environment
 * 
 * TESTING VERSION - Uses hardcoded hotel parameters
 */

// Configuration - Update this to your actual API URL
const API_BASE_URL = 'https://f6dd2fd58666.ngrok-free.app' // Your ngrok URL
const SEARCH_ENDPOINT = '/api/search-documents'

// HARDCODED TESTING PARAMETERS
const HARDCODED_HOTEL_ID = '8a1e6805-9253-4dd5-8893-0de3d7815555'
const HARDCODED_ROOM_NUMBER = '102'
const HARDCODED_HOTEL_NAME = 'VillaLaSalla'

/**
 * Search hotel documents using RAG chunking system
 * This provides semantically relevant answers instead of generic content
 */
async function searchViaRAGAPI(hotelId, query, limit = 5) {
  try {
    console.log('🔍 Searching via RAG API for hotel:', hotelId, 'query:', query)

    const requestBody = {
      query: query,
      hotel_id: hotelId,
      limit: limit,
      match_threshold: 0.0, // Very low threshold to find any relevant matches
      use_chunks: true // Enable chunk-based search
    }

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}${SEARCH_ENDPOINT}`,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      data: requestBody,
      timeout: 30000 // Increased timeout for embedding generation
    })

    console.log('✅ RAG API search completed, status:', response.status)
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2))

    return response.data
  } catch (error) {
    console.error('❌ RAG API search error:', error.message)
    if (error.response) {
      console.error('❌ API Error Status:', error.response.status)
      console.error('❌ API Error Data:', JSON.stringify(error.response.data, null, 2))
    }
    throw error
  }
}

/**
 * Generate contextual response based on chunk search results
 * Now provides semantically relevant answers
 */
function generateRAGResponse(searchResults, userQuery, hotelName) {
  if (!searchResults || !searchResults.success) {
    return {
      success: false,
      found: false,
      response: `I'm having trouble accessing our ${hotelName} documents right now. Please contact our front desk for assistance.`,
      sources: [],
      query: userQuery,
      hotel_name: hotelName
    }
  }

  const results = searchResults.results || []
  
  if (results.length === 0) {
    return {
      success: true,
      found: false,
      response: `I couldn't find specific information about "${userQuery}" in our ${hotelName} documents. Let me connect you with our front desk for personalized assistance.`,
      sources: [],
      query: userQuery,
      hotel_name: hotelName
    }
  }

  // Build contextual response from chunk results
  const topResult = results[0]
  let responseText = ''

  // Check if we have chunk-based results (more specific)
  if (topResult.chunk_content) {
    console.log('📄 Using chunk-based results for semantic relevance')
    
    if (topResult.similarity && topResult.similarity > 0.7) {
      // High confidence response
      responseText = `Based on our ${hotelName} documentation:\n\n`
      responseText += `${topResult.chunk_content}\n\n`
    } else if (topResult.similarity && topResult.similarity > 0.4) {
      // Medium confidence response
      responseText = `I found information about "${userQuery}" in our ${hotelName} documents:\n\n`
      responseText += `${topResult.chunk_content}\n\n`
    } else {
      // Lower confidence response
      responseText = `Here's what I found in our ${hotelName} documents that might help with "${userQuery}":\n\n`
      responseText += `${topResult.chunk_content}\n\n`
    }

    // Add additional relevant chunks if available
    if (results.length > 1) {
      const additionalChunks = results.slice(1, 3).filter(r => r.chunk_content)
      if (additionalChunks.length > 0) {
        responseText += `\n**Additional Information:**\n`
        additionalChunks.forEach((result, index) => {
          responseText += `${index + 2}. ${result.chunk_content.substring(0, 150)}...\n`
        })
      }
    }
  } else {
    // Fallback to document-level results
    console.log('📄 Using document-level results as fallback')
    
    responseText = `Based on our ${hotelName} documentation:\n\n`
    responseText += `📄 **${topResult.title}**\n`
    responseText += `${topResult.content_excerpt || topResult.description}\n\n`

    // Add additional sources if available
    if (results.length > 1) {
      responseText += `\n**Additional Information:**\n`
      results.slice(1, 3).forEach((result, index) => {
        responseText += `${index + 2}. **${result.title}** - ${(result.content_excerpt || result.description || '').substring(0, 100)}...\n`
      })
    }
  }

  responseText += `\n💡 *If you need more specific information, please contact our front desk.*`

  return {
    success: true,
    found: true,
    response: responseText,
    sources: results.map((result) => ({
      title: result.title || result.document_title,
      relevance: result.similarity || 0,
      content: result.chunk_content || result.content_excerpt || result.description || '',
      file_type: result.file_type,
      is_chunk: !!result.chunk_content
    })),
    query: userQuery,
    hotel_name: hotelName,
    count: results.length,
    search_type: 'rag_chunks'
  }
}

/**
 * Main execution function
 */
async function executeRAGDocumentSearch() {
  try {
    console.log('🚀 Starting RAG chunk-based document search...')

    // Get user query - use hardcoded hotel parameters for testing
    const userQuery = event.preview || event.payload.text || ''
    const hotelId = HARDCODED_HOTEL_ID
    const hotelName = HARDCODED_HOTEL_NAME
    const roomNumber = HARDCODED_ROOM_NUMBER

    console.log(`🔍 User Query: "${userQuery}"`)
    console.log(`🏨 Hotel: ${hotelName}`)
    console.log(`🆔 Hotel ID: ${hotelId}`)
    console.log(`🚪 Room Number: ${roomNumber}`)
    console.log('🧪 TESTING MODE - Using hardcoded parameters')
    console.log('🔧 RAG MODE - Using chunk-based semantic search')

    // Input validation
    if (!userQuery || userQuery.trim().length < 2) {
      const result = {
        success: false,
        found: false,
        response: 'Please provide a more specific question so I can help you better.',
        error: 'Query too short',
        hotel_name: hotelName,
        room_number: roomNumber
      }
      workflow.searchResult = result
      return result
    }

    // Search using RAG chunking system
    console.log('📊 Searching via RAG API (chunk-based semantic search)...')
    const searchResults = await searchViaRAGAPI(hotelId, userQuery.trim(), 5)

    // Generate contextual response
    console.log('💬 Generating RAG-based contextual response...')
    const result = generateRAGResponse(searchResults, userQuery, hotelName)

    // Add testing info to result
    result.hotel_id = hotelId
    result.room_number = roomNumber
    result.testing_mode = true
    result.rag_enabled = true

    // Store result in workflow
    workflow.searchResult = result

    console.log('🎯 RAG search completed:', result.found ? 'Found results' : 'No results')
    console.log('📝 Response length:', result.response.length)
    console.log('🔍 Search type:', result.search_type)

    return result
  } catch (error) {
    console.error('❌ RAG document search failed:', error.message)
    console.error('❌ Stack trace:', error.stack)

    // Fallback result
    const fallbackResult = {
      success: false,
      found: false,
      response: "I'm having trouble accessing our hotel information right now. Please contact our front desk for immediate assistance, or try again in a moment.",
      error: error.message,
      hotel_name: HARDCODED_HOTEL_NAME,
      hotel_id: HARDCODED_HOTEL_ID,
      room_number: HARDCODED_ROOM_NUMBER,
      testing_mode: true,
      rag_enabled: true
    }

    workflow.searchResult = fallbackResult
    return fallbackResult
  }
}

// Main execution
console.log('🔍 Starting RAG Chunk-based Hotel Document Search...')
console.log('🧪 TESTING MODE - Using hardcoded parameters:')
console.log('🏨 Hotel:', HARDCODED_HOTEL_NAME)
console.log('🆔 Hotel ID:', HARDCODED_HOTEL_ID)
console.log('🚪 Room:', HARDCODED_ROOM_NUMBER)
console.log('📝 User Query:', event.preview || event.payload.text || '')
console.log('🔧 RAG MODE - Chunk-based semantic search enabled')

// Execute the RAG search
const result = await executeRAGDocumentSearch()

console.log('✅ RAG search execution completed')
console.log('📊 Final result:', result.success ? 'Success' : 'Failed')
console.log('🎯 Found information:', result.found ? 'Yes' : 'No')
console.log('🔍 Search type:', result.search_type || 'standard')

// The result is already stored in workflow.searchResult
// You can access it in subsequent nodes via workflow.searchResult 