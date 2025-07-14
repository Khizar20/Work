/**
 * Botpress Execute Code: Simplified Hotel Document Search
 * Uses direct text search without embeddings to avoid API failures
 */

// Configuration
const SUPABASE_URL = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';

/**
 * Search hotel documents using direct text search
 */
async function searchHotelDocuments(hotelId, query, limit = 5) {
  try {
    console.log('🔍 Searching documents for hotel:', hotelId, 'query:', query);
    
    // Clean and prepare search terms
    const searchTerms = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);
    
    console.log('🔍 Search terms:', searchTerms);
    
    // Build search query for multiple terms
    const searchQuery = searchTerms.map(term => `title.ilike.%${term}%,description.ilike.%${term}%`).join(',');
    
    const params = new URLSearchParams({
      hotel_id: `eq.${hotelId}`,
      processed: 'eq.true',
      or: searchQuery,
      select: 'id,title,description,file_url,created_at',
      limit: limit.toString(),
      order: 'created_at.desc'
    });

    console.log('🔗 Request URL:', `${SUPABASE_URL}/rest/v1/documents?${params}`);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?${params}`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Found documents:', data.length);
    
    return data || [];
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    return [];
  }
}

/**
 * Generate a response based on search results
 */
function generateResponse(searchResults, userQuery, hotelName) {
  if (!searchResults || searchResults.length === 0) {
    return {
      success: true,
      found: false,
      response: `I couldn't find specific information about "${userQuery}" in our ${hotelName} documents. For accurate information about check-in times, amenities, and services, please contact our front desk or check the information in your room.`,
      sources: []
    };
  }

  const topResult = searchResults[0];
  let responseText = '';

  // Check if we have a good match
  if (topResult.description && topResult.description.trim().length > 0) {
    responseText = `Based on our ${hotelName} documentation: ${topResult.description}`;
  } else {
    responseText = `According to our ${hotelName} information in "${topResult.title}", I found relevant details about your question.`;
  }

  // Add additional sources if available
  if (searchResults.length > 1) {
    const additionalTitles = searchResults.slice(1, 3).map(r => r.title).join(', ');
    responseText += ` You can also find more information in: ${additionalTitles}.`;
  }

  return {
    success: true,
    found: true,
    response: responseText,
    sources: searchResults.map(result => ({
      title: result.title,
      description: result.description ? result.description.substring(0, 200) + '...' : ''
    })),
    query: userQuery,
    hotel_name: hotelName
  };
}

/**
 * Main execution function
 */
async function executeDocumentSearch() {
  try {
    console.log('🚀 Starting simplified document search...');
    
    // Get user query and hotel info from the previous node
    const userQuery = event.preview || event.payload.text || '';
    const hotelId = user.hotel_id || workflow.hotel_id;
    const hotelName = user.hotel_name || workflow.hotel_name || 'Hotel';
    
    console.log(`🔍 Query: "${userQuery}"`);
    console.log(`🏨 Hotel: ${hotelName} (ID: ${hotelId})`);
    
    // Validate inputs
    if (!userQuery || userQuery.length < 3) {
      workflow.searchResult = {
        success: false,
        found: false,
        response: "Please provide a more specific question so I can help you better."
      };
      console.log('⚠️ Query too short');
      return workflow.searchResult;
    }
    
    if (!hotelId || hotelId === 'unknown') {
      workflow.searchResult = {
        success: false,
        found: false,
        response: "I need to know which hotel you're asking about. Please scan the QR code in your room."
      };
      console.log('⚠️ No hotel ID available');
      return workflow.searchResult;
    }

    // Search hotel documents
    console.log('🔎 Searching hotel documents...');
    const searchResults = await searchHotelDocuments(hotelId, userQuery, 5);
    
    // Generate response
    console.log('💬 Generating response...');
    const result = generateResponse(searchResults, userQuery, hotelName);
    
    // Store result in workflow
    workflow.searchResult = result;
    
    console.log('✅ Document search completed:', result);
    return result;

  } catch (error) {
    console.error('❌ Document search failed:', error);
    
    workflow.searchResult = {
      success: false,
      found: false,
      response: `I'm having trouble accessing our hotel information right now. Please contact our front desk for immediate assistance.`,
      sources: [],
      error: error.message
    };

    return workflow.searchResult;
  }
}

// Execute the search
executeDocumentSearch(); 