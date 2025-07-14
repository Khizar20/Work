'use client'

import { useEffect } from 'react'
import { HotelProvider } from '@/contexts/HotelContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SessionProvider } from '@/contexts/SessionContext'
import { getHotelConfigBySlug, getHotelChatConfig } from '@/config/multi-hotel-config'
import UniversalHotelChat from '@/components/UniversalHotelChat'

export default function VillaLaSalaPage() {
  const hotelConfig = getHotelConfigBySlug('villa-lasala')!
  const chatConfig = getHotelChatConfig(hotelConfig)

  useEffect(() => {
    // Set page title dynamically
    document.title = `${hotelConfig.name} - ${hotelConfig.tagline}`
  }, [])

  return (
    <ThemeProvider>
      <SessionProvider>
        <HotelProvider fallbackHotelSlug="villa-lasala">
          <div className="min-h-screen">
            {/* VillaLaSala Specific Hero */}
            <section 
              className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${hotelConfig.assets.heroImage})`
              }}
            >
              <div className="text-center text-white px-4 max-w-6xl mx-auto">
                <img 
                  src={hotelConfig.assets.logo} 
                  alt="VillaLaSala logo"
                  className="h-32 w-auto mx-auto mb-8"
                />
                
                <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight">
                  VillaLaSala
                </h1>
                
                <p className="text-3xl md:text-4xl mb-8 font-light">
                  Where Luxury Meets Paradise
                </p>
                
                <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-90 leading-relaxed">
                  Experience unparalleled luxury in our exclusive tropical paradise. 
                  Every moment at VillaLaSala is designed to exceed your expectations.
                </p>

                {/* QR Code Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m-2 0h-2m2-4h2m2-7h2v2h-2V9zm-2 0V7h-2V5h2v2h2v2h-2zm0 0h2v2h-2V9zm-2 2v2h-2v-2h2zm0 0V9h2v2h-2z" />
                    </svg>
                    <span className="font-semibold">Scan QR Code in Your Room</span>
                  </div>
                  <p className="text-sm opacity-90">
                    For personalized AI concierge service
                  </p>
                </div>

                <button 
                  onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 text-white px-10 py-5 text-xl font-bold rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
                >
                  Experience AI Concierge
                </button>
              </div>
            </section>

            {/* Luxury Features Grid */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">Luxury Redefined</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover world-class amenities and personalized service that sets VillaLaSala apart.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[
                    { icon: "🏊‍♂️", title: "Infinity Pool", desc: "Stunning ocean-view infinity pool with poolside service" },
                    { icon: "🍽️", title: "Fine Dining", desc: "Award-winning restaurants with world-renowned chefs" },
                    { icon: "🏖️", title: "Private Beach", desc: "Exclusive private beach access with premium amenities" },
                    { icon: "💆‍♀️", title: "Luxury Spa", desc: "Full-service spa with traditional and modern treatments" },
                    { icon: "🛎️", title: "AI Concierge", desc: "24/7 AI-powered concierge service in your room" },
                    { icon: "🚁", title: "Helicopter Tours", desc: "Private helicopter tours of the island paradise" }
                  ].map((feature, index) => (
                    <div key={index} className="text-center group">
                      <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Concierge Section */}
            <section id="chat-section" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">
                    Your Personal AI Concierge
                  </h2>
                  <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                    Experience the future of hospitality with our AI-powered concierge service. 
                    Get instant assistance, personalized recommendations, and seamless service requests.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      <h3 className="text-xl font-bold text-white">VillaLaSala AI Assistant</h3>
                      <span className="ml-auto text-blue-100 text-sm">Available 24/7</span>
                    </div>
                  </div>
                  
                  <div className="h-[500px]">                    <UniversalHotelChat
                      hotelId={chatConfig.hotelId}
                      hotelName={chatConfig.hotelName}
                      masterBotId={chatConfig.masterBotId}
                      botpressHost={chatConfig.botpressHost}
                      autoOpen={true}
                    />
                  </div>
                </div>

                {/* Chat Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Instant Responses</h4>
                    <p className="text-gray-600">Get immediate answers to all your questions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Local Expertise</h4>
                    <p className="text-gray-600">Discover the best local experiences and attractions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Hotel Services</h4>
                    <p className="text-gray-600">Request room service, housekeeping, and amenities</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-3xl font-bold mb-4">VillaLaSala</h3>
                    <p className="text-gray-300 mb-6 text-lg">
                      Where Luxury Meets Paradise. Experience the ultimate in tropical luxury 
                      with our AI-enhanced personalized service.
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Contact</h4>
                    <div className="space-y-2 text-gray-300">
                      <p>+1-555-VILLA-01</p>
                      <p>concierge@villa-lasala.com</p>
                      <p>123 Paradise Lane<br />Tropical Island, TI 12345</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Services</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>24/7 AI Concierge</li>
                      <li>Room Service</li>
                      <li>Spa & Wellness</li>
                      <li>Excursions</li>
                      <li>Fine Dining</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
                  <p>&copy; 2025 VillaLaSala. All rights reserved.</p>
                  <p className="mt-2">Powered by INITI AI technology for enhanced guest experience.</p>
                </div>
              </div>
            </footer>
          </div>
        </HotelProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
