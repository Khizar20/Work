# Multi-Hotel Botpress Bot Setup Guide

## 🏨 Hotel Management Bot Architecture

This bot is designed to handle multiple hotels and rooms using QR code parameters from your Supabase database.

### QR Code Structure
```
https://your-domain.com/chat?hotel_id=UUID&room_number=101&session_id=UUID
```

### Bot Flow Overview
1. **Session Initialization**: Extract hotel_id, room_number, and session_id from QR code
2. **Hotel Context**: Load hotel-specific knowledge and branding
3. **Room Context**: Load room-specific information and services
4. **Personalized Chat**: Provide contextual assistance based on hotel and room

## 🛠️ Implementation Steps

### 1. Botpress Bot Creation
- Create a new bot in Botpress Cloud
- Configure webhook endpoints for session management
- Set up variables for hotel and room context

### 2. Database Integration
- Connect to Supabase for hotel/room data
- Create API endpoints for knowledge retrieval
- Implement session management

### 3. Knowledge Base Structure
- Hotel-specific information (services, amenities, policies)
- Room-specific details (features, instructions, local info)
- Universal hospitality knowledge

### 4. Conversation Flow
- Welcome message with hotel branding
- Context-aware responses
- Room service integration
- Local recommendations

## 📁 File Structure
```
botpress-hotel-bot/
├── bot.definition.ts
├── src/
│   ├── hooks/
│   │   ├── session-init.ts
│   │   └── context-loader.ts
│   ├── actions/
│   │   ├── load-hotel-data.ts
│   │   ├── load-room-data.ts
│   │   └── supabase-client.ts
│   ├── knowledge/
│   │   ├── hotels/
│   │   │   ├── villa-lasala.md
│   │   │   └── sample-hotel.md
│   │   ├── rooms/
│   │   │   └── room-types.md
│   │   └── general/
│   │       └── hospitality.md
│   └── flows/
│       ├── welcome.ts
│       ├── room-service.ts
│       └── concierge.ts
└── package.json
```
