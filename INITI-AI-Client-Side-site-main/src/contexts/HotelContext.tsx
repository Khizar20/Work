'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  HotelBrandingConfig, 
  getCurrentHotelConfig, 
  getHotelConfigBySlug,
  getHotelConfigById,
  validateHotelConfig 
} from '../config/multi-hotel-config'

interface HotelContextType {
  hotelConfig: HotelBrandingConfig | null
  isLoading: boolean
  error: string | null
  setHotelBySlug: (slug: string) => void
  setHotelById: (id: string) => void
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

interface HotelProviderProps {
  children: ReactNode
  fallbackHotelSlug?: string // Default hotel if none found
}

export function HotelProvider({ children, fallbackHotelSlug = 'villa-lasala' }: HotelProviderProps) {
  const [hotelConfig, setHotelConfig] = useState<HotelBrandingConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadHotelConfig = () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get hotel config from current domain
        let config = getCurrentHotelConfig()

        // If no config found by domain, try URL parameters
        if (!config) {
          const urlParams = new URLSearchParams(window.location.search)
          const hotelParam = urlParams.get('hotel') || urlParams.get('hotel_slug')
          const hotelId = urlParams.get('hotel_id')

          if (hotelId) {
            config = getHotelConfigById(hotelId)
          } else if (hotelParam) {
            config = getHotelConfigBySlug(hotelParam)
          }
        }

        // If still no config, use fallback
        if (!config) {
          config = getHotelConfigBySlug(fallbackHotelSlug)
          console.warn(`No hotel config found for domain, using fallback: ${fallbackHotelSlug}`)
        }

        // Validate config
        if (!config || !validateHotelConfig(config)) {
          throw new Error('Invalid hotel configuration')
        }

        setHotelConfig(config)
        
        // Apply theme to document
        applyHotelTheme(config)
        
        console.log(`🏨 Hotel loaded: ${config.name} (${config.slug})`)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hotel configuration'
        setError(errorMessage)
        console.error('Hotel configuration error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadHotelConfig()
  }, [mounted, fallbackHotelSlug])

  const setHotelBySlug = (slug: string) => {
    const config = getHotelConfigBySlug(slug)
    if (config && validateHotelConfig(config)) {
      setHotelConfig(config)
      applyHotelTheme(config)
      setError(null)
    } else {
      setError(`Hotel not found: ${slug}`)
    }
  }

  const setHotelById = (id: string) => {
    const config = getHotelConfigById(id)
    if (config && validateHotelConfig(config)) {
      setHotelConfig(config)
      applyHotelTheme(config)
      setError(null)
    } else {
      setError(`Hotel not found: ${id}`)
    }
  }

  return (
    <HotelContext.Provider 
      value={{
        hotelConfig,
        isLoading,
        error,
        setHotelBySlug,
        setHotelById
      }}
    >
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  return context
}

// Apply hotel theme to document
function applyHotelTheme(config: HotelBrandingConfig) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const theme = config.theme

  // Set CSS custom properties for theming
  root.style.setProperty('--hotel-primary', theme.primaryColor)
  root.style.setProperty('--hotel-secondary', theme.secondaryColor)
  root.style.setProperty('--hotel-accent', theme.accentColor)
  root.style.setProperty('--hotel-background', theme.backgroundColor)
  root.style.setProperty('--hotel-text', theme.textColor)

  // Update document title and favicon
  document.title = `${config.name} - ${config.tagline}`
  
  // Update favicon if different
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (favicon && config.assets.favicon) {
    favicon.href = config.assets.favicon
  }

  // Add hotel-specific class to body
  document.body.className = document.body.className.replace(/hotel-\w+/g, '')
  document.body.classList.add(`hotel-${config.slug}`)
}
