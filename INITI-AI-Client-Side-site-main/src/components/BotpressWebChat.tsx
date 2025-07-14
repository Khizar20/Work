'use client';

import { useEffect, useRef } from 'react';
import { SessionParams } from '@/utils/session';
import { HotelConfig } from '@/config/hotels';

interface BotpressWebChatProps {
  sessionParams: SessionParams;
  hotelConfig: HotelConfig;
  isVisible?: boolean;
}

export function BotpressWebChat({ sessionParams, hotelConfig, isVisible = false }: BotpressWebChatProps) {
  const scriptLoaded = useRef(false);
  const chatInitialized = useRef(false);

  useEffect(() => {
    // Don't load if session parameters are missing
    if (!sessionParams.hotel_id || !sessionParams.room_number) {
      console.warn('Botpress chat cannot load without hotel_id and room_number');
      return;
    }

    const initializeBotpress = () => {
      if (!window.botpressWebChat || chatInitialized.current) return;      try {
        const config = {
          botId: hotelConfig.botpress.botId,
          hostUrl: hotelConfig.botpress.hostUrl,
          messagingUrl: hotelConfig.botpress.messagingUrl,
          clientId: hotelConfig.botpress.clientId,
          botName: `${hotelConfig.name} Assistant`,
          botAvatar: hotelConfig.logoImage,
          theme: 'prism',
          themeColor: hotelConfig.theme.light.primary,
          hideWidget: !isVisible,
          disableAnimations: false,
          closeOnEscape: true,
          showConversationsButton: false,
          enableTranscriptDownload: false,
          className: 'botpress-chat',
          containerWidth: '100%',
          layoutWidth: '100%',
          // Pass session data as user attributes
          userData: {
            hotel_id: sessionParams.hotel_id,
            room_number: sessionParams.room_number,
            hotel_name: hotelConfig.name,
          },
          // Custom configuration for the session
          extraData: {
            hotel_id: sessionParams.hotel_id,
            room_number: sessionParams.room_number,
            hotel_name: hotelConfig.name,
          },
        };

        window.botpressWebChat.init(config);
        chatInitialized.current = true;
        
        console.log('Botpress WebChat initialized with session data:', {
          hotel_id: sessionParams.hotel_id,
          room_number: sessionParams.room_number,
        });
      } catch (error) {
        console.error('Failed to initialize Botpress WebChat:', error);
      }
    };

    // Load Botpress WebChat script
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v2.2/inject.js';
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        initializeBotpress();
      };
      document.body.appendChild(script);
    } else if (window.botpressWebChat && !chatInitialized.current) {
      initializeBotpress();
    }
  }, [sessionParams, hotelConfig, isVisible]);

  // Show placeholder or error message if session is invalid
  if (!sessionParams.hotel_id || !sessionParams.room_number) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Chat Unavailable
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm">
            Please scan the QR code in your hotel room to access the chat assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div id="botpress-webchat" className="w-full h-full min-h-[500px]" />
    </div>
  );
}
