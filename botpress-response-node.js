/**
 * Botpress Response Node - Use Document Search Results
 * Place this AFTER the document search node
 */

console.log('📤 Preparing response...');

// Get the search result from the workflow
const searchResult = workflow.searchResult;

if (searchResult) {
  console.log('🔍 Search result found:', searchResult);
  
  if (searchResult.success && searchResult.found) {
    // Found relevant information
    console.log('✅ Found relevant information');
    
    // Use the generated response
    const responseText = searchResult.response;
    const hotelName = searchResult.hotel_name || 'Hotel';
    const roomNumber = user.room_number || workflow.room_number;
    
    // Add personalized greeting if we have room info
    let finalResponse = responseText;
    if (roomNumber && roomNumber !== 'your room') {
      finalResponse = `Hello from room ${roomNumber}! ${responseText}`;
    }
    
    // Set the response
    workflow.responseText = finalResponse;
    
    console.log('📝 Final response:', finalResponse);
    
  } else if (searchResult.success && !searchResult.found) {
    // No relevant information found
    console.log('⚠️ No relevant information found');
    
    const hotelName = searchResult.hotel_name || user.hotel_name || 'Hotel';
    const roomNumber = user.room_number || workflow.room_number;
    
    let fallbackResponse = searchResult.response;
    if (roomNumber && roomNumber !== 'your room') {
      fallbackResponse = `Hello from room ${roomNumber}! ${fallbackResponse}`;
    }
    
    workflow.responseText = fallbackResponse;
    
  } else {
    // Error occurred
    console.log('❌ Error occurred during search');
    
    const errorResponse = searchResult.response || "I'm having trouble accessing our hotel information right now. Please contact our front desk for immediate assistance.";
    workflow.responseText = errorResponse;
  }
  
} else {
  // No search result available
  console.log('⚠️ No search result available');
  
  const hotelName = user.hotel_name || workflow.hotel_name || 'Hotel';
  const roomNumber = user.room_number || workflow.room_number;
  
  let defaultResponse = `Hello! I'm your ${hotelName} AI concierge. How can I help you today?`;
  if (roomNumber && roomNumber !== 'your room') {
    defaultResponse = `Hello from room ${roomNumber}! I'm your ${hotelName} AI concierge. How can I help you today?`;
  }
  
  workflow.responseText = defaultResponse;
}

console.log('🎯 Response ready:', workflow.responseText); 