'use client'

import { useEffect } from 'react'
import { HotelProvider } from '@/contexts/HotelContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SessionProvider } from '@/contexts/SessionContext'
import { getHotelConfigBySlug, getHotelChatConfig } from '@/config/multi-hotel-config'
import UniversalHotelChat from '@/components/UniversalHotelChat'

export default function OceanBreezePage() {
  const hotelConfig = getHotelConfigBySlug('ocean-breeze')!
  const chatConfig = getHotelChatConfig(hotelConfig)

  useEffect(() => {
    document.title = `${hotelConfig.name} - ${hotelConfig.tagline}`
  }, [])

  return (
    <ThemeProvider>
      <SessionProvider>
        <HotelProvider fallbackHotelSlug="ocean-breeze">
          <div className="min-h-screen">
            {/* Ocean Breeze Hero */}
            <section 
              className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,100,150,0.3), rgba(0,50,100,0.6)), url(${hotelConfig.assets.heroImage})`
              }}
            >
              <div className="text-center text-white px-4 max-w-6xl mx-auto">
                <img 
                  src={hotelConfig.assets.logo} 
                  alt="Ocean Breeze Resort logo"
                  className="h-28 w-auto mx-auto mb-8"
                />
                
                <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight text-shadow-lg">
                  Ocean Breeze
                </h1>
                
                <p className="text-3xl md:text-4xl mb-8 font-light text-cyan-100">
                  Where Ocean Meets Serenity
                </p>
                
                <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-95 leading-relaxed">
                  Immerse yourself in endless ocean views and tranquil luxury. 
                  Every wave tells a story of relaxation and rejuvenation.
                </p>

                {/* Ocean-themed CTA */}
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
                  <button 
                    onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-cyan-500 text-white px-10 py-5 text-xl font-bold rounded-full hover:bg-cyan-600 transition-all transform hover:scale-105 shadow-xl flex items-center"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with Ocean AI
                  </button>
                </div>

                {/* Wave Animation */}
                <div className="absolute bottom-0 left-0 w-full">
                  <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
                    <defs>
                      <path id="gentle-wave" d="m-160,44c30,0 58,-18 88,-18s 58,18 88,18 58,-18 88,-18 58,18 88,18 v44h-352z" />
                    </defs>
                    <g className="parallax">
                      <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                      <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                      <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                      <use href="#gentle-wave" x="48" y="7" fill="#fff" />
                    </g>
                  </svg>
                </div>
              </div>
            </section>

            {/* Ocean Features */}
            <section className="py-24 bg-gradient-to-b from-white to-cyan-50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">Seaside Luxury</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover unparalleled ocean experiences and water activities that make Ocean Breeze your perfect coastal getaway.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[
                    { icon: "🌊", title: "Ocean Views", desc: "Panoramic ocean views from every room and suite", color: "bg-blue-100 text-blue-600" },
                    { icon: "🏄‍♂️", title: "Water Sports", desc: "Surfing, paddleboarding, and kayaking adventures", color: "bg-cyan-100 text-cyan-600" },
                    { icon: "⛵", title: "Marina Access", desc: "Private marina with luxury yacht charters", color: "bg-teal-100 text-teal-600" },
                    { icon: "🦞", title: "Seafood Restaurant", desc: "Fresh daily catch prepared by master chefs", color: "bg-orange-100 text-orange-600" },
                    { icon: "🏖️", title: "Beach Club", desc: "Exclusive beach club with premium amenities", color: "bg-yellow-100 text-yellow-600" },
                    { icon: "🤖", title: "Ocean AI", desc: "AI concierge specialized in coastal experiences", color: "bg-indigo-100 text-indigo-600" }
                  ].map((feature, index) => (
                    <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                      <div className={`w-20 h-20 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:shadow-xl`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Concierge with Ocean Theme */}
            <section id="chat-section" className="py-24 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 text-white">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold mb-6">
                    Your Ocean AI Concierge
                  </h2>
                  <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
                    Dive into personalized service with our ocean-specialized AI assistant. 
                    Get tide information, water activity recommendations, and seamless oceanfront service.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-cyan-300 rounded-full mr-3 animate-pulse"></div>
                      <h3 className="text-xl font-bold text-white">Ocean Breeze AI Assistant</h3>
                      <span className="ml-auto text-cyan-100 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Always Available
                      </span>
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

                {/* Ocean-specific AI Features */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Tide Times</h4>
                    <p className="text-cyan-100 text-sm">Real-time tide information and best surf conditions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Water Activities</h4>
                    <p className="text-cyan-100 text-sm">Book diving, sailing, and water sports adventures</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Marina Services</h4>
                    <p className="text-cyan-100 text-sm">Yacht bookings and harbor information</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Weather Updates</h4>
                    <p className="text-cyan-100 text-sm">Marine weather and optimal activity planning</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer with Ocean Theme */}
            <footer className="bg-slate-900 text-white py-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-3xl font-bold mb-4 text-cyan-300">Ocean Breeze Resort</h3>
                    <p className="text-gray-300 mb-6 text-lg">
                      Where Ocean Meets Serenity. Experience the ultimate coastal luxury 
                      with panoramic ocean views and world-class water activities.
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-cyan-300">Contact</h4>
                    <div className="space-y-2 text-gray-300">
                      <p>+1-555-OCEAN-99</p>
                      <p>info@ocean-breeze.com</p>
                      <p>456 Coastal Drive<br />Beachfront, CA 90210</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-cyan-300">Water Activities</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>Surfing Lessons</li>
                      <li>Yacht Charters</li>
                      <li>Scuba Diving</li>
                      <li>Deep Sea Fishing</li>
                      <li>Beach Volleyball</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
                  <p>&copy; 2025 Ocean Breeze Resort. All rights reserved.</p>
                  <p className="mt-2">Powered by INITI AI Ocean Intelligence.</p>
                </div>
              </div>
            </footer>
          </div>

          <style jsx global>{`
            .waves {
              position: relative;
              width: 100%;
              height: 15vh;
              margin-bottom: -7px;
              min-height: 100px;
              max-height: 150px;
            }
            
            .parallax > use {
              animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
            }
            
            .parallax > use:nth-child(1) {
              animation-delay: -2s;
              animation-duration: 7s;
            }
            
            .parallax > use:nth-child(2) {
              animation-delay: -3s;
              animation-duration: 10s;
            }
            
            .parallax > use:nth-child(3) {
              animation-delay: -4s;
              animation-duration: 13s;
            }
            
            .parallax > use:nth-child(4) {
              animation-delay: -5s;
              animation-duration: 20s;
            }
            
            @keyframes move-forever {
              0% {
                transform: translate3d(-90px,0,0);
              }
              100% { 
                transform: translate3d(85px,0,0);
              }
            }
            
            .text-shadow-lg {
              text-shadow: 0 10px 20px rgba(0,0,0,0.5);
            }
          `}</style>
        </HotelProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
