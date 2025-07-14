# Botpress Cloud Setup - Multi-Hotel AI Assistant
## Simple 5-Step Setup

**Important**: You create everything in Botpress Cloud dashboard - no local files needed!

## 🚀 Quick Setup Steps

### 1. Create Botpress Cloud Account
1. Go to [Botpress Cloud](https://siderite.botpress.app/)
2. Sign up for a free account
3. Click "Create Bot"
4. Name it "SuiteMindAI Multi-Hotel Assistant"

### 2. Configure Bot Settings
In your Botpress Cloud dashboard:

**Security → Domain Whitelist:**
- Add: `https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app`
- Add: `localhost:3000` (for development)
- Add: Your production domain when ready

**Webchat → Appearance:**
- Enable "Hide Widget" (we control when it shows)
- Set Theme: "Prism" 
- Primary Color: `#2563eb` (or hotel-specific color)

### 3. Copy Bot Credentials
From your bot dashboard, copy these values:

```typescript
// Update in src/config/multi-hotel-config.ts
export const MASTER_BOT_CONFIG: MasterBotConfig = {
  botId: 'your-bot-id-here',           // From Botpress Cloud → Bot ID
  publicKey: 'your-public-key-here',   // From Botpress Cloud → Public Key  
  hostUrl: 'https://cdn.botpress.cloud',
  // ... rest stays the same
}
```

### 4. Configure Bot Variables (in Botpress Cloud)
**User Variables:**
- `hotel_id` (string) - Hotel identifier from QR code
- `room_number` (string) - Room number from QR code  
- `session_id` (string) - Session ID from QR code
- `guest_name` (string) - Guest name if provided
- `hotel_name` (string) - Hotel display name

**Conversation Variables:**
- `hotel_context` (object) - Hotel info loaded from Supabase
- `room_context` (object) - Room info loaded from Supabase

### 5. Create Simple Welcome Flow
In Botpress Cloud Studio:

**Start Node:**
```
Welcome to {{user.hotel_name}}! 🏨

I'm your AI assistant for Room {{user.room_number}}.

How can I help you today?
- 🛎️ Room Service
- 🧹 Housekeeping  
- ℹ️ Hotel Information
- 📞 Concierge
```

**That's it!** Your bot is ready to receive session data from QR codes.

## 🏨 How It Works

### Data Flow:
1. **QR Code Scan** → Landing page with URL parameters
2. **UniversalHotelChat** extracts session data 
3. **Botpress receives** hotel_id, room_number, etc. via `userData`
4. **Bot personalizes** responses based on hotel/room context

### Session Data Sent to Bot:
```typescript
// This data is automatically sent to your Botpress bot
userData: {
  hotel_id: "villa-lasala",
  room_number: "101", 
  session_id: "uuid-here",
  hotel_name: "Villa La Sala",
  guest_name: "John Doe", // if provided
  source: "qr_code"
}
```

## 🔧 Current System Status

✅ **Complete & Working:**
- Multi-hotel configuration system
- QR code URL generation (in your admin app)
- UniversalHotelChat component
- Session tracking APIs
- Hotel-specific landing pages

⏳ **Next Steps:**
1. Create bot in Botpress Cloud (5 minutes)
2. Update MASTER_BOT_CONFIG with real credentials
3. Test with QR codes from your admin app

## 🧪 Testing

Visit: `http://localhost:3000/test-qr` to test the complete workflow

## 🚫 What You DON'T Need

- ❌ No Botpress CLI installation
- ❌ No local Botpress files  
- ❌ No bot deployment commands
- ❌ No complex configurations

Everything is done in the Botpress Cloud web interface!

## 🏨 How It Works

### QR Code URL Structure
```
https://your-domain.com/hotels/villa-lasala?hotel_id=villa-lasala&room_number=101&session_id=uuid-here&guest_name=John%20Doe
```

### Bot Flow
1. **Guest scans QR code** → Landing page loads with session parameters
2. **UniversalHotelChat component** extracts session data from URL
3. **Session tracking API** logs the interaction
4. **Botpress bot receives** hotel_id, room_number, session_id via userData
5. **Bot loads hotel/room data** from Supabase using session-init.ts hook
6. **Personalized assistance** based on hotel and room context

### Session Data Flow
```typescript
// URL Parameters → Component → Botpress userData
{
  hotel_id: "villa-lasala",
  room_number: "101", 
  session_id: "550e8400-e29b-41d4-a716-446655440000",
  guest_name: "John Doe",
  hotel_name: "Villa La Sala",
  timestamp: "2025-06-24T20:30:00.000Z",
  source: "qr_code"
}
```

## 🔧 Bot Capabilities

### Automated Hotel Detection
- Bot automatically identifies which hotel based on `hotel_id`
- Loads hotel-specific data from Supabase
- Customizes responses for that hotel's services

### Room-Specific Assistance  
- Understands guest's specific room number
- Can provide room-specific information
- Handles room service requests contextually

### Multi-Language Support
- Detects guest language preference
- Responds in appropriate language
- Maintains context across conversations

### Service Request Integration
- Creates service requests in Supabase
- Tracks request status
- Sends notifications to hotel staff

## 📊 Analytics & Tracking

### Session Tracking
- Every QR code scan creates a session record
- Tracks guest journey and interactions
- Provides insights for hotel management

### Chat Event Logging
- All conversations are logged
- Sentiment analysis of guest interactions
- Performance metrics for bot responses

## 🛠️ Development Workflow

### Adding New Hotels
1. Add hotel config to `MULTI_HOTEL_CONFIGS`
2. Create hotel-specific landing page
3. Add hotel data to Supabase
4. Generate QR codes for rooms
5. Test complete workflow

### Testing QR Code Flow
1. Generate test QR code:
```typescript
import { generateQRCodeURL } from '@/utils/session'

const qrUrl = generateQRCodeURL({
  hotelSlug: 'villa-lasala',
  hotelId: 'villa-lasala', 
  roomNumber: '101',
  guestName: 'Test Guest'
})
```

2. Scan QR code or visit URL
3. Verify session tracking in browser console
4. Test bot responses

## 🔐 Security Considerations

### Domain Whitelisting
- Only allow trusted domains in Botpress
- Use HTTPS in production
- Validate session parameters

### Session Validation
- UUID format validation for session_ids
- Hotel/room existence verification
- Rate limiting on API endpoints

### Data Privacy
- Session data is temporary
- No persistent storage of guest data
- GDPR compliance ready

## 📱 QR Code Generation

### For Hotel Staff
Create QR codes using the utility function:
```typescript
import { generateQRCodeURL } from '@/utils/session'

// For each room, generate a unique QR code
rooms.forEach(room => {
  const qrUrl = generateQRCodeURL({
    hotelSlug: hotel.slug,
    hotelId: hotel.id,
    roomNumber: room.number
  })
  
  // Generate QR code image from qrUrl
  // Print and place in room
})
```

## 🚀 Production Deployment

### Vercel Deployment
```bash
# Build and deploy
npm run build
vercel --prod
```

### Environment Variables
Required in production:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
BOTPRESS_BOT_ID=your-bot-id
BOTPRESS_PUBLIC_KEY=your-public-key
```

### Domain Configuration
1. Update Botpress domain whitelist with production URL
2. Update MASTER_BOT_CONFIG with production bot credentials
3. Test complete QR code workflow in production

## 📞 Support & Troubleshooting

### Common Issues
1. **Bot not loading**: Check domain whitelist in Botpress
2. **Session not tracking**: Verify API endpoints are accessible
3. **Wrong hotel data**: Check hotel_id parameter in URL
4. **QR code not working**: Verify URL format and parameters

### Debug Mode
Enable debug logging:
```typescript
// In UniversalHotelChat.tsx
console.log('🤖 Bot initialization:', {
  hotel_id, room_number, session_id
})
```

### Contact
For technical support with this multi-hotel system, check:
1. Browser console for error messages
2. Network tab for failed API calls
3. Botpress Cloud logs for bot errors
4. Supabase logs for database issues
