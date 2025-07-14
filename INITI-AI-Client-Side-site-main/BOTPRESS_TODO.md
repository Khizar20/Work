# 🤖 Botpress Cloud Setup Guide
## Complete Implementation Checklist

Your chat page is now ready at `/chat` and will work with your QR code URLs! Follow this checklist to complete the Botpress Cloud configuration.

## ✅ What's Already Done

- ✅ Chat page created at `/chat` route
- ✅ URL parameter extraction (hotel_id, room_number, session_id)
- ✅ Session tracking to APIs
- ✅ Botpress scripts loading
- ✅ Session data passed to bot via userData
- ✅ Bot ID configured: `29cf19ce-37f3-4858-95d1-bc5bef6ba91d`

## 🔧 Required Setup in Botpress Cloud

### 1. Get Your Public Key
1. Go to [Botpress Cloud](https://siderite.botpress.app/)
2. Open your bot: "SuiteMindAI Multi-Hotel Assistant"
3. Go to **Settings** → **API Keys**
4. Copy your **Public Key**
5. Add to `.env.local`:
```bash
NEXT_PUBLIC_BOTPRESS_PUBLIC_KEY=bp_pat_your-actual-public-key-here
```

### 2. Configure Domain Whitelist
In Botpress Cloud → **Settings** → **Security**:
- Add domain: `https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app`
- Add domain: `localhost:3000`
- Add domain: `127.0.0.1:3000`

### 3. Configure User Variables
In Botpress Cloud → **Settings** → **User Variables**:

Add these variables to capture session data:
```
hotel_id (String) - Hotel identifier from QR code
room_number (String) - Guest room number
session_id (String) - Unique session ID
hotel_name (String) - Hotel display name
timestamp (String) - When session started
source (String) - How user accessed (qr_code)
```

### 4. Configure Conversation Variables
In Botpress Cloud → **Settings** → **Conversation Variables**:
```
hotel_context (Object) - Hotel-specific data
room_context (Object) - Room-specific data
guest_preferences (Object) - Guest service preferences
```

### 5. Create Welcome Flow
In Botpress Cloud → **Studio** → **Flows**:

**Start Node:**
```
👋 Welcome to {{user.hotel_name}}!

I'm your AI assistant for Room {{user.room_number}}.

How can I help you today?

🛎️ Room Service
🧹 Housekeeping  
ℹ️ Hotel Information
📞 Concierge
🚗 Transportation
```

**Add Buttons/Quick Replies:**
- "Room Service" → Goes to Room Service flow
- "Housekeeping" → Goes to Housekeeping flow
- "Hotel Info" → Goes to Hotel Information flow
- "Concierge" → Goes to Concierge flow

### 6. Test Session Data Access
In any flow node, you can access the session data:
```
Hotel: {{user.hotel_name}}
Room: {{user.room_number}}
Session: {{user.session_id}}
```

## 🧪 Testing Your Setup

### Test URL Structure:
```
http://localhost:3000/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=3b3fbaf4-04f9-4be5-83ce-c5c78b662085
```

### 1. Test Locally:
1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=test-123`
3. Check browser console for session data
4. Verify bot loads and receives data

### 2. Test with Real QR Codes:
1. Use a QR code from your Supabase admin app
2. Scan QR code with phone
3. Verify bot personalizes responses with hotel/room info

## 🔌 Integration Points

### Session Data Flow:
```
QR Code URL → /chat page → Extract params → Pass to Botpress → Bot knows hotel/room
```

### Data Available in Bot:
```javascript
// Automatically available in all Botpress flows:
{{user.hotel_id}}      // "8a1e6805-9253-4dd5-8893-0de3d7815555"
{{user.room_number}}   // "101"
{{user.session_id}}    // "3b3fbaf4-04f9-4be5-83ce-c5c78b662085"
{{user.hotel_name}}    // "Villa La Sala"
{{user.timestamp}}     // "2025-06-24T20:30:00.000Z"
{{user.source}}        // "qr_code"
```

## 🚀 Advanced Configuration (Optional)

### 1. Supabase Integration in Botpress
Create a custom action to load hotel/room data:
1. In Botpress Cloud → **Studio** → **Actions**
2. Create "Load Hotel Data" action
3. Use your Supabase credentials to fetch hotel-specific info

### 2. Service Request Integration
Create actions for:
- Create housekeeping request
- Order room service
- Contact concierge
- Book transportation

### 3. Multi-language Support
Configure language detection based on hotel location or user preference.

## 📊 Analytics & Monitoring

### Built-in Tracking:
- ✅ Session starts logged to `/api/track-session`
- ✅ Chat events logged to `/api/track-chat-event`
- ✅ Hotel/room context preserved
- ✅ Debug info in development mode

### Botpress Analytics:
- Monitor conversations in Botpress Cloud dashboard
- Track user satisfaction
- Analyze common requests by hotel/room

## 🛠️ Troubleshooting

### Common Issues:
1. **Bot not loading**: Check domain whitelist in Botpress Cloud
2. **Session data missing**: Verify URL parameters are correct
3. **Variables not working**: Ensure user variables are configured in Botpress Cloud
4. **CORS errors**: Add all domains to Botpress whitelist

### Debug Steps:
1. Check browser console for errors
2. Verify session data in debug panel (dev mode)
3. Test with simple URL parameters first
4. Check Botpress Cloud logs

## ✅ Final Checklist

- [ ] Get public key from Botpress Cloud
- [ ] Add public key to `.env.local`
- [ ] Configure domain whitelist
- [ ] Add user variables in Botpress Cloud
- [ ] Create welcome flow
- [ ] Test with sample URL
- [ ] Test with real QR code
- [ ] Verify session data reaches bot
- [ ] Deploy to production
- [ ] Update production domain whitelist

## 🎉 Success Criteria

When everything is working:
1. ✅ QR code scan opens `/chat` page
2. ✅ Bot loads with hotel/room context
3. ✅ Bot greets guest by hotel and room number
4. ✅ Session is tracked in your APIs
5. ✅ All 30 rooms work with same bot
6. ✅ Each room gets personalized assistance

Your enterprise multi-hotel AI assistant is ready! 🏨🤖
