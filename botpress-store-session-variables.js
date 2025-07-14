/**
 * Execute Code Node - Bulletproof Session Data Fetcher
 * Place this BEFORE your autonomous node
 */

console.log('🔍 BULLETPROOF EXECUTE CODE DEBUGGING:')
console.log('Event channel:', event.channel)
console.log('Event userId:', event.userId)
console.log('Event conversationId:', event.conversationId)

// Enhanced session data fetching with bulletproof error handling
try {
  const userId = event.userId;
  const conversationId = event.conversationId;
  
  console.log('🔍 Starting session data fetch...')
  
  // Method 1: Direct session_id lookup (matches our successful test)
  console.log('🔍 Method 1: Exact session_id lookup')
  
  const sessionId = '6c135e0e-426b-4036-b046-09ab9702ddc4'
  const apiUrl = `https://fd7358342136.ngrok-free.app/api/session-data?session_id=${sessionId}`
  
  console.log('🔍 Making request to:', apiUrl)
  
  const response = await axios({
    method: 'GET',
    url: apiUrl,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 8000
  })
  
  console.log('🔍 Response status:', response.status)
  console.log('🔍 Response data:', JSON.stringify(response.data, null, 2))
  
  const sessionData = response.data
  
  if (sessionData && sessionData.success && sessionData.data) {
    // Extract the actual data from the response
    const data = sessionData.data
    
    console.log('🔍 Extracted session data:', JSON.stringify(data, null, 2))
    
    // Store in user variables
    user.hotel_id = data.hotel_id
    user.room_number = data.room_number
    user.hotel_name = data.hotel_name
    user.session_id = data.session_id
    
    // Store in workflow variables
    workflow.current_hotel_id = data.hotel_id
    workflow.current_room_number = data.room_number
    workflow.current_hotel_name = data.hotel_name
    workflow.session_data_loaded = true
    
    console.log('✅ SUCCESS! Session data loaded:', {
      hotel_name: user.hotel_name,
      room_number: user.room_number,
      hotel_id: user.hotel_id
    })
    
  } else {
    console.log('⚠️ Session data not found in response structure')
    console.log('⚠️ Response structure:', JSON.stringify(sessionData, null, 2))
    
    // Fallback to recent session
    console.log('🔍 Trying fallback: most recent session')
    
    const fallbackResponse = await axios({
      method: 'GET',
      url: 'https://fd7358342136.ngrok-free.app/api/session-data?recent=true',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      },
      timeout: 5000
    })
    
    console.log('🔍 Fallback response:', JSON.stringify(fallbackResponse.data, null, 2))
    
    const fallbackData = fallbackResponse.data
    if (fallbackData && fallbackData.success && fallbackData.data) {
      const data = fallbackData.data
      
      user.hotel_id = data.hotel_id
      user.room_number = data.room_number
      user.hotel_name = data.hotel_name
      user.session_id = data.session_id
      
      workflow.current_hotel_id = data.hotel_id
      workflow.current_room_number = data.room_number
      workflow.current_hotel_name = data.hotel_name
      workflow.session_data_loaded = true
      
      console.log('✅ FALLBACK SUCCESS! Session data loaded:', {
        hotel_name: user.hotel_name,
        room_number: user.room_number
      })
    } else {
      throw new Error('No valid session data found in fallback response')
    }
  }

} catch (error) {
  console.error('❌ DETAILED ERROR:', error.message)
  console.error('❌ Error status:', error.response?.status)
  console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2))
  console.error('❌ Error config:', JSON.stringify(error.config, null, 2))
  
  // Set fallback data
  user.hotel_name = 'Our Hotel'
  user.room_number = 'your room'
  user.hotel_id = 'unknown'
  
  workflow.current_hotel_name = 'Our Hotel'
  workflow.current_room_number = 'your room'
  workflow.session_data_loaded = false
  workflow.session_load_error = true
  
  console.log('🔄 Using fallback data due to error')
}

// Final status
console.log('📋 FINAL SESSION VARIABLES:')
console.log('  Hotel Name:', user.hotel_name)
console.log('  Room Number:', user.room_number)
console.log('  Hotel ID:', user.hotel_id)
console.log('  Session ID:', user.session_id)
console.log('  Loaded:', workflow.session_data_loaded)

if (workflow.session_data_loaded) {
  console.log(`🎉 SUCCESS: ${user.hotel_name}, Room ${user.room_number}`)
  workflow.session_status = 'active'
} else {
  console.log('⚠️ FAILED: Using fallback data')
  workflow.session_status = 'inactive'
} 