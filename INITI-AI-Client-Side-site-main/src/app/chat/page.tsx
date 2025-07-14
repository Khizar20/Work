'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MULTI_HOTEL_CONFIGS, MASTER_BOT_CONFIG } from '@/config/multi-hotel-config'

interface SessionData {
  hotel_id: string
  room_number: string
  session_id: string
  hotel_name?: string
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract session data from URL parameters
    const hotel_id = searchParams.get('hotel_id')
    const room_number = searchParams.get('room_number')
    const session_id = searchParams.get('session_id')

    if (!hotel_id || !room_number || !session_id) {
      setError('Missing required parameters: hotel_id, room_number, or session_id')
      return
    }

    // Find hotel configuration
    const hotelConfig = Object.values(MULTI_HOTEL_CONFIGS).find(
      config => config.id === hotel_id
    )

    const session: SessionData = {
      hotel_id,
      room_number,
      session_id,
      hotel_name: hotelConfig?.name || 'Hotel'
    }

    setSessionData(session)

    // Track session
    trackSession(session)
  }, [searchParams])

  const trackSession = async (session: SessionData) => {
    try {
      // Method 1: Store in our session API endpoint for Botpress to fetch
      const sessionResponse = await fetch('/api/session-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          hotel_id: session.hotel_id,
          room_number: session.room_number,
          hotel_name: session.hotel_name,
          timestamp: new Date().toISOString(),
          source: 'qr_code'
        })
      })

      const sessionResult = await sessionResponse.json()
      console.log('📊 Session data stored in API:', sessionResult)

      // Method 2: Original tracking API (keep for analytics)
      const response = await fetch('/api/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      })

      if (response.ok) {
        console.log('✅ Session tracked:', session)
      }
    } catch (error) {
      console.warn('Failed to track session:', error)
    }
  }

  useEffect(() => {
    if (!sessionData) return

    // Load Botpress scripts
    const loadBotpress = () => {
      // First script
      const script1 = document.createElement('script')
      script1.src = 'https://cdn.botpress.cloud/webchat/v3.0/inject.js'
      script1.defer = true
      
      // Second script
      const script2 = document.createElement('script')
      script2.src = 'https://files.bpcontent.cloud/2025/06/23/21/20250623213319-5UIKHOF7.js'
      script2.defer = true

      script1.onload = () => {
        script2.onload = () => {
          initializeBotpress()
        }
        document.head.appendChild(script2)
      }

      document.head.appendChild(script1)
    }

    const initializeBotpress = () => {
      // Wait for Botpress to be available
      const checkBotpress = () => {        if ((window as any).botpressWebChat) {
          try {
            // Initialize Botpress as normal widget in bottom-right
            (window as any).botpressWebChat.init({
              botId: MASTER_BOT_CONFIG.botId,
              hostUrl: MASTER_BOT_CONFIG.hostUrl,
              messagingUrl: `${MASTER_BOT_CONFIG.hostUrl}/api/v1/bots/${MASTER_BOT_CONFIG.botId}?hotel_id=${encodeURIComponent(sessionData.hotel_id)}&room_number=${encodeURIComponent(sessionData.room_number)}&session_id=${encodeURIComponent(sessionData.session_id)}&hotel_name=${encodeURIComponent(sessionData.hotel_name || 'Hotel')}&source=qr_code`,
              
              // Bot customization
              botName: `${sessionData.hotel_name} Assistant`,
              theme: 'prism',
              themeColor: '#2563eb',
              
              // Show widget in bottom-right corner
              hideWidget: false,
              showPoweredBy: false,
              disableAnimations: false,
              closeOnEscape: true,
              showConversationsButton: false,
              enableTranscriptDownload: false,
              
              // CRITICAL: Pass session data directly in init
              userData: {
                hotel_id: sessionData.hotel_id,
                room_number: sessionData.room_number,
                session_id: sessionData.session_id,
                hotel_name: sessionData.hotel_name,
                timestamp: new Date().toISOString(),
                source: 'qr_code',
                room_type: 'standard',
                guest_language: 'en'
              },
              
              // Add session data to every message payload
              messagePayload: {
                hotel_id: sessionData.hotel_id,
                room_number: sessionData.room_number,
                session_id: sessionData.session_id,
                hotel_name: sessionData.hotel_name,
                source: 'qr_code'
              }
            })

            console.log('🤖 Botpress widget initialized with session:', sessionData)

            // Store session data in localStorage for persistent access
            localStorage.setItem('botpress_session_data', JSON.stringify(sessionData))

            // Store session data using current timestamp as a predictable key
            const timestampKey = `session_${Date.now()}`
            const storeWithTimestamp = async () => {
              try {
                const response = await fetch('/api/session-data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    session_id: timestampKey,
                    user_id: timestampKey,
                    hotel_id: sessionData.hotel_id,
                    room_number: sessionData.room_number,
                    hotel_name: sessionData.hotel_name,
                    original_session_id: sessionData.session_id,
                    timestamp: new Date().toISOString(),
                    source: 'qr_code_timestamp'
                  })
                })
                const result = await response.json()
                console.log('⏰ Session stored with timestamp key:', timestampKey, result)
                
                // Store the timestamp key in localStorage for Botpress to find
                localStorage.setItem('botpress_session_key', timestampKey)
              } catch (error) {
                console.warn('Failed to store session with timestamp:', error)
              }
            }

            storeWithTimestamp()

            // Method 1: Direct API call to set user data
            const setUserDataViaAPI = async () => {
              try {
                const response = await fetch(`${MASTER_BOT_CONFIG.hostUrl}/api/v1/bots/${MASTER_BOT_CONFIG.botId}/users/user-${Date.now()}/state`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    state: {
                      user: {
                        hotel_id: sessionData.hotel_id,
                        room_number: sessionData.room_number,
                        session_id: sessionData.session_id,
                        hotel_name: sessionData.hotel_name,
                        source: 'qr_code',
                        initialized: true
                      }
                    }
                  })
                })
                console.log('🌐 API call to set user data:', response.status)
              } catch (error) {
                console.warn('Failed to set user data via API:', error)
              }
            }

            // Method 2: Send initial message with session data
            const sendInitialSessionMessage = () => {
              if ((window as any).botpressWebChat?.sendMessage) {
                // Send a hidden system message with session data
                (window as any).botpressWebChat.sendMessage({
                  type: 'session_init',
                  text: `SYSTEM: Initialize session for ${sessionData.hotel_name}, Room ${sessionData.room_number}`,
                  userData: {
                    hotel_id: sessionData.hotel_id,
                    room_number: sessionData.room_number,
                    session_id: sessionData.session_id,
                    hotel_name: sessionData.hotel_name,
                    source: 'qr_code',
                    initialized: true
                  },
                  metadata: {
                    isSystem: true,
                    hotel_id: sessionData.hotel_id,
                    room_number: sessionData.room_number,
                    session_id: sessionData.session_id,
                    hotel_name: sessionData.hotel_name
                  }
                })
                console.log('📨 Sent initial session message')
              }
            }

            // Method 3: Store session data with Botpress user mapping
            const storeSessionWithMapping = async () => {
              // Listen for when we get the Botpress user ID
              if ((window as any).botpressWebChat.onEvent) {
                (window as any).botpressWebChat.onEvent(({ type, payload }: any) => {
                  if (type === 'session' && payload?.userId) {
                    // We now have the Botpress user ID, store the mapping
                    fetch('/api/session-data', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        session_id: payload.userId, // Use Botpress userId as session_id
                        user_id: payload.userId,
                        hotel_id: sessionData.hotel_id,
                        room_number: sessionData.room_number,
                        hotel_name: sessionData.hotel_name,
                        original_session_id: sessionData.session_id,
                        timestamp: new Date().toISOString(),
                        source: 'qr_code'
                      })
                    }).then(response => response.json())
                      .then(result => {
                        console.log('🗺️ Session mapping stored:', result)
                      })
                      .catch(error => {
                        console.warn('Failed to store session mapping:', error)
                      })
                  }
                })
              }
            }

            // Wait for widget to be ready, then configure message interceptor
            setTimeout(() => {
              // Intercept outgoing messages to add session data
              const originalSend = (window as any).botpressWebChat.sendMessage
              if (originalSend) {
                (window as any).botpressWebChat.sendMessage = function(message: any) {
                  // Add session data to every message
                  const enrichedMessage = {
                    ...message,
                    userData: {
                      hotel_id: sessionData.hotel_id,
                      room_number: sessionData.room_number,
                      session_id: sessionData.session_id,
                      hotel_name: sessionData.hotel_name,
                      timestamp: new Date().toISOString(),
                      source: 'qr_code'
                    }
                  }
                  console.log('📤 Sending message with session data:', enrichedMessage)
                  return originalSend.call(this, enrichedMessage)
                }
              }
              
              // Alternative: Use mergeConfig to add persistent user data
              if ((window as any).botpressWebChat.mergeConfig) {
                (window as any).botpressWebChat.mergeConfig({
                  userData: {
                    hotel_id: sessionData.hotel_id,
                    room_number: sessionData.room_number,
                    session_id: sessionData.session_id,
                    hotel_name: sessionData.hotel_name,
                    timestamp: new Date().toISOString(),
                    source: 'qr_code'
                  }
                })
                console.log('✅ Merged session data into Botpress config')
              }
              
              // Send an initial silent message with session data to establish context
              if ((window as any).botpressWebChat.sendEvent) {
                (window as any).botpressWebChat.sendEvent({
                  type: 'session_start',
                  userData: {
                    hotel_id: sessionData.hotel_id,
                    room_number: sessionData.room_number,
                    session_id: sessionData.session_id,
                    hotel_name: sessionData.hotel_name,
                    timestamp: new Date().toISOString(),
                    source: 'qr_code'
                  }
                })
                console.log('🚀 Sent initial session data event')
              }

              // Method 3: Try to set conversation tags
              if ((window as any).botpressWebChat?.setConversationTags) {
                (window as any).botpressWebChat.setConversationTags({
                  hotel_id: sessionData.hotel_id,
                  room_number: sessionData.room_number,
                  session_id: sessionData.session_id,
                  hotel_name: sessionData.hotel_name,
                  source: 'qr_code'
                })
                console.log('🏷️ Set conversation tags')
              }

              // Method 4: Execute all alternative methods
              setUserDataViaAPI()
              sendInitialSessionMessage()
              storeSessionWithMapping()
            }, 3000)

            // Listen for chat events
            if ((window as any).botpressWebChat.onEvent) {
              (window as any).botpressWebChat.onEvent(({ type, payload }: any) => {
                console.log('💬 Chat event:', type, payload)
                
                // Send session data when chat opens
                if (type === 'webchat:opened') {
                  console.log('🔓 Chat opened, sending session data...')
                  
                  // Method 5: Send session data when chat opens
                  setTimeout(() => {
                    if ((window as any).botpressWebChat?.sendMessage) {
                      (window as any).botpressWebChat.sendMessage({
                        type: 'text',
                        text: `SESSION_DATA: ${sessionData.hotel_name}|${sessionData.room_number}|${sessionData.hotel_id}|${sessionData.session_id}`,
                        userData: {
                          hotel_id: sessionData.hotel_id,
                          room_number: sessionData.room_number,
                          session_id: sessionData.session_id,
                          hotel_name: sessionData.hotel_name,
                          source: 'qr_code',
                          initialized: true
                        }
                      })
                      console.log('📤 Sent session data message when chat opened')
                    }
                  }, 500)
                }
                
                // Track chat events
                fetch('/api/track-chat-event', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    hotel_id: sessionData.hotel_id,
                    session_id: sessionData.session_id,
                    room_number: sessionData.room_number,
                    event_type: type,
                    message: payload?.text || '',
                    timestamp: new Date().toISOString()
                  })
                }).catch(err => console.warn('Failed to track chat event:', err))
              })
            }

          } catch (error) {
            console.error('❌ Failed to initialize Botpress:', error)
            setError('Failed to initialize chat bot')
          }
        } else {
          setTimeout(checkBotpress, 100)
        }
      }
      
      // Start checking immediately
      checkBotpress()
    }

    loadBotpress()
  }, [sessionData])

  // Inject CSS for Botpress embedding
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Ensure Botpress widget appears properly in bottom-right */
      .bp-widget-web {
        z-index: 1000;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat Unavailable</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Please scan a valid QR code from your hotel room.</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {sessionData.hotel_name} Assistant
              </h1>
              <p className="text-sm text-gray-600">
                Room {sessionData.room_number} • Session: {sessionData.session_id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ready to assist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to {sessionData.hotel_name}!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your AI assistant is ready to help with all your needs during your stay.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-3xl mb-2">🛎️</div>
              <h3 className="font-semibold text-gray-800">Room Service</h3>
              <p className="text-sm text-gray-600">Order food & drinks</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-3xl mb-2">🧹</div>
              <h3 className="font-semibold text-gray-800">Housekeeping</h3>
              <p className="text-sm text-gray-600">Request cleaning</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-3xl mb-2">ℹ️</div>
              <h3 className="font-semibold text-gray-800">Hotel Info</h3>
              <p className="text-sm text-gray-600">Amenities & services</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-semibold text-gray-800">Concierge</h3>
              <p className="text-sm text-gray-600">Local recommendations</p>
            </div>
          </div>

          {/* Chat Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Start Chatting Now!</h3>
            </div>
            <p className="text-blue-800 mb-4">
              💬 <strong>Click the chat widget in the bottom-right corner</strong> to start your conversation with our AI assistant.
            </p>
            <div className="flex items-center text-sm text-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Available 24/7 • Instant responses • Personalized for Room {sessionData.room_number}
            </div>
          </div>

          {/* Room Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stay Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium text-gray-600">Room:</span>
                <div className="text-lg font-bold text-gray-900">{sessionData.room_number}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium text-gray-600">Hotel:</span>
                <div className="text-lg font-bold text-gray-900">{sessionData.hotel_name}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium text-gray-600">Session:</span>
                <div className="text-lg font-bold text-gray-900">{sessionData.session_id.slice(0, 8)}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-4xl mx-auto p-4">
          <details className="bg-gray-100 rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
