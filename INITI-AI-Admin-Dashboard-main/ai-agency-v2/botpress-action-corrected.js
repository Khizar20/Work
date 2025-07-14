// CORRECTED BOTPRESS ACTION CODE
// Copy this EXACT code into Botpress Cloud → Studio → Actions → searchHotelDocuments

async function action(input) {
  const { query, hotel_id, limit = 3 } = input;
  
  try {
    // Your document search API endpoint
    const API_BASE_URL = 'http://localhost:3000'; // Change to your production domain later
    
    console.log('🔍 Searching documents for hotel:', hotel_id, 'query:', query);
    
    const response = await fetch(`${API_BASE_URL}/api/search-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        hotel_id: hotel_id,
        limit: limit,
        match_threshold: 0.15
      })
    });
    
    if (!response.ok) {
      console.error('Search API error:', response.status);
      return {
        found: false,
        error: `Search failed: ${response.status}`,
        results: [],
        context: '',
        query: query
      };
    }
    
    const data = await response.json();
    
    if (data.success && data.results && data.results.length > 0) {
      // Format results for the chatbot
      const formattedResults = data.results.map((doc) => ({
        title: doc.title,
        content: doc.content_excerpt,
        similarity: doc.similarity,
        type: doc.file_type
      }));
      
      // Create context string for AI response
      const context = formattedResults
        .map((doc) => `**${doc.title}**:\n${doc.content}`)
        .join('\n\n');
      
      console.log('✅ Found', data.results.length, 'relevant documents');
      
      return {
        found: true,
        count: data.results.length,
        results: formattedResults,
        context: context,
        query: query
      };
    } else {
      console.log('📭 No relevant documents found');
      return {
        found: false,
        count: 0,
        results: [],
        context: '',
        query: query
      };
    }
    
  } catch (error) {
    console.error('❌ Document search error:', error);
    return {
      found: false,
      error: error.message,
      results: [],
      context: '',
      query: query
    };
  }
}

// ============================================
// SECOND ACTION: generateHotelResponse  
// ============================================
// Create ANOTHER action called "generateHotelResponse" with this code:

async function action(input) {
  const { query, searchResults, hotel_name, room_number } = input;
  
  try {
    let response = '';
    
    if (searchResults.found && searchResults.context) {
      // We found relevant documents
      const shortContext = searchResults.context.substring(0, 400);
      
      if (room_number) {
        response = `Based on our ${hotel_name} information:\n\n${shortContext}...\n\nFor your room ${room_number}, is there anything specific you'd like me to explain further? 😊`;
      } else {
        response = `Here's what I found in our ${hotel_name} documents:\n\n${shortContext}...\n\nWould you like more details about any of this? 🏨`;
      }
      
    } else {
      // No relevant documents found - provide helpful fallback
      if (room_number) {
        response = `I don't have specific information about "${query}" in our current hotel documents. For your room ${room_number} and the most accurate information, please contact our front desk. Is there anything else I can help you with? 📞`;
      } else {
        response = `I don't have specific information about "${query}" in our hotel documents right now. For the most accurate and up-to-date information, I recommend contacting our front desk. How else can I assist you today? 🏨`;
      }
    }
    
    return {
      text: response,
      hasContext: searchResults.found,
      sourceCount: searchResults.count || 0,
      hotel_name: hotel_name,
      room_number: room_number
    };
    
  } catch (error) {
    console.error('❌ Response generation error:', error);
    return {
      text: `I'm having trouble accessing our hotel information right now. Please contact our ${hotel_name || 'hotel'} front desk for assistance. 📞`,
      hasContext: false,
      sourceCount: 0
    };
  }
} 