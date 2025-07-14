// Multi-Hotel Configuration System
// Each hotel has its own config but uses the same master bot

export interface HotelBrandingConfig {
  id: string
  name: string
  domain: string
  slug: string
  description: string
  tagline: string
  
  // Visual branding
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
  }
  
  // Assets
  assets: {
    logo: string
    favicon: string
    heroImage: string
    backgroundImage?: string
  }
  
  // Contact information
  contact: {
    phone: string
    email: string
    address: string
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  
  // Hotel features and amenities
  features: string[]
  amenities: string[]
  
  // Location and local info
  location: {
    city: string
    country: string
    timezone: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

export interface MasterBotConfig {
  // SAME FOR ALL HOTELS - Master Bot Credentials (Free Version)
  botId: string
  hostUrl: string
  webchatScript: string
  configScript: string
  supabaseUrl: string
  supabaseAnonKey: string
}

// Master bot configuration - SHARED ACROSS ALL HOTELS
export const MASTER_BOT_CONFIG: MasterBotConfig = {
  botId: process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID || '29cf19ce-37f3-4858-95d1-bc5bef6ba91d',
  hostUrl: 'https://cdn.botpress.cloud',
  webchatScript: 'https://cdn.botpress.cloud/webchat/v3.0/inject.js',
  configScript: process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT || 'https://files.bpcontent.cloud/2025/06/23/21/20250623213319-P11CTOXP.json',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fxxzotnhkahdrehvkwhb.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE'
}

console.log('MASTER_BOT_CONFIG:', MASTER_BOT_CONFIG);

// Hotel-specific configurations - ADD NEW HOTELS HERE
export const MULTI_HOTEL_CONFIGS: Record<string, HotelBrandingConfig> = {
  'villa-lasala': {
    id: '8a1e6805-9253-4dd5-8893-0de3d7815555',
    name: 'VillaLaSala',
    domain: 'villa-lasala.com',
    slug: 'villa-lasala',
    description: 'Experience luxury and comfort in the heart of paradise.',
    tagline: 'Where Luxury Meets Paradise',
    
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    },
    
    assets: {
      logo: '/assets/villa-lasala/logo.png',
      favicon: '/assets/villa-lasala/favicon.ico',
      heroImage: '/assets/villa-lasala/hero.jpg',
      backgroundImage: '/assets/villa-lasala/background.jpg'
    },
    
    contact: {
      phone: '+1-555-VILLA-01',
      email: 'concierge@villa-lasala.com',
      address: '123 Paradise Lane, Tropical Island, TI 12345',
      website: 'https://villa-lasala.com',
      socialMedia: {
        instagram: '@villalasala',
        facebook: 'VillaLaSalaResort'
      }
    },
    
    features: ['Luxury Spa', 'Infinity Pool', 'Fine Dining', 'Private Beach', 'Concierge'],
    amenities: ['WiFi', 'AC', 'Mini Bar', 'Room Service', 'Valet', 'Gym'],
    
    location: {
      city: 'Paradise Island',
      country: 'Tropical Paradise',
      timezone: 'Pacific/Honolulu',
      coordinates: { lat: 21.3099, lng: -157.8581 }
    }
  },

  'ocean-breeze': {
    id: 'b2c3d4e5-6789-4abc-def0-123456789abc',
    name: 'Ocean Breeze Resort',
    domain: 'ocean-breeze.com',
    slug: 'ocean-breeze',
    description: 'Seaside luxury with endless ocean views.',
    tagline: 'Where Ocean Meets Serenity',
    
    theme: {
      primaryColor: '#0891b2',
      secondaryColor: '#0e7490',
      accentColor: '#06b6d4',
      backgroundColor: '#f0f9ff',
      textColor: '#0c4a6e'
    },
    
    assets: {
      logo: '/assets/ocean-breeze/logo.png',
      favicon: '/assets/ocean-breeze/favicon.ico',
      heroImage: '/assets/ocean-breeze/hero.jpg'
    },
    
    contact: {
      phone: '+1-555-OCEAN-99',
      email: 'info@ocean-breeze.com',
      address: '456 Coastal Drive, Beachfront, CA 90210',
      website: 'https://ocean-breeze.com'
    },
    
    features: ['Ocean Views', 'Water Sports', 'Marina', 'Seafood Restaurant', 'Beach Club'],
    amenities: ['WiFi', 'Balcony', 'Ocean View', 'Beach Access', 'Water Sports'],
    
    location: {
      city: 'Beachfront',
      country: 'United States',
      timezone: 'America/Los_Angeles',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    }
  },

  'mountain-peak': {
    id: 'c3d4e5f6-789a-4bcd-ef01-23456789bcde',
    name: 'Mountain Peak Lodge',
    domain: 'mountain-peak.com',
    slug: 'mountain-peak',
    description: 'Alpine luxury in the heart of the mountains.',
    tagline: 'Where Mountains Touch the Sky',
    
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#10b981',
      backgroundColor: '#f0fdf4',
      textColor: '#064e3b'
    },
    
    assets: {
      logo: '/assets/mountain-peak/logo.png',
      favicon: '/assets/mountain-peak/favicon.ico',
      heroImage: '/assets/mountain-peak/hero.jpg'
    },
    
    contact: {
      phone: '+1-555-PEAK-777',
      email: 'reservations@mountain-peak.com',
      address: '789 Alpine Way, Mountain View, CO 80424',
      website: 'https://mountain-peak.com'
    },
    
    features: ['Ski Access', 'Mountain Views', 'Spa', 'Fireplace', 'Alpine Restaurant'],
    amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Ski Storage', 'Hot Tub'],
    
    location: {
      city: 'Mountain View',
      country: 'United States',
      timezone: 'America/Denver',
      coordinates: { lat: 39.7392, lng: -104.9903 }
    }
  }
}

// Utility functions for hotel configuration
export function getHotelConfigByDomain(domain: string): HotelBrandingConfig | null {
  const cleanDomain = domain.replace('www.', '').replace('https://', '').replace('http://', '')
  
  return Object.values(MULTI_HOTEL_CONFIGS).find(
    config => config.domain === cleanDomain
  ) || null
}

export function getHotelConfigBySlug(slug: string): HotelBrandingConfig | null {
  return MULTI_HOTEL_CONFIGS[slug] || null
}

export function getHotelConfigById(id: string): HotelBrandingConfig | null {
  return Object.values(MULTI_HOTEL_CONFIGS).find(
    config => config.id === id
  ) || null
}

export function getCurrentHotelConfig(): HotelBrandingConfig | null {
  if (typeof window === 'undefined') return null
  
  const domain = window.location.hostname
  return getHotelConfigByDomain(domain)
}

export function getAllHotelConfigs(): HotelBrandingConfig[] {
  return Object.values(MULTI_HOTEL_CONFIGS)
}

// Get master bot config (same for all hotels)
export function getMasterBotConfig(): MasterBotConfig {
  return MASTER_BOT_CONFIG
}

// Validate hotel configuration
export function validateHotelConfig(config: HotelBrandingConfig): boolean {
  return !!(
    config.id &&
    config.name &&
    config.domain &&
    config.slug &&
    config.theme?.primaryColor &&
    config.contact?.email
  )
}

// Get chat configuration for a specific hotel
export function getHotelChatConfig(hotelConfig: HotelBrandingConfig) {
  const masterBot = getMasterBotConfig()
  
  return {
    hotelId: hotelConfig.id,
    hotelName: hotelConfig.name,
    masterBotId: masterBot.botId,
    botpressHost: masterBot.hostUrl,
    theme: hotelConfig.theme
  }
}
