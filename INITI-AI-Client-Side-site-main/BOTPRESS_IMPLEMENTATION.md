# 🚀 Botpress Multi-Hotel Bot Implementation Guide

## Quick Start Instructions

### 1. Set Up Botpress Environment

```bash
# Install Botpress CLI globally
npm install -g @botpress/cli

# Navigate to your botpress directory
cd botpress

# Initialize Botpress project (if not done already)
bp init

# Install dependencies
npm install
```

### 2. Configure Your Bot

1. **Create a new bot in Botpress Cloud:**
   - Go to [Botpress Cloud](https://app.botpress.cloud)
   - Create a new bot
   - Copy your Bot ID and credentials

2. **Update bot.definition.ts:**
   - Replace placeholder values with your actual Supabase credentials
   - Configure your hotel IDs and default settings

3. **Set Environment Variables:**
   ```bash
   # In your .env file
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   BOTPRESS_BOT_ID=your_bot_id
   BOTPRESS_CLIENT_ID=your_client_id
   ```

### 3. Database Schema Requirements

Your Supabase database should have these tables:

#### Hotels Table
```sql
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  tagline VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  website VARCHAR,
  emergency_contact VARCHAR,
  coordinates JSONB,
  timezone VARCHAR,
  local_attractions JSONB,
  webhook_url VARCHAR,
  notification_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Rooms Table
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id),
  room_number VARCHAR NOT NULL,
  floor INTEGER,
  room_type_id UUID REFERENCES room_types(id),
  status VARCHAR DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hotel_id, room_number)
);
```

#### Room Types Table
```sql
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id),
  name VARCHAR NOT NULL,
  description TEXT,
  amenities JSONB,
  tv_channels TEXT,
  max_occupancy INTEGER,
  size_sqft INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### QR Sessions Table
```sql
CREATE TABLE qr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL,
  hotel_id UUID REFERENCES hotels(id),
  room_number VARCHAR,
  wifi_password VARCHAR,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

#### Service Requests Table
```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES hotels(id),
  room_number VARCHAR,
  guest_id UUID,
  request_type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR DEFAULT 'medium',
  status VARCHAR DEFAULT 'pending',
  assigned_to UUID,
  completed_at TIMESTAMP,
  notes TEXT,
  source VARCHAR DEFAULT 'chatbot',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Deploy Your Bot

```bash
# Build the bot
npm run build

# Deploy to Botpress Cloud
npm run deploy

# Or run locally for development
npm run dev
```

### 5. Update Your Landing Page Integration

Update your hotel config with the actual Botpress credentials:

```typescript
// In src/config/hotels.ts
botpress: {
  botId: 'your-actual-bot-id',
  hostUrl: 'https://your-botpress-instance.com',
  messagingUrl: 'https://messaging.botpress.cloud',
  clientId: 'your-actual-client-id'
}
```

## 🔧 Configuration Details

### QR Code URL Structure
Your QR codes should generate URLs like:
```
https://your-domain.com/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=3b3fbaf4-04f9-4be5-83ce-c5c78b662085
```

### Bot Conversation Flow

1. **User scans QR code** → Lands on your website with parameters
2. **Website initializes chat** → Passes hotel_id, room_number, session_id to bot
3. **Bot loads context** → Fetches hotel and room data from Supabase
4. **Personalized greeting** → Welcome message with hotel branding
5. **Context-aware assistance** → Responses based on hotel and room context

### Key Features

✅ **Multi-Hotel Support**: One bot handles multiple hotels with different branding
✅ **Room-Specific Context**: WiFi passwords, room amenities, service instructions
✅ **Service Requests**: Integrated ticketing system for hotel staff
✅ **Guest Recognition**: Loads current guest information when available
✅ **Session Tracking**: Monitors QR code usage and access patterns
✅ **Fallback Handling**: Graceful degradation when data is unavailable

## 🎯 Next Steps

1. **Test the Bot**: Create test QR codes and verify the flow works
2. **Train the AI**: Add more knowledge base content for better responses
3. **Customize Branding**: Update welcome messages and responses per hotel
4. **Add Integrations**: Connect to PMS, payment systems, or other hotel software
5. **Monitor Performance**: Set up analytics and feedback collection
6. **Scale**: Add more hotels by updating the database and knowledge base

## 🆘 Troubleshooting

### Common Issues:
- **Bot not responding**: Check Botpress credentials and deployment status
- **Database errors**: Verify Supabase connection and table schema
- **QR code parameters not working**: Check URL format and parameter extraction
- **Context not loading**: Verify hotel_id exists in database

### Debug Mode:
```bash
# Run bot in development mode with logging
npm run dev -- --verbose
```

## 📞 Support

For technical support or questions:
- Check Botpress documentation: https://botpress.com/docs
- Review Supabase documentation: https://supabase.com/docs
- Contact your development team for custom modifications

Your multi-hotel chatbot is now ready to provide personalized guest experiences! 🎉
