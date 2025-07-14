export interface SessionParams {
  hotel_id?: string;
  room_number?: string;
  session_id?: string;
  guest_name?: string;
  reservation_id?: string;
}

export interface EnhancedSessionParams extends SessionParams {
  isValid: boolean
  timestamp: string
  userAgent?: string
  source: 'qr_code' | 'direct' | 'unknown'
}

/**
 * Extract session parameters from URL query string
 */
export function getSessionParamsFromUrl(): SessionParams {
  if (typeof window === 'undefined') {
    return {}; // Server-side rendering
  }

  const params = new URLSearchParams(window.location.search);
  
  const sessionParams: SessionParams = {
    hotel_id: params.get('hotel_id') || undefined,
    room_number: params.get('room_number') || undefined,
    session_id: params.get('session_id') || undefined,
    guest_name: params.get('guest_name') || undefined,
    reservation_id: params.get('reservation_id') || undefined,
  };

  return sessionParams;
}

/**
 * Create enhanced session with validation and metadata
 */
export function createEnhancedSession(params: SessionParams): EnhancedSessionParams {
  const isValid = Boolean(params.hotel_id && params.room_number)
  const source = params.session_id ? 'qr_code' : (isValid ? 'direct' : 'unknown')
  
  return {
    ...params,
    isValid,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    source
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate that required session parameters are present
 */
export function validateSessionParams(params: SessionParams): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!params.hotel_id) {
    errors.push('Hotel ID is required')
  }
  
  if (!params.room_number) {
    errors.push('Room number is required')
  }
  
  // Validate UUID format for hotel_id
  if (params.hotel_id && !isValidUUID(params.hotel_id)) {
    errors.push('Hotel ID must be a valid UUID')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if string is valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Create QR code URL with session parameters
 */
export function createQRCodeURL(hotelId: string, roomNumber: string, baseUrl?: string): string {
  const sessionId = generateSessionId()
  const base = baseUrl || 'https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app'
  
  const url = new URL('/chat', base)
  url.searchParams.set('hotel_id', hotelId)
  url.searchParams.set('room_number', roomNumber)
  url.searchParams.set('session_id', sessionId)
  
  return url.toString()
}

/**
 * Store session parameters in localStorage
 */
export function storeSessionParams(params: SessionParams): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('hotel_session', JSON.stringify(params));
  } catch (error) {
    console.warn('Failed to store session parameters:', error);
  }
}

/**
 * Retrieve session parameters from localStorage
 */
export function getStoredSessionParams(): SessionParams {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('hotel_session');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to retrieve session parameters:', error);
    return {};
  }
}

/**
 * Clear session parameters from localStorage
 */
export function clearSessionParams(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('hotel_session');
  } catch (error) {
    console.warn('Failed to clear session parameters:', error);
  }
}

/**
 * Get session parameters with fallback to stored values
 */
export function getSessionParams(): SessionParams {
  const urlParams = getSessionParamsFromUrl();
  
  // If URL has parameters, use and store them
  if (urlParams.hotel_id || urlParams.room_number) {
    storeSessionParams(urlParams);
    return urlParams;
  }
  
  // Otherwise, try to get from storage
  return getStoredSessionParams();
}
