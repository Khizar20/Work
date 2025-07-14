'use client'

import { useParams } from 'next/navigation'
import { getHotelConfigBySlug, getMasterBotConfig, getHotelChatConfig } from '@/config/multi-hotel-config'
import { HotelProvider } from '@/contexts/HotelContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SessionProvider } from '@/contexts/SessionContext'
import UniversalHotelChat from '@/components/UniversalHotelChat'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function HotelLandingPage() {
  const params = useParams()
  const hotelSlug = params.hotelSlug as string
  const [mounted, setMounted] = useState(false)
  
  const hotelConfig = getHotelConfigBySlug(hotelSlug)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hotelConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
          <p className="text-gray-600 mb-4">
            The hotel "{hotelSlug}" could not be found.
          </p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  const chatConfig = getHotelChatConfig(hotelConfig)

  return (
    <>
      <Head>
        <title>{hotelConfig.name} - {hotelConfig.tagline}</title>
        <meta name="description" content={hotelConfig.description} />
        <link rel="icon" href={hotelConfig.assets.favicon} />
      </Head>

      <ThemeProvider>
        <SessionProvider>
          <HotelProvider fallbackHotelSlug={hotelSlug}>
            <div 
              className="min-h-screen"
              style={{
                '--hotel-primary': hotelConfig.theme.primaryColor,
                '--hotel-secondary': hotelConfig.theme.secondaryColor,
                '--hotel-accent': hotelConfig.theme.accentColor,
                '--hotel-bg': hotelConfig.theme.backgroundColor,
                '--hotel-text': hotelConfig.theme.textColor,
              } as React.CSSProperties}
            >
              {/* Hero Section */}
              <section 
                className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${hotelConfig.assets.heroImage})`
                }}
              >
                <div className="text-center text-white px-4 max-w-4xl mx-auto">
                  {/* Logo */}
                  <div className="mb-8">
                    <img 
                      src={hotelConfig.assets.logo} 
                      alt={`${hotelConfig.name} logo`}
                      className="h-24 w-auto mx-auto"
                    />
                  </div>

                  {/* Hotel Name & Tagline */}
                  <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                    {hotelConfig.name}
                  </h1>
                  <p className="text-2xl md:text-3xl mb-8 font-light">
                    {hotelConfig.tagline}
                  </p>
                  <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
                    {hotelConfig.description}
                  </p>

                  {/* Contact Info */}
                  <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-12">
                    <a 
                      href={`tel:${hotelConfig.contact.phone}`}
                      className="flex items-center space-x-2 text-lg hover:text-yellow-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{hotelConfig.contact.phone}</span>
                    </a>
                    <a 
                      href={`mailto:${hotelConfig.contact.email}`}
                      className="flex items-center space-x-2 text-lg hover:text-yellow-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{hotelConfig.contact.email}</span>
                    </a>
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-gray-900 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start AI Concierge Chat
                  </button>
                </div>
              </section>

              {/* Features Section */}
              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Hotel Features</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Discover the exceptional amenities and services that make {hotelConfig.name} special.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotelConfig.features.map((feature, index) => (
                      <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                        <div 
                          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                          style={{ backgroundColor: hotelConfig.theme.primaryColor }}
                        >
                          {feature.charAt(0)}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Chat Section */}
              <section id="chat-section" className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      AI Concierge Service
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Get instant assistance with room service, local recommendations, and any questions about your stay.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="h-96">                      <UniversalHotelChat
                        hotelId={chatConfig.hotelId}
                        hotelName={chatConfig.hotelName}
                        masterBotId={chatConfig.masterBotId}
                        botpressHost={chatConfig.botpressHost}
                        autoOpen={true}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer 
                className="py-12 text-white"
                style={{ backgroundColor: hotelConfig.theme.primaryColor }}
              >
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{hotelConfig.name}</h3>
                      <p className="opacity-90 mb-4">{hotelConfig.tagline}</p>
                      <p className="text-sm opacity-75">
                        Experience luxury redefined with our AI-powered concierge service.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Contact</h4>
                      <div className="space-y-2 text-sm opacity-90">
                        <p>{hotelConfig.contact.phone}</p>
                        <p>{hotelConfig.contact.email}</p>
                        <p>{hotelConfig.contact.address}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Amenities</h4>
                      <div className="grid grid-cols-2 gap-1 text-sm opacity-90">
                        {hotelConfig.amenities.map((amenity, index) => (
                          <span key={index}>• {amenity}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-75">
                    <p>&copy; 2025 {hotelConfig.name}. All rights reserved.</p>
                    <p className="mt-2">Powered by AI technology for enhanced guest experience.</p>
                  </div>
                </div>
              </footer>
            </div>
          </HotelProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  )
}
