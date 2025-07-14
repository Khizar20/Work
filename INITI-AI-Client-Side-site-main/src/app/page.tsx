'use client';

import { useRef } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ChatSection } from '@/components/ChatSection';
import { ContactSection } from '@/components/ContactSection';
import { getHotelConfig } from '@/config/hotels';
import { useSession } from '@/contexts/SessionContext';

export default function Home() {
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const { sessionParams } = useSession();
  
  // Get hotel configuration based on session parameters
  const hotelConfig = getHotelConfig(sessionParams.hotel_id);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Header hotelConfig={hotelConfig} />
      
      <section id="home">
        <HeroSection 
          hotelConfig={hotelConfig} 
          onStartChat={scrollToChat}
        />
      </section>

      <div ref={chatSectionRef}>
        <ChatSection hotelConfig={hotelConfig} />
      </div>

      <ContactSection hotelConfig={hotelConfig} />

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">{hotelConfig.name}</h3>
              <p className="text-gray-300 mb-4">
                {hotelConfig.tagline}
              </p>
              <p className="text-gray-400 text-sm">
                Experience luxury redefined with our AI-powered concierge service.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#chat" className="hover:text-white transition-colors">AI Concierge</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>24/7 AI Concierge</li>
                <li>Room Service</li>
                <li>Local Recommendations</li>
                <li>Hotel Amenities</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {hotelConfig.name}. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Powered by AI technology for enhanced guest experience.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
