'use client'

import { useEffect, useRef, useState } from 'react'

interface UniversalHotelChatProps {
  hotelId: string
  hotelName: string
  masterBotId: string
  botpressHost?: string
  className?: string
  autoOpen?: boolean
}

interface SessionParams {
  hotel_id?: string
  room_number?: string
  session_id?: string
  guest_name?: string
  reservation_id?: string
}

export default function UniversalHotelChat({
  hotelId,
  hotelName,
  masterBotId,
  botpressHost = 'https://cdn.botpress.cloud',
  className = '',
  autoOpen = false
}: UniversalHotelChatProps) {
  const [mounted, setMounted] = useState(false)
  const [chatInitialized, setChatInitialized] = useState(false)
  const [sessionTracked, setSessionTracked] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getSessionParams = (): SessionParams => {
      if (typeof window === 'undefined') return {}
      
      const urlParams = new URLSearchParams(window.location.search)
      return {
        hotel_id: urlParams.get('hotel_id') || hotelId,
        room_number: urlParams.get('room_number') || undefined,
        session_id: urlParams.get('session_id') || undefined,
        guest_name: urlParams.get('guest_name') || undefined,        reservation_id: urlParams.get('reservation_id') || undefined,
      }
    }

    const trackSession = async (sessionParams: SessionParams) => {
      if (sessionTracked || !sessionParams.hotel_id || !sessionParams.room_number) return
      
      try {
        const response = await fetch('/api/track-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hotel_id: sessionParams.hotel_id,
            room_number: sessionParams.room_number,
            session_id: sessionParams.session_id,
            guest_name: sessionParams.guest_name,
            reservation_id: sessionParams.reservation_id,
            source: sessionParams.session_id ? 'qr_code' : 'direct'
          })
        });

        if (response.ok) {
          console.log('📊 Session tracking successful')
          setSessionTracked(true)
        } else {
          console.warn('⚠️ Session tracking failed:', await response.text())
        }
      } catch (error) {
        console.warn('⚠️ Session tracking failed:', error)
      }
    }

    const initializeBotpress = () => {
      if (!(window as any).botpressWebChat || chatInitialized) return

      const sessionParams = getSessionParams()
      
      // Create unique user ID for this session
      const userId = sessionParams.session_id || 
                    `${hotelId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {        (window as any).botpressWebChat.init({
          // Bot configuration - SAME FOR ALL HOTELS
          botId: masterBotId,
          hostUrl: botpressHost,
          messagingUrl: `${botpressHost}/api/v1/bots/${masterBotId}`,
          
          // UI customization per hotel
          botName: `${hotelName} Assistant`,
          
          // Theming
          theme: 'prism',
          themeColor: '#2563eb',
          hideWidget: !autoOpen,
          disableAnimations: false,
          closeOnEscape: true,
          showConversationsButton: false,
          enableTranscriptDownload: false,
          
          // Layout
          className: `universal-hotel-chat ${hotelId.replace(/[^a-zA-Z0-9]/g, '-')} ${className}`,
          containerWidth: '100%',
          layoutWidth: '100%',
          
          // CRITICAL: Pass session data to bot via userData
          userData: {
            hotel_id: sessionParams.hotel_id || hotelId,
            room_number: sessionParams.room_number || '',
            session_id: sessionParams.session_id || userId,
            hotel_name: hotelName,
            guest_name: sessionParams.guest_name || '',
            reservation_id: sessionParams.reservation_id || '',
            timestamp: new Date().toISOString(),
            source: sessionParams.session_id ? 'qr_code' : 'direct'
          }
        })

        setChatInitialized(true)
        
        // Track session after successful initialization
        trackSession(sessionParams)
        
        console.log('🤖 Botpress Universal Chat initialized:', {
          hotel: hotelName,
          hotel_id: sessionParams.hotel_id || hotelId,
          room_number: sessionParams.room_number,
          session_id: sessionParams.session_id || userId,
          bot_id: masterBotId
        })        // Listen for chat events if available
        if ((window as any).botpressWebChat.onEvent) {
          (window as any).botpressWebChat.onEvent(({ type, payload }: any) => {
            console.log('💬 Chat event:', type, payload)
            
            // Track chat events
            fetch('/api/track-chat-event', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                hotel_id: sessionParams.hotel_id || hotelId,
                session_id: sessionParams.session_id || userId,
                room_number: sessionParams.room_number,
                event_type: type,
                message: payload?.text || '',
                timestamp: new Date().toISOString()
              })
            }).catch(err => console.warn('Failed to track chat event:', err))
          })
        }

      } catch (error) {
        console.error('❌ Failed to initialize Botpress:', error)
      }
    }

    // Load Botpress script
    if (!scriptLoaded.current) {
      const script = document.createElement('script')
      script.src = 'https://cdn.botpress.cloud/webchat/v2.2/inject.js'
      script.async = true
      script.onload = () => {
        scriptLoaded.current = true
        initializeBotpress()
      }
      script.onerror = () => {
        console.error('❌ Failed to load Botpress script')
      }
      document.body.appendChild(script)
    } else if ((window as any).botpressWebChat && !chatInitialized) {
      initializeBotpress()
    }

  }, [mounted, hotelId, hotelName, masterBotId, botpressHost, autoOpen, chatInitialized])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div 
      className={`universal-hotel-chat-container ${className}`}
      data-hotel-id={hotelId}
      data-hotel-name={hotelName}
      data-bot-id={masterBotId}
    >
      <div id="botpress-webchat" className="w-full h-full min-h-[400px]" />
      {!chatInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading {hotelName} Assistant...</p>
          </div>
        </div>
      )}
    </div>
  )
}
