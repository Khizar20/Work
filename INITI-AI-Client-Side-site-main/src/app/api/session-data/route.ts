import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for session data (you could use Redis or database instead)
const sessionStorage = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, hotel_id, room_number, hotel_name, timestamp } = body

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    // Store session data with expiry (24 hours)
    const sessionData = {
      session_id,
      hotel_id,
      room_number,
      hotel_name,
      timestamp: timestamp || new Date().toISOString(),
      source: 'qr_code',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    sessionStorage.set(session_id, sessionData)
    
    console.log('✅ Session data stored:', sessionData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session data stored successfully',
      session_id 
    })

  } catch (error) {
    console.error('❌ Error storing session data:', error)
    return NextResponse.json({ error: 'Failed to store session data' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const user_id = searchParams.get('user_id')
    const recent = searchParams.get('recent')

    // If recent=true, return the most recent non-expired session
    if (recent === 'true') {
      const now = new Date()
      let mostRecentSession = null
      let mostRecentTime = 0

      for (const [key, data] of sessionStorage.entries()) {
        const sessionTime = new Date(data.timestamp).getTime()
        const expiresAt = new Date(data.expires_at)
        
        // Only consider non-expired sessions
        if (now <= expiresAt && sessionTime > mostRecentTime) {
          mostRecentTime = sessionTime
          mostRecentSession = data
        }
      }

      if (mostRecentSession) {
        console.log('✅ Most recent session data retrieved:', mostRecentSession)
        return NextResponse.json({ 
          success: true, 
          data: mostRecentSession,
          found: true,
          note: 'Most recent session'
        })
      } else {
        return NextResponse.json({ 
          error: 'No recent sessions found',
          found: false 
        }, { status: 404 })
      }
    }

    if (!session_id && !user_id) {
      return NextResponse.json({ error: 'session_id, user_id, or recent=true is required' }, { status: 400 })
    }

    // Try to find session data by session_id first
    let sessionData = null
    if (session_id) {
      sessionData = sessionStorage.get(session_id)
    }

    // If not found by session_id, try to find by user_id pattern
    if (!sessionData && user_id) {
      for (const [key, data] of sessionStorage.entries()) {
        if (data.user_id === user_id || key.includes(user_id)) {
          sessionData = data
          break
        }
      }
    }

    // Check if session data exists and hasn't expired
    if (sessionData) {
      const now = new Date()
      const expiresAt = new Date(sessionData.expires_at)
      
      if (now > expiresAt) {
        // Session expired, remove it
        sessionStorage.delete(session_id || '')
        return NextResponse.json({ 
          error: 'Session expired',
          found: false 
        }, { status: 404 })
      }

      console.log('✅ Session data retrieved:', sessionData)
      return NextResponse.json({ 
        success: true, 
        data: sessionData,
        found: true
      })
    }

    console.log('⚠️ Session data not found for:', { session_id, user_id })
    return NextResponse.json({ 
      error: 'Session data not found',
      found: false,
      available_sessions: Array.from(sessionStorage.keys()).slice(0, 5) // Show some available keys for debugging
    }, { status: 404 })

  } catch (error) {
    console.error('❌ Error retrieving session data:', error)
    return NextResponse.json({ error: 'Failed to retrieve session data' }, { status: 500 })
  }
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = new Date()
  for (const [sessionId, data] of sessionStorage.entries()) {
    if (new Date(data.expires_at) < now) {
      sessionStorage.delete(sessionId)
      console.log('🧹 Cleaned up expired session:', sessionId)
    }
  }
}, 60 * 60 * 1000) // Clean every hour 