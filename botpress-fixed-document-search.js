/**
 * Botpress Execute Code: Hotel Document Search via Working API
 * Updated to work with your existing /api/search-documents endpoint
 * No HuggingFace API needed - uses local embeddings generation
 */

// Configuration - Update this to your actual API URL
const API_BASE_URL = 'https://cf71b76d6207.ngrok-free.app' // Your ngrok URL
const SEARCH_ENDPOINT = '/api/search-documents'

/**
 * Search hotel documents using your existing working API
 */
async function searchViaAPI(hotelId, query, limit = 3) {
  try {
    console.log('🔍 Searching via API for hotel:', hotelId, 'query:', query)

    const requestBody = {
      query: query,
      hotel_id: hotelId,
      limit: limit,
      match_threshold: 0.15 // Lower threshold for better matches
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

    console.log('✅ API search completed, status:', response.status)
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2))

    return response.data
  } catch (error) {
    console.error('❌ API search error:', error.message)
    if (error.response) {
      console.error('❌ API Error Status:', error.response.status)
      console.error('❌ API Error Data:', JSON.stringify(error.response.data, null, 2))
    }
    throw error
  }
}

/**
 * Generate contextual response based on search results
 */
function generateContextualResponse(searchResults, userQuery, hotelName) {
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

  // Build contextual response from search results
  const topResult = results[0]
  let responseText = ''

  if (topResult.similarity && topResult.similarity > 0.7) {
    // High confidence response
    responseText = `Based on our ${hotelName} documentation:\n\n`
    responseText += `📄 **${topResult.title}**\n`
    responseText += `${topResult.content_excerpt || topResult.description}\n\n`
  } else if (topResult.similarity && topResult.similarity > 0.4) {
    // Medium confidence response
    responseText = `I found information about "${userQuery}" in our ${hotelName} documents:\n\n`
    responseText += `📄 **${topResult.title}**\n`
    responseText += `${topResult.content_excerpt || topResult.description}\n\n`
  } else {
    // Lower confidence response
    responseText = `Here's what I found in our ${hotelName} documents that might help with "${userQuery}":\n\n`
    responseText += `📄 **${topResult.title}**\n`
    responseText += `${topResult.content_excerpt || topResult.description}\n\n`
  }

  // Add additional sources if available
  if (results.length > 1) {
    responseText += `\n**Additional Information:**\n`
    results.slice(1, 3).forEach((result, index) => {
      responseText += `${index + 2}. **${result.title}** - ${(result.content_excerpt || result.description || '').substring(0, 100)}...\n`
    })
  }

  responseText += `\n💡 *If you need more specific information, please contact our front desk.*`

  return {
    success: true,
    found: true,
    response: responseText,
    sources: results.map((result) => ({
      title: result.title,
      relevance: result.similarity || 0,
      content: result.content_excerpt || result.description || '',
      file_type: result.file_type
    })),
    query: userQuery,
    hotel_name: hotelName,
    count: results.length
  }
}

/**
 * Main execution function
 */
async function executeDocumentSearch() {
  try {
    console.log('🚀 Starting document search...')

    // Get user query and hotel info
    const userQuery = event.preview || event.payload.text || ''
    const hotelId = user.hotel_id || workflow.hotel_id || ''
    const hotelName = user.hotel_name || workflow.hotel_name || 'Hotel'

    console.log(`🔍 User Query: "${userQuery}"`)
    console.log(`🏨 Hotel: ${hotelName}`)
    console.log(`🆔 Hotel ID: ${hotelId}`)

    // Input validation
    if (!userQuery || userQuery.trim().length < 2) {
      const result = {
        success: false,
        found: false,
        response: 'Please provide a more specific question so I can help you better.',
        error: 'Query too short'
      }
      workflow.searchResult = result
      return result
    }

    if (!hotelId) {
      const result = {
        success: false,
        found: false,
        response: "I need to know which hotel you're asking about. Please make sure you've scanned the QR code in your room or selected your hotel.",
        error: 'No hotel ID'
      }
      workflow.searchResult = result
      return result
    }

    // Search using your existing API
    console.log('📊 Searching via Next.js API...')
    const searchResults = await searchViaAPI(hotelId, userQuery.trim(), 5)

    // Generate contextual response
    console.log('💬 Generating contextual response...')
    const result = generateContextualResponse(searchResults, userQuery, hotelName)

    // Store result in workflow
    workflow.searchResult = result

    console.log('🎯 Search completed:', result.found ? 'Found results' : 'No results')
    console.log('📝 Response length:', result.response.length)

    return result
  } catch (error) {
    console.error('❌ Document search failed:', error.message)
    console.error('❌ Stack trace:', error.stack)

    // Fallback result
    const fallbackResult = {
      success: false,
      found: false,
      response: "I'm having trouble accessing our hotel information right now. Please contact our front desk for immediate assistance, or try again in a moment.",
      error: error.message,
      hotel_name: user.hotel_name || workflow.hotel_name || 'Hotel'
    }

    workflow.searchResult = fallbackResult
    return fallbackResult
  }
}

// Main execution
console.log('🔍 Starting Hotel Document Search...')
console.log('📝 User Query:', event.preview || event.payload.text || '')
console.log('🏨 Hotel:', user.hotel_name || workflow.hotel_name || 'Unknown')
console.log('🆔 Hotel ID:', user.hotel_id || workflow.hotel_id || 'Unknown')

// Execute the search
const result = await executeDocumentSearch()

console.log('✅ Search execution completed')
console.log('📊 Final result:', result.success ? 'Success' : 'Failed')
console.log('🎯 Found information:', result.found ? 'Yes' : 'No')

// The result is already stored in workflow.searchResult
// You can access it in subsequent nodes via workflow.searchResult 