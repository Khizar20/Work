// Botpress Execute Code: Hotel Document Search Flow
// This code searches hotel-specific documents using vector embeddings

const axios = require('axios');

// Supabase configuration
const SUPABASE_URL = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';

// HuggingFace API for embeddings (free alternative)
const HF_API_KEY = 'hf_your_api_key'; // You'll need to get this from HuggingFace
const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Generate embedding for user query using HuggingFace API
 */
async function generateQueryEmbedding(query) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
      { inputs: query },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Search hotel documents using vector similarity
 */
async function searchHotelDocuments(hotelId, queryEmbedding, limit = 3) {
  try {
    // Convert embedding array to string format for PostgreSQL
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Use Supabase RPC function for vector similarity search
    const { data, error } = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/search_hotel_documents`,
      {
        hotel_id_param: hotelId,
        query_embedding: embeddingString,
        similarity_threshold: 0.5,
        match_count: limit
      },
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error searching documents:', error);
    // Fallback to simple text search if vector search fails
    return await fallbackTextSearch(hotelId, queryEmbedding.query);
  }
}

/**
 * Fallback text search when vector search fails
 */
async function fallbackTextSearch(hotelId, query) {
  try {
    const { data, error } = await axios.get(
      `${SUPABASE_URL}/rest/v1/documents`,
      {
        params: {
          hotel_id: `eq.${hotelId}`,
          processed: 'eq.true',
          or: `title.ilike.%${query}%,description.ilike.%${query}%`,
          select: 'id,title,description,file_url,created_at',
          limit: 3
        },
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Fallback search error:', error);
    return [];
  }
}

/**
 * Generate contextual response from search results
 */
function generateResponse(searchResults, userQuery, hotelName) {
  if (!searchResults || searchResults.length === 0) {
    return {
      found: false,
      response: `I couldn't find specific information about "${userQuery}" in our ${hotelName} documents. Please contact our front desk at reception for personalized assistance, or try asking about our general hotel amenities and services.`,
      sources: []
    };
  }

  // Extract relevant information from top results
  const topResult = searchResults[0];
  const additionalSources = searchResults.slice(1, 3);

  let response = '';
  
  // Check if we have good similarity (assuming similarity score is provided)
  if (topResult.similarity && topResult.similarity > 0.7) {
    // High confidence answer
    if (topResult.description) {
      response = `Based on our ${hotelName} documentation: ${topResult.description}`;
    } else {
      response = `According to our ${hotelName} information in "${topResult.title}", I found relevant details about your question.`;
    }
    
    // Add additional context if available
    if (additionalSources.length > 0) {
      response += ` You can also find more information in our ${additionalSources.map(s => s.title).join(' and ')}.`;
    }
  } else {
    // Lower confidence - provide general guidance
    response = `I found some information related to "${userQuery}" in our ${hotelName} documentation. For the most accurate and up-to-date information, I recommend checking our "${topResult.title}" document or contacting our front desk directly.`;
  }

  return {
    found: true,
    response: response,
    sources: searchResults.map(result => ({
      title: result.title,
      url: result.file_url,
      relevance: result.similarity || 0
    }))
  };
}

/**
 * Main execution function
 */
async function executeDocumentSearch() {
  try {
    // Get user query from the conversation
    const userQuery = event.preview || event.payload.text || '';
    
    // Get hotel information from user session (previously stored)
    const hotelId = event.state.user.hotel_id || event.state.session.hotel_id;
    const hotelName = event.state.user.hotel_name || event.state.session.hotel_name || 'Hotel';
    
    console.log(`🔍 Searching documents for hotel: ${hotelId}, query: "${userQuery}"`);
    
    // Validate inputs
    if (!userQuery || userQuery.length < 3) {
      return {
        success: false,
        message: "Please provide a more specific question so I can help you better.",
        found: false
      };
    }
    
    if (!hotelId) {
      return {
        success: false,
        message: "I need to know which hotel you're asking about. Please scan the QR code in your room or let me know your hotel name.",
        found: false
      };
    }

    // Step 1: Generate embedding for user query
    console.log('📊 Generating query embedding...');
    const queryEmbedding = await generateQueryEmbedding(userQuery);
    
    // Step 2: Search hotel-specific documents
    console.log('🔎 Searching hotel documents...');
    const searchResults = await searchHotelDocuments(hotelId, queryEmbedding, 3);
    
    // Step 3: Generate contextual response
    console.log('💬 Generating response...');
    const result = generateResponse(searchResults, userQuery, hotelName);
    
    // Step 4: Store search analytics (optional)
    try {
      await axios.post(`${SUPABASE_URL}/rest/v1/search_analytics`, {
        hotel_id: hotelId,
        query: userQuery,
        results_found: result.found,
        result_count: searchResults.length,
        session_id: event.state.user.session_id || 'unknown'
      }, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (analyticsError) {
      console.warn('Analytics logging failed:', analyticsError.message);
    }

    // Return result to Botpress workflow
    workflow.searchResult = {
      success: true,
      found: result.found,
      response: result.response,
      sources: result.sources,
      query: userQuery,
      hotel_name: hotelName
    };

    return workflow.searchResult;

  } catch (error) {
    console.error('❌ Document search failed:', error);
    
    // Return graceful error response
    workflow.searchResult = {
      success: false,
      found: false,
      response: `I'm having trouble accessing our hotel information right now. Please contact our front desk for immediate assistance with your question about "${userQuery}".`,
      sources: [],
      error: error.message
    };

    return workflow.searchResult;
  }
}

// Execute the search
executeDocumentSearch(); 