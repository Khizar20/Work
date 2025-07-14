// ============================================
// BOTPRESS ACTION 1: searchHotelDocuments
// ============================================
// Copy this code into Botpress Cloud → Studio → Actions → Create New Action "searchHotelDocuments"

async function searchHotelDocuments(params) {
  const { query, hotel_id, limit = 3 } = params;
  
  try {
    // IMPORTANT: Replace with your actual admin dashboard domain
    const API_BASE_URL = 'https://your-admin-dashboard-domain.com'; 
    // For development: const API_BASE_URL = 'http://localhost:3000';
    
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
        context: ''
      };
    }
    
    const data = await response.json();
    
    if (data.success && data.results && data.results.length > 0) {
      // Create context string for AI response
      const context = data.results
        .map(doc => `**${doc.title}**: ${doc.content_excerpt}`)
        .join('\n\n');
      
      console.log('✅ Found', data.results.length, 'relevant documents');
      
      return {
        found: true,
        count: data.results.length,
        results: data.results,
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
// BOTPRESS ACTION 2: generateHotelResponse
// ============================================
// Copy this code into Botpress Cloud → Studio → Actions → Create New Action "generateHotelResponse"

async function generateHotelResponse(params) {
  const { query, searchResults, hotel_name, room_number } = params;
  
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
      text: `I'm having trouble accessing our hotel information right now. Please contact our ${hotel_name} front desk for assistance. 📞`,
      hasContext: false,
      sourceCount: 0
    };
  }
}

// ============================================
// BOTPRESS FLOW CONFIGURATION
// ============================================
// Use this structure in Botpress Cloud → Studio → Flows

/*
FLOW NAME: "Hotel Document Search Flow"

NODE 1: Start (Entry Point)
- Trigger: On message received
- Condition: {{event.preview.length > 2}}

NODE 2: Extract Context (Code Node)
Add this code:
```
workflow.hotel_id = event.state.user.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
workflow.hotel_name = event.state.user.hotel_name || "Hotel Grand NewWest";
workflow.room_number = event.state.user.room_number || "";
workflow.user_query = event.preview;

console.log('🏨 Processing query for hotel:', workflow.hotel_id, 'room:', workflow.room_number);
```

NODE 3: Search Documents (Action Node)
- Action: searchHotelDocuments
- Input:
  - query: {{workflow.user_query}}
  - hotel_id: {{workflow.hotel_id}}
  - limit: 3
- Output Variable: documentSearch

NODE 4: Generate Response (Action Node)  
- Action: generateHotelResponse
- Input:
  - query: {{workflow.user_query}}
  - searchResults: {{documentSearch}}
  - hotel_name: {{workflow.hotel_name}}
  - room_number: {{workflow.room_number}}
- Output Variable: aiResponse

NODE 5: Send Response (Say Node)
- Text: {{aiResponse.text}}
- Quick Replies (optional):
  - "Tell me more"
  - "Contact front desk"
  - "Other questions"

NODE 6: End or Continue
- Connect back to start for continuous conversation
*/

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*
1. BOTPRESS CLOUD SETUP:
   - Go to https://siderite.botpress.app/
   - Create/open your bot
   - Go to Studio → Actions
   - Create two actions with the code above

2. ENVIRONMENT SETUP:
   - Replace API_BASE_URL with your actual admin dashboard domain
   - Make sure your dashboard is publicly accessible
   - Test the /api/search-documents endpoint is working

3. USER VARIABLES (Botpress Cloud → Settings → User Variables):
   - hotel_id (String)
   - hotel_name (String) 
   - room_number (String)
   - session_id (String)

4. TEST QUESTIONS:
   - "What amenities does the hotel have?"
   - "Tell me about room service"
   - "What are the hotel policies?"
   - "Emergency contact information"

5. PRODUCTION CHECKLIST:
   - ✅ Update API_BASE_URL to production domain
   - ✅ Test with real QR codes
   - ✅ Verify hotel_id is passed correctly
   - ✅ Monitor Botpress logs for errors
   - ✅ Test fallback responses
*/

// ============================================
// TESTING
// ============================================

/*
Test your setup with these URLs:
Development: http://localhost:3000/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=test
Production: https://your-domain.com/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=test

Expected behavior:
1. ✅ Page loads with hotel context
2. ✅ Bot initializes with session data
3. ✅ Guest asks questions about hotel
4. ✅ Bot searches document embeddings
5. ✅ Bot provides contextual answers
6. ✅ Fallback works when no documents found
*/ 