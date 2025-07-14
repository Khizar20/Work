'use client';

import { HotelConfig } from '@/config/hotels';
import { useSession } from '@/contexts/SessionContext';
import Image from 'next/image';

interface HeroSectionProps {
  hotelConfig: HotelConfig;
  onStartChat: () => void;
}

export function HeroSection({ hotelConfig, onStartChat }: HeroSectionProps) {
  const { sessionParams, isValidSession } = useSession();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={hotelConfig.heroImage}
          alt={`${hotelConfig.name} hero image`}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Logo */}
        {hotelConfig.logoImage && (
          <div className="mb-8">
            <Image
              src={hotelConfig.logoImage}
              alt={`${hotelConfig.name} logo`}
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
        )}

        {/* Hotel Name */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          {hotelConfig.name}
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
          {hotelConfig.tagline}
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
          {hotelConfig.description}
        </p>

        {/* Session Info Display */}
        {isValidSession && (
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-md mx-auto">
            <p className="text-sm opacity-90 mb-2">Welcome to</p>
            <p className="font-semibold">Room {sessionParams.room_number}</p>
          </div>
        )}

        {/* Start Chat Button */}
        <button
          onClick={onStartChat}
          disabled={!isValidSession}
          className={`
            inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105
            ${isValidSession 
              ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl' 
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {isValidSession ? 'Start Chatting Now' : 'Scan QR Code to Chat'}
        </button>

        {/* Additional Info for Invalid Session */}
        {!isValidSession && (
          <p className="mt-4 text-sm opacity-75 max-w-md mx-auto">
            Please scan the QR code in your hotel room to access our AI concierge service.
          </p>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
