/**
 * Enhanced Botpress Before Incoming Hook
 * Handles session data from multiple sources
 */

  // COMPREHENSIVE LOGGING FOR DEBUGGING
  console.log('🔍 DEBUGGING EVENT STRUCTURE:')
  console.log('Event type:', event.type)
  console.log('Event channel:', event.channel)
  console.log('Event payload type:', event.payload?.type)
  console.log('Event payload keys:', Object.keys(event.payload || {}))
  console.log('Full event keys:', Object.keys(event))
  
  // Method 1: Check event payload userData (from message)
  const userData = event.payload?.userData || {}
  
  // Method 2: Check if userData exists directly in event
  const eventUserData = event.userData || {}
  
  // Method 3: Check event payload messagePayload
  const messagePayload = event.payload?.messagePayload || {}
  
  // Method 4: Check nested payload userData
  const nestedUserData = event.payload?.payload?.userData || {}
  
  // Method 5: Check if this is a text message with userData
  const textMessage = event.payload?.type === 'text' && event.payload?.userData
  
  // Method 6: Check if this is a session_start event
  const sessionStartEvent = event.payload?.type === 'session_start'
  
  // Method 7: Check if this is a session_init message
  const sessionInitMessage = event.payload?.type === 'session_init'
  
  // Method 8: Check metadata for session data
  const metadataSessionData = event.payload?.metadata || {}
  
  // Method 9: Check if this is a SESSION_DATA message
  const isSessionDataMessage = event.payload?.type === 'text' && 
    event.payload?.text && 
    event.payload.text.indexOf('SESSION_DATA:') === 0
  
  // Method 10: Check if this is the first message from this user (conversation start)
  const isFirstMessage = !event.state.session.initialized
  
  // Try to extract session data from any available source
  let sessionData = null

  if (isSessionDataMessage && event.payload?.text) {
    // From Method 9: SESSION_DATA message
    const sessionText = event.payload.text.replace('SESSION_DATA: ', '')
    const parts = sessionText.split('|')
    if (parts.length >= 4) {
      sessionData = {
        hotel_name: parts[0] || null,
        room_number: parts[1] || null,
        hotel_id: parts[2] || null,
        session_id: parts[3] || null,
        source: 'qr_code'
      }
      console.log('📤 Session data from SESSION_DATA message:', sessionData)
      
      // Also check userData if available
      if (event.payload?.userData) {
        sessionData = Object.assign(sessionData, event.payload.userData)
      }
    }
  } else if (sessionStartEvent && event.payload?.userData) {
    // From Method 6: session_start event
    sessionData = event.payload.userData
    console.log('🚀 Session data from session_start event:', sessionData)
  } else if (sessionInitMessage && event.payload?.userData) {
    // From Method 7: session_init message
    sessionData = event.payload.userData
    console.log('📨 Session data from session_init message:', sessionData)
  } else if (metadataSessionData?.hotel_id) {
    // From Method 8: metadata
    sessionData = metadataSessionData
    console.log('🏷️ Session data from metadata:', sessionData)
  } else if (userData?.hotel_id) {
    // From Method 1: userData in payload
    sessionData = userData
    console.log('👤 Session data from payload userData:', sessionData)
  } else if (eventUserData?.hotel_id) {
    // From Method 2: Direct event userData
    sessionData = eventUserData
    console.log('🎯 Session data from event userData:', sessionData)
  } else if (messagePayload?.hotel_id) {
    // From Method 3: messagePayload
    sessionData = messagePayload
    console.log('📨 Session data from messagePayload:', sessionData)
  } else if (nestedUserData?.hotel_id) {
    // From Method 4: Nested userData
    sessionData = nestedUserData
    console.log('🔗 Session data from nested userData:', sessionData)
  } else if (textMessage) {
    // From Method 5: Text message userData
    sessionData = event.payload?.userData
    console.log('💬 Session data from text message:', sessionData)
  }

  // If no session data found, check if it's already stored in state
  if (!sessionData && event.state.session.initialized) {
    sessionData = {
      hotel_id: event.state.session.hotel_id,
      room_number: event.state.session.room_number,
      session_id: event.state.session.session_id,
      hotel_name: event.state.session.hotel_name,
      source: event.state.session.source
    }
    console.log('🔄 Using existing session data from state:', sessionData)
  }

  // Store session data in bot state if found
  if (sessionData && sessionData.hotel_id && sessionData.room_number && sessionData.session_id) {
    // Store in session state
    event.state.session.hotel_id = sessionData.hotel_id
    event.state.session.room_number = sessionData.room_number
    event.state.session.session_id = sessionData.session_id
    event.state.session.hotel_name = sessionData.hotel_name || 'Hotel'
    event.state.session.source = sessionData.source || 'qr_code'
    event.state.session.timestamp = sessionData.timestamp || new Date().toISOString()
    
    // Also store in user state (persistent across conversations)
    event.state.user.hotel_id = sessionData.hotel_id
    event.state.user.room_number = sessionData.room_number
    event.state.user.session_id = sessionData.session_id
    event.state.user.hotel_name = sessionData.hotel_name || 'Hotel'
    event.state.user.source = sessionData.source || 'qr_code'
    event.state.user.timestamp = sessionData.timestamp || new Date().toISOString()
    
    console.log('✅ Session data stored successfully:', {
      hotel_id: sessionData.hotel_id,
      room_number: sessionData.room_number,
      session_id: sessionData.session_id,
      hotel_name: sessionData.hotel_name
    })
    
    // Set a flag to indicate session data is available
    event.state.session.initialized = true
    
  } else {
    console.warn('⚠️ No session data found in any source')
    console.log('Event payload:', JSON.stringify(event.payload, null, 2))
    console.log('Event userData:', JSON.stringify(eventUserData, null, 2))
    console.log('Message payload:', JSON.stringify(messagePayload, null, 2))
    console.log('Nested userData:', JSON.stringify(nestedUserData, null, 2))
    
    // Set default values if no session data found
    event.state.session.hotel_name = 'Hotel'
    event.state.session.source = 'unknown'
    event.state.session.initialized = false
  }

  // Log final session state for debugging
  console.log('🎯 Final session state:', {
    hotel_id: event.state.session.hotel_id,
    room_number: event.state.session.room_number,
    session_id: event.state.session.session_id,
    hotel_name: event.state.session.hotel_name,
    source: event.state.session.source,
    initialized: event.state.session.initialized
  }) 