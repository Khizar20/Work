'use client'

import { useState } from 'react'
import { MULTI_HOTEL_CONFIGS, MASTER_BOT_CONFIG } from '@/config/multi-hotel-config'
import UniversalHotelChat from '@/components/UniversalHotelChat'

export default function QRCodeTestPage() {
  const [selectedHotel, setSelectedHotel] = useState('villa-lasala')
  const [roomNumber, setRoomNumber] = useState('101')
  const [guestName, setGuestName] = useState('John Doe')
  const [sessionId, setSessionId] = useState('550e8400-e29b-41d4-a716-446655440000')
  const [showChat, setShowChat] = useState(false)

  const simulateQRCodeScan = () => {
    // Set URL parameters to simulate QR code scan from your admin app
    const params = new URLSearchParams()
    const hotelConfig = MULTI_HOTEL_CONFIGS[selectedHotel]
    
    params.set('hotel_id', hotelConfig.id)
    params.set('room_number', roomNumber)
    if (sessionId) params.set('session_id', sessionId)
    if (guestName) params.set('guest_name', guestName)
    
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, '', newUrl)
    
    setShowChat(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 QR Code Workflow Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the complete QR code workflow (QR codes are generated in your admin app)
          </p>

          {/* Simulate QR Code Scan */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Simulate QR Code Scan</h2>
            <p className="text-gray-600 mb-4">
              Simulate what happens when a guest scans a QR code from your admin app
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel
                </label>
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MULTI_HOTEL_CONFIGS).map(([slug, config]) => (
                    <option key={slug} value={slug}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session ID
                </label>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="UUID from QR code"
                />
              </div>
            </div>

            <button
              onClick={simulateQRCodeScan}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Simulate QR Code Scan
            </button>
          </div>

          {/* Chat Test Area */}
          {showChat && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Bot Chat Test</h2>              <p className="text-gray-600 mb-4">
                This is what guests see after scanning QR code from your admin app
              </p>
              
              <div className="bg-white rounded-lg border border-gray-200 h-96">
                <UniversalHotelChat
                  hotelId={MULTI_HOTEL_CONFIGS[selectedHotel].id}
                  hotelName={MULTI_HOTEL_CONFIGS[selectedHotel].name}
                  masterBotId={MASTER_BOT_CONFIG.botId}
                  autoOpen={true}
                  className="h-full"
                />
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🚦 System Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Multi-hotel configuration ✅</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Session tracking APIs ✅</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Universal chat component ✅</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Hotel landing pages ✅</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">QR codes (in admin app) ✅</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Botpress Cloud setup (next step) ⏳</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Next Step:</h3>
              <p className="text-sm text-gray-600">
                Create your bot in Botpress Cloud and update the bot credentials in 
                <code className="bg-gray-200 px-1 rounded">src/config/multi-hotel-config.ts</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 QR Code Workflow Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the complete QR code → landing page → bot chat workflow
          </p>

          {/* QR Code Generator */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Generate Test QR Code</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel
                </label>
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MULTI_HOTEL_CONFIGS).map(([slug, config]) => (
                    <option key={slug} value={slug}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name (Optional)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session ID (Optional)
                </label>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for auto-generation"
                />
              </div>
            </div>

            <button
              onClick={generateTestQR}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Generate QR Code URL
            </button>

            {testUrl && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Generated QR Code URL:</h3>
                <p className="text-sm text-gray-600 break-all mb-3">{testUrl}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={testQRCode}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    🔗 Open in New Tab
                  </button>
                  
                  <button
                    onClick={loadChatInCurrentPage}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    💬 Test Chat Here
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Test Area */}
          {showChat && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Chat Test</h2>              <p className="text-gray-600 mb-4">
                This simulates what guests see after scanning the QR code
              </p>
              
              <div className="bg-white rounded-lg border border-gray-200 h-96">
                <UniversalHotelChat
                  hotelId={MULTI_HOTEL_CONFIGS[selectedHotel].id}
                  hotelName={MULTI_HOTEL_CONFIGS[selectedHotel].name}
                  masterBotId={MASTER_BOT_CONFIG.botId}
                  autoOpen={true}
                  className="h-full"
                />
              </div>
            </div>
          )}

          {/* Workflow Explanation */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔄 Complete Workflow</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-medium">QR Code Generation</h3>
                  <p className="text-sm text-gray-600">Hotel staff generates unique QR codes for each room using the generator above</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-medium">Guest Scans QR Code</h3>
                  <p className="text-sm text-gray-600">Guest uses phone camera to scan QR code in their room</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-medium">Landing Page Loads</h3>
                  <p className="text-sm text-gray-600">Browser opens hotel-specific landing page with session parameters in URL</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="font-medium">Session Tracking</h3>
                  <p className="text-sm text-gray-600">System logs the session with hotel_id, room_number, and guest info</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <h3 className="font-medium">Bot Initialization</h3>
                  <p className="text-sm text-gray-600">Universal bot loads with hotel/room context via userData</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</div>
                <div>
                  <h3 className="font-medium">Personalized Service</h3>
                  <p className="text-sm text-gray-600">Guest receives assistance tailored to their hotel and room</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">🚦 System Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Multi-hotel configuration</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">QR code generation</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Session utilities</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Universal chat component</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">API endpoints</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Botpress bot deployment (pending)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
