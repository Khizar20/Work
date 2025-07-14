// BOTPRESS ACTION: Generate Hotel Response
// Copy this code into your Botpress "Generate Hotel Information Responses" action node

// Get workflow variables
const hotel_name = workflow.hotel_name || "Hotel Grand NewWest";
const room_number = workflow.room_number || "";
const user_query = workflow.user_query || "";
const search_context = workflow.search_context || "";
const documents_found = workflow.documents_found || false;

try {
  console.log('🤖 Generating response for query:', user_query);
  console.log('📄 Documents found:', documents_found);
  console.log('🏨 Hotel:', hotel_name);
  console.log('🚪 Room:', room_number);
  
  let response_text;
  
  if (documents_found && search_context && search_context !== 'No relevant hotel documents found for this query.') {
    // Generate response with found documents
    response_text = `Hello! I found some helpful information about "${user_query}" from our ${hotel_name} documents:

${search_context}

${room_number ? `For your room ${room_number}, ` : ''}Is there anything else you'd like to know? I'm here to help! 🏨`;
    
    console.log('✅ Generated document-based response');
    
  } else {
    // Fallback response when no documents found
    response_text = `Hello! I don't have specific information about "${user_query}" in our ${hotel_name} documents right now. 

Please contact our front desk at reception for immediate assistance. ${room_number ? `They can help you specifically with room ${room_number}. ` : ''}

Is there anything else I can help you with today? 🏨`;
    
    console.log('⚠️ Generated fallback response (no documents)');
  }
  
  // Store the final response
  workflow.hotelResponse = response_text;
  console.log('✅ Response generated, length:', response_text.length);
  
} catch (error) {
  console.error('❌ Response generation error:', error.message);
  
  // Error fallback response
  workflow.hotelResponse = `I'm sorry, I'm having trouble processing your request right now. Please contact our front desk for immediate assistance. ${workflow.room_number ? `They can help you with room ${workflow.room_number}. ` : ''}How else can I help you today? 🏨`;
} 