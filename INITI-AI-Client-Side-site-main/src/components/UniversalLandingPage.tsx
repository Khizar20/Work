'use client'

import { useEffect } from 'react'
import { useHotel } from '../contexts/HotelContext'
import { getMasterBotConfig } from '../config/multi-hotel-config'
import UniversalHotelChat from '../components/UniversalHotelChat'

interface UniversalLandingPageProps {
  children?: React.ReactNode
  showChat?: boolean
  autoOpenChat?: boolean
}

export default function UniversalLandingPage({ 
  children, 
  showChat = true, 
  autoOpenChat = false 
}: UniversalLandingPageProps) {
  const { hotelConfig, isLoading, error } = useHotel()
  const masterBot = getMasterBotConfig()

  useEffect(() => {
    // Track page view for analytics
    if (hotelConfig) {
      console.log(`📊 Page view: ${hotelConfig.name} landing page`)
      
      // You can add analytics tracking here
      // Example: gtag('event', 'page_view', { hotel_id: hotelConfig.id })
    }
  }, [hotelConfig])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel...</p>
        </div>
      </div>
    )
  }

  if (error || !hotelConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'Unable to load hotel configuration'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-white"
      style={{
        backgroundColor: hotelConfig.theme.backgroundColor,
        color: hotelConfig.theme.textColor
      }}
    >
      {/* Hotel Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {hotelConfig.assets.logo && (
                <img 
                  src={hotelConfig.assets.logo} 
                  alt={`${hotelConfig.name} Logo`}
                  className="h-8 w-auto mr-3"
                />
              )}
              <div>
                <h1 className="text-xl font-bold" style={{ color: hotelConfig.theme.primaryColor }}>
                  {hotelConfig.name}
                </h1>
                <p className="text-sm text-gray-600">{hotelConfig.tagline}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{hotelConfig.contact.phone}</span>
              {showChat && (
                <button
                  onClick={() => {
                    const chatWidget = document.querySelector('#botpress-webchat')
                    if (chatWidget) {
                      window.botpressWebChat?.sendEvent({ type: 'show' })
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: hotelConfig.theme.primaryColor }}
                >
                  Chat with Us
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: hotelConfig.assets.heroImage 
            ? `url(${hotelConfig.assets.heroImage})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to {hotelConfig.name}
          </h2>
          <p className="text-xl md:text-2xl mb-8">
            {hotelConfig.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {hotelConfig.features.slice(0, 3).map((feature) => (
              <span 
                key={feature}
                className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Experience Our Amenities
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {hotelConfig.tagline}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelConfig.amenities.map((amenity) => (
              <div key={amenity} className="bg-white p-6 rounded-lg shadow-sm">
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                  style={{ backgroundColor: hotelConfig.theme.primaryColor }}
                >
                  <span className="text-white font-bold">✓</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{amenity}</h4>
                <p className="text-gray-600">Available for all guests</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h3>
            <p className="text-lg text-gray-600">We're here to make your stay exceptional</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
              <p className="text-gray-600">{hotelConfig.contact.phone}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">{hotelConfig.contact.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
              <p className="text-gray-600">{hotelConfig.contact.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Content */}
      {children}

      {/* Chat Integration - CONNECTS TO MASTER BOT */}
      {showChat && (        <UniversalHotelChat
          hotelId={hotelConfig.id}
          hotelName={hotelConfig.name}
          masterBotId={masterBot.botId}
          botpressHost={masterBot.hostUrl}
          autoOpen={autoOpenChat}
          className="fixed bottom-4 right-4 z-50"
        />
      )}

      {/* Styling for hotel theme */}
      <style jsx global>{`
        :root {
          --hotel-primary: ${hotelConfig.theme.primaryColor};
          --hotel-secondary: ${hotelConfig.theme.secondaryColor};
          --hotel-accent: ${hotelConfig.theme.accentColor};
        }
        
        .hotel-${hotelConfig.slug} .universal-hotel-chat .bp-widget-btn {
          background-color: var(--hotel-primary) !important;
        }
        
        .hotel-${hotelConfig.slug} .universal-hotel-chat .bp-widget-btn:hover {
          background-color: var(--hotel-secondary) !important;
        }
      `}</style>
    </div>
  )
}
