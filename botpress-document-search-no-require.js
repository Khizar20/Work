/**
 * Botpress Execute Code: Hotel Document Search (No Require)
 * Uses native fetch instead of axios require
 */

// Configuration - UPDATE THESE VALUES
const SUPABASE_URL = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const HF_API_KEY = 'YOUR_HUGGING_FACE_API_KEY_HERE';
const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Generate embedding for user query using native fetch
 */
async function generateQueryEmbedding(query) {
  try {
    console.log('🔄 Generating embedding for:', query);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: query })
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Embedding generated successfully');
    return data;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
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
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/search_hotel_documents`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotel_id_param: hotelId,
          query_embedding: embeddingString,
          similarity_threshold: 0.5,
          match_count: limit
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Document search completed, found:', data.length, 'results');
    return data || [];
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    // Fallback to simple search
    return await fallbackTextSearch(hotelId, queryEmbedding.originalQuery);
  }
}

/**
 * Fallback text search using native fetch
 */
async function fallbackTextSearch(hotelId, query) {
  try {
    console.log('🔄 Attempting fallback text search');
    
    const params = new URLSearchParams({
      hotel_id: `eq.${hotelId}`,
      processed: 'eq.true',
      or: `title.ilike.%${query}%,description.ilike.%${query}%`,
      select: 'id,title,description,file_url,created_at',
      limit: '3'
    });

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?${params}`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Fallback search completed');
    return data || [];
  } catch (error) {
    console.error('❌ Fallback search error:', error);
    return [];
  }
}

/**
 * Main execution function
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

    // Step 1: Generate embedding for user query
    console.log('📊 Generating query embedding...');
    const queryEmbedding = await generateQueryEmbedding(userQuery);
    queryEmbedding.originalQuery = userQuery; // Store original query for fallback
    
    // Step 2: Search hotel-specific documents
    console.log('🔎 Searching hotel documents...');
    const searchResults = await searchHotelDocuments(hotelId, queryEmbedding, 3);
    
    // Step 3: Generate response
    console.log('💬 Generating response...');
    if (searchResults && searchResults.length > 0) {
      const topResult = searchResults[0];
      let responseText = '';
      
      // Check similarity score
      if (topResult.similarity && topResult.similarity > 0.7) {
        // High confidence
        if (topResult.description) {
          responseText = `Based on our ${hotelName} documentation: ${topResult.description}`;
        } else {
          responseText = `According to our ${hotelName} information in "${topResult.title}", I found relevant details about your question.`;
        }
      } else if (topResult.similarity && topResult.similarity > 0.5) {
        // Medium confidence
        responseText = `I found some information about "${userQuery}" in our ${hotelName} documents. According to "${topResult.title}", here's what I can tell you.`;
        if (topResult.description) {
          responseText += ` ${topResult.description}`;
        }
      } else {
        // Lower confidence
        responseText = `I found information related to "${userQuery}" in our ${hotelName} documentation. For the most accurate details, please check our "${topResult.title}" document or contact our front desk.`;
      }
      
      // Add additional sources
      if (searchResults.length > 1) {
        const additionalTitles = searchResults.slice(1).map(r => r.title).join(', ');
        responseText += ` You can also find more information in: ${additionalTitles}.`;
      }
      
      workflow.searchResult = {
        success: true,
        found: true,
        response: responseText,
        sources: searchResults.map(result => ({
          title: result.title,
          relevance: result.similarity || 0
        })),
        query: userQuery,
        hotel_name: hotelName
      };
      
    } else {
      // No results found
      workflow.searchResult = {
        success: true,
        found: false,
        response: `I couldn't find specific information about "${userQuery}" in our ${hotelName} documents. Please contact our front desk for personalized assistance, or try asking about our general hotel amenities and services.`,
        sources: [],
        query: userQuery,
        hotel_name: hotelName
      };
    }

    console.log('✅ Document search completed:', workflow.searchResult);
    return workflow.searchResult;

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