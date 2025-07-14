/**
 * Botpress Execute Code: Hotel Document Search - Fixed API & Robust Fallback
 * Fixes HuggingFace API URL and adds direct text search fallback
 */

// Configuration
const SUPABASE_URL = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const HF_API_KEY = 'YOUR_HUGGING_FACE_API_KEY_HERE';
const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Generate embedding for user query using axios - FIXED URL
 */
async function generateQueryEmbedding(query) {
  try {
    console.log('🔄 Generating embedding for:', query);
    
    // FIXED: Correct HuggingFace API URL format
    const response = await axios({
      method: 'POST',
      url: `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: { inputs: query },
      timeout: 8000  // Reduced timeout
    });
    
    console.log('✅ Embedding generated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

/**
 * Search hotel documents using vector similarity
 */
async function searchHotelDocuments(hotelId, queryEmbedding, limit = 3) {
  try {
    console.log('🔍 Searching documents for hotel:', hotelId);
    
    // Convert embedding array to string format for PostgreSQL
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    const response = await axios({
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/search_hotel_documents`,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        hotel_id_param: hotelId,
        query_embedding: embeddingString,
        similarity_threshold: 0.5,
        match_count: limit
      },
      timeout: 8000
    });

    console.log('✅ Vector search completed, found:', response.data.length, 'results');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error in vector search:', error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

/**
 * Direct text search without embeddings
 */
async function directTextSearch(hotelId, query, limit = 5) {
  try {
    console.log('🔄 Direct text search for:', query);
    
    // Clean and prepare search terms
    const searchTerms = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);
    
    console.log('🔍 Search terms:', searchTerms);
    
    // Build search query for multiple terms
    const searchQuery = searchTerms.map(term => 
      `title.ilike.%${term}%,description.ilike.%${term}%`
    ).join(',');
    
    const response = await axios({
      method: 'GET',
      url: `${SUPABASE_URL}/rest/v1/documents`,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        hotel_id: `eq.${hotelId}`,
        processed: 'eq.true',
        or: searchQuery,
        select: 'id,title,description,file_url,created_at',
        limit: limit.toString(),
        order: 'created_at.desc'
      },
      timeout: 8000
    });

    console.log('✅ Direct text search completed, found:', response.data.length, 'results');
    return response.data || [];
  } catch (error) {
    console.error('❌ Direct text search error:', error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2));
    return [];
  }
}

/**
 * Generate response based on search results
 */
function generateResponse(searchResults, userQuery, hotelName, searchType = 'vector') {
  if (!searchResults || searchResults.length === 0) {
    return {
      success: true,
      found: false,
      response: `I couldn't find specific information about "${userQuery}" in our ${hotelName} documents. For accurate information about check-in times, amenities, and services, please contact our front desk or check the information in your room.`,
      sources: [],
      query: userQuery,
      hotel_name: hotelName,
      search_type: searchType
    };
  }

  const topResult = searchResults[0];
  let responseText = '';

  // Different response formatting based on search type
  if (searchType === 'vector' && topResult.similarity) {
    // Vector search results with similarity scores
    if (topResult.similarity > 0.7) {
      responseText = `Based on our ${hotelName} documentation: ${topResult.description || topResult.title}`;
    } else if (topResult.similarity > 0.5) {
      responseText = `I found information about "${userQuery}" in our ${hotelName} documents. According to "${topResult.title}", here's what I can tell you.`;
      if (topResult.description) {
        responseText += ` ${topResult.description}`;
      }
    } else {
      responseText = `I found some related information in our ${hotelName} documentation. For specific details about "${userQuery}", please check "${topResult.title}" or contact our front desk.`;
    }
  } else {
    // Direct text search results
    if (topResult.description && topResult.description.trim().length > 0) {
      responseText = `Based on our ${hotelName} documentation: ${topResult.description}`;
    } else {
      responseText = `According to our ${hotelName} information in "${topResult.title}", I found relevant details about your question.`;
    }
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
      relevance: result.similarity || 0,
      description: result.description ? result.description.substring(0, 200) + '...' : ''
    })),
    query: userQuery,
    hotel_name: hotelName,
    search_type: searchType
  };
}

/**
 * Main execution function with robust fallback
 */
async function executeDocumentSearch() {
  try {
    console.log('🚀 Starting document search...');
    
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

    let searchResults = [];
    let searchType = 'vector';
    
    // Try vector search first
    try {
      console.log('📊 Attempting vector search...');
      const queryEmbedding = await generateQueryEmbedding(userQuery);
      searchResults = await searchHotelDocuments(hotelId, queryEmbedding, 3);
      console.log('✅ Vector search successful');
    } catch (embeddingError) {
      console.log('⚠️ Vector search failed, falling back to text search');
      console.error('🔄 Embedding error:', embeddingError.message);
      
      // Fallback to direct text search
      searchResults = await directTextSearch(hotelId, userQuery, 5);
      searchType = 'text';
      console.log('✅ Text search fallback completed');
    }
    
    // Generate response
    console.log('💬 Generating response...');
    const result = generateResponse(searchResults, userQuery, hotelName, searchType);
    
    // Store result in workflow
    workflow.searchResult = result;
    
    console.log('✅ Document search completed:', result);
    return result;

  } catch (error) {
    console.error('❌ Document search completely failed:', error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2));
    
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