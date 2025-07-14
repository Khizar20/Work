export interface HotelTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface HotelConfig {
  id: string;
  name: string;
  description: string;
  tagline: string;
  heroImage: string;
  logoImage?: string;
  theme: {
    light: HotelTheme;
    dark: HotelTheme;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  botpress: {
    botId: string;
    hostUrl: string;
    messagingUrl: string;
    clientId: string;
  };
}

export const HOTEL_CONFIGS: Record<string, HotelConfig> = {
  'villalasala': {
    id: 'villalasala',
    name: 'VillaLaSala',
    description: 'Experience luxury and comfort in the heart of paradise. Our elegant suites and world-class amenities provide the perfect escape for discerning travelers.',
    tagline: 'Where Luxury Meets Paradise',
    heroImage: '/images/villa-lasala-hero.jpg',
    logoImage: '/images/villa-lasala-logo.png',
    theme: {
      light: {
        primary: '#2563eb', // Blue
        secondary: '#f59e0b', // Amber
        accent: '#10b981', // Emerald
        background: '#ffffff',
        text: '#1f2937',
        muted: '#6b7280'
      },
      dark: {
        primary: '#3b82f6', // Blue
        secondary: '#fbbf24', // Amber
        accent: '#34d399', // Emerald
        background: '#111827',
        text: '#f9fafb',
        muted: '#9ca3af'
      }
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@villalasala.com',
      address: '123 Paradise Boulevard, Tropical Resort, TR 12345'
    },
    botpress: {
      botId: "29cf19ce-37f3-4858-95d1-bc5bef6ba91d",
      hostUrl: "https://cdn.botpress.cloud/webchat/v2.2/inject.js", // This is the standard Botpress Cloud host for the widget
      messagingUrl: "https://messaging.botpress.cloud",
      clientId: "a98bb816-1780-4a10-b8ac-868f03c36a81"
    }
  },
  // Add more hotel configurations here for easy rebranding
  'sample-hotel': {
    id: 'sample-hotel',
    name: 'Sample Hotel',
    description: 'A sample hotel configuration for demonstration purposes.',
    tagline: 'Sample Luxury Experience',
    heroImage: '/images/sample-hero.jpg',
    theme: {
      light: {
        primary: '#dc2626', // Red
        secondary: '#059669', // Green
        accent: '#7c3aed', // Purple
        background: '#ffffff',
        text: '#1f2937',
        muted: '#6b7280'
      },
      dark: {
        primary: '#ef4444', // Red
        secondary: '#10b981', // Green
        accent: '#8b5cf6', // Purple
        background: '#111827',
        text: '#f9fafb',
        muted: '#9ca3af'
      }
    },
    contact: {
      phone: '+1 (555) 987-6543',
      email: 'info@samplehotel.com'
    },
    botpress: {
      botId: 'sample-bot-id',
      hostUrl: 'https://sample-botpress.com',
      messagingUrl: 'https://messaging.botpress.cloud',
      clientId: 'sample-client-id'
    }
  }
};

// Default hotel configuration (VillaLaSala)
export const DEFAULT_HOTEL_CONFIG = HOTEL_CONFIGS['villalasala'];

// Helper function to get hotel config by ID
export function getHotelConfig(hotelId?: string): HotelConfig {
  if (!hotelId) return DEFAULT_HOTEL_CONFIG;
  return HOTEL_CONFIGS[hotelId] || DEFAULT_HOTEL_CONFIG;
}
