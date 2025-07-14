'use client';

import { useState } from 'react';
import { BotpressWebChat } from './BotpressWebChat';
import { HotelConfig } from '@/config/hotels';
import { useSession } from '@/contexts/SessionContext';

interface ChatSectionProps {
  hotelConfig: HotelConfig;
}

export function ChatSection({ hotelConfig }: ChatSectionProps) {
  const { sessionParams, isValidSession } = useSession();
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleStartChat = () => {
    setIsChatVisible(true);
  };

  return (
    <section id="chat" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Concierge Service
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get instant assistance with room service, local recommendations, hotel amenities, 
            and anything else you need during your stay.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!isChatVisible ? (
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-12 mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {isValidSession ? 'Ready to Chat!' : 'Chat Access Required'}
                </h3>

                {isValidSession ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Welcome to Room {sessionParams.room_number}! Our AI concierge is ready to assist you 
                      with any questions or requests you may have.
                    </p>
                    <button
                      onClick={handleStartChat}
                      className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Start Conversation
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      To access our AI concierge service, please scan the QR code located in your hotel room. 
                      This ensures personalized assistance based on your location and preferences.
                    </p>
                    <div className="inline-flex items-center px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      QR Code Required
                    </div>
                  </>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Instant Responses
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Get immediate answers to your questions, 24/7
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Local Expertise
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Discover the best restaurants, attractions, and activities nearby
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Hotel Services
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Request room service, housekeeping, and other hotel amenities
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {hotelConfig.name} Concierge
                    </h3>
                    {isValidSession && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        Room {sessionParams.room_number}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsChatVisible(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="h-96">
                <BotpressWebChat 
                  sessionParams={sessionParams} 
                  hotelConfig={hotelConfig}
                  isVisible={isChatVisible}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
