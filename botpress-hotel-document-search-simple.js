// Botpress Execute Code: Simplified Hotel Document Search
// Uses existing API endpoint for document search

const axios = require('axios');

/**
 * Main execution function - simplified version using existing API
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
      workflow.searchResult = {
        success: false,
        found: false,
        response: "Please provide a more specific question so I can help you better."
      };
      return workflow.searchResult;
    }
    
    if (!hotelId) {
      workflow.searchResult = {
        success: false,
        found: false,
        response: "I need to know which hotel you're asking about. Please scan the QR code in your room."
      };
      return workflow.searchResult;
    }

    // Use your existing API endpoint for document search
    const response = await axios.post('http://localhost:3000/api/search-documents', {
      query: userQuery,
      hotel_id: hotelId,
      limit: 3
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const searchData = response.data;
    
    if (searchData.found && searchData.results && searchData.results.length > 0) {
      // Found relevant documents
      const topResult = searchData.results[0];
      let responseText = '';
      
      if (topResult.content || topResult.description) {
        responseText = `Based on our ${hotelName} documentation: ${topResult.content || topResult.description}`;
      } else {
        responseText = `I found information about "${userQuery}" in our ${hotelName} documents. For detailed information, please check our "${topResult.title}" document.`;
      }
      
      // Add additional sources if available
      if (searchData.results.length > 1) {
        const additionalTitles = searchData.results.slice(1).map(r => r.title).join(', ');
        responseText += ` You can also find more details in: ${additionalTitles}.`;
      }
      
      workflow.searchResult = {
        success: true,
        found: true,
        response: responseText,
        sources: searchData.results.map(result => ({
          title: result.title,
          relevance: result.similarity || result.score || 0
        })),
        query: userQuery,
        hotel_name: hotelName
      };
      
    } else {
      // No relevant documents found
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
    
    // Return graceful error response
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