// CORRECTED BOTPRESS ACTIONS - Using Botpress HTTP Client (No fetch errors)

// Action 1: Search Hotel Documents (FIXED for Botpress)
const searchHotelDocuments = async () => {
  const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const user_query = workflow.user_query || "default query";
  
  try {
    console.log('🔍 Searching documents for hotel:', hotel_id);
    console.log('📝 Query:', user_query);
    
    // FIXED: Use Botpress HTTP client instead of fetch
    const { data } = await bp.http.post('http://localhost:3000/api/botpress-search', {
      query: user_query,
      hotel_id: hotel_id,
      limit: 3
    });
    
    console.log('✅ Search response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.results && data.results.length > 0) {
      // Store successful results in workflow
      workflow.search_results = data.results;
      workflow.documents_found = true;
      workflow.document_count = data.count;
      
      // Create context for AI response
      const context = data.results.map(doc => 
        `Document: ${doc.title}\nContent: ${doc.content}\nType: ${doc.type}`
      ).join('\n\n');
      
      workflow.search_context = context;
      console.log('📄 Documents found:', data.count);
      
    } else {
      workflow.search_results = [];
      workflow.documents_found = false;
      workflow.document_count = 0;
      workflow.search_context = 'No relevant hotel documents found.';
      console.log('❌ No documents found for query');
    }
    
  } catch (error) {
    console.error('❌ Document search error:', error);
    workflow.search_results = [];
    workflow.documents_found = false;
    workflow.document_count = 0;
    workflow.search_context = 'Unable to search hotel documents at this time.';
  }
};

// Action 2: Generate Hotel Response (IMPROVED)
const generateHotelResponse = async () => {
  const hotel_name = workflow.hotel_name || "Hotel Grand NewWest";
  const room_number = workflow.room_number || "";
  const user_query = workflow.user_query || "";
  const search_context = workflow.search_context || "";
  const documents_found = workflow.documents_found || false;
  
  try {
    console.log('🤖 Generating response for query:', user_query);
    console.log('📄 Documents found:', documents_found);
    
    let response_text;
    
    if (documents_found && search_context !== 'No relevant hotel documents found.') {
      // Generate response based on found documents
      response_text = `Hello! I found some information about "${user_query}" from our ${hotel_name} documents:

${search_context}

${room_number ? `For your room ${room_number}, ` : ''}Is there anything specific you'd like to know more about? I'm here to help! 🏨`;
      
    } else {
      // Fallback response when no documents found
      response_text = `Hello! I don't have specific information about "${user_query}" in our ${hotel_name} documents. Please contact our front desk for assistance. ${room_number ? `They can help you with room ${room_number} ` : ''}How else can I assist you today? 🏨`;
    }
    
    workflow.hotelResponse = response_text;
    console.log('✅ Generated response length:', response_text.length);
    
  } catch (error) {
    console.error('❌ Response generation error:', error);
    workflow.hotelResponse = `I'm sorry, I'm having trouble processing your request right now. Please contact our front desk for assistance. How else can I help you today? 🏨`;
  }
};

// ALTERNATIVE VERSION (if bp.http doesn't work, try this):
const searchHotelDocumentsAlternative = async () => {
  const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const user_query = workflow.user_query || "default query";
  
  try {
    console.log('🔍 Searching documents for hotel:', hotel_id);
    console.log('📝 Query:', user_query);
    
    // Alternative: Using axios which is usually available in Botpress
    const axios = require('axios');
    const response = await axios.post('http://localhost:3000/api/botpress-search', {
      query: user_query,
      hotel_id: hotel_id,
      limit: 3
    });
    
    const data = response.data;
    console.log('✅ Search response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.results && data.results.length > 0) {
      workflow.search_results = data.results;
      workflow.documents_found = true;
      workflow.document_count = data.count;
      
      const context = data.results.map(doc => 
        `Document: ${doc.title}\nContent: ${doc.content}\nType: ${doc.type}`
      ).join('\n\n');
      
      workflow.search_context = context;
      console.log('📄 Documents found:', data.count);
      
    } else {
      workflow.search_results = [];
      workflow.documents_found = false;
      workflow.document_count = 0;
      workflow.search_context = 'No relevant hotel documents found.';
      console.log('❌ No documents found for query');
    }
    
  } catch (error) {
    console.error('❌ Document search error:', error);
    workflow.search_results = [];
    workflow.documents_found = false;
    workflow.document_count = 0;
    workflow.search_context = 'Unable to search hotel documents at this time.';
  }
};

// USAGE INSTRUCTIONS:
/*
STEP 1: Try the first version with bp.http.post()
STEP 2: If that doesn't work, try the alternative version with axios
STEP 3: In your Botpress action node, use one of these:

OPTION A (Recommended):
=============================
const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
const user_query = workflow.user_query || "default query";

try {
  const { data } = await bp.http.post('http://localhost:3000/api/botpress-search', {
    query: user_query,
    hotel_id: hotel_id,
    limit: 3
  });
  
  if (data.success && data.results && data.results.length > 0) {
    workflow.search_results = data.results;
    workflow.documents_found = true;
    const context = data.results.map(doc => 
      `${doc.title}: ${doc.content}`
    ).join('\n\n');
    workflow.search_context = context;
  } else {
    workflow.documents_found = false;
    workflow.search_context = 'No relevant hotel documents found.';
  }
} catch (error) {
  console.error('❌ Search error:', error);
  workflow.documents_found = false;
  workflow.search_context = 'Unable to search documents.';
}

OPTION B (If Option A fails):
=============================
const axios = require('axios');
const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
const user_query = workflow.user_query || "default query";

try {
  const response = await axios.post('http://localhost:3000/api/botpress-search', {
    query: user_query,
    hotel_id: hotel_id,
    limit: 3
  });
  
  const data = response.data;
  if (data.success && data.results && data.results.length > 0) {
    workflow.search_results = data.results;
    workflow.documents_found = true;
    const context = data.results.map(doc => 
      `${doc.title}: ${doc.content}`
    ).join('\n\n');
    workflow.search_context = context;
  } else {
    workflow.documents_found = false;
    workflow.search_context = 'No relevant hotel documents found.';
  }
} catch (error) {
  console.error('❌ Search error:', error);
  workflow.documents_found = false;
  workflow.search_context = 'Unable to search documents.';
}
*/ 