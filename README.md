# 🏨 INITI AI - Multi-Hotel Intelligent Assistant Platform

A comprehensive enterprise-grade hotel management and AI assistance platform that combines an admin dashboard with intelligent chatbot services for multiple hotels.

## 🚀 System Overview

This platform consists of two main applications:

1. **Admin Dashboard** (`INITI-AI-Admin-Dashboard-main`) - Hotel management interface
2. **Client Landing Pages** (`INITI-AI-Client-Side-site-main`) - Guest-facing AI chat interface

### Key Features

- 🏨 **Multi-Hotel Support** - Manage multiple hotel properties from a single platform
- 🤖 **AI-Powered Chat Assistant** - Botpress-integrated chatbot for guest services
- 📄 **Document Management** - Upload, search, and manage hotel documents with AI embeddings
- 🛏️ **Room Management** - QR code-based room service integration
- 👥 **Guest Management** - Track guest interactions and service requests
- 🔒 **Secure Authentication** - Supabase-powered authentication with role-based access
- 📊 **Analytics & Metrics** - Track chatbot performance and guest satisfaction

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Admin Dashboard   │    │  Client Landing     │    │   Botpress Cloud   │
│   (Next.js 15)     │◄──►│   (Next.js 15)     │◄──►│   (AI Chatbot)     │
│                     │    │                     │    │                     │
│ - Hotel Management  │    │ - Guest Interface   │    │ - Natural Language  │
│ - Document Upload   │    │ - QR Code Landing   │    │ - Document Search   │
│ - Staff Tools       │    │ - Multi-Hotel       │    │ - Service Requests  │
│ - Analytics         │    │ - Session Tracking  │    │ - Personalization   │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                        ┌─────────────────────┐
                        │   Supabase Backend  │
                        │                     │
                        │ - PostgreSQL DB     │
                        │ - Authentication    │
                        │ - File Storage      │
                        │ - Vector Embeddings │
                        │ - Row Level Security│
                        └─────────────────────┘
```

## 📁 Project Structure

```
Whole Project/
├── INITI-AI-Admin-Dashboard-main/          # Admin dashboard application
│   └── ai-agency-v2/
│       ├── app/                            # Next.js app directory
│       │   ├── api/                        # API routes
│       │   │   ├── search-documents/       # Document search with embeddings
│       │   │   ├── upload/                 # Document upload handling
│       │   │   ├── guests/                 # Guest management
│       │   │   ├── rooms/                  # Room management
│       │   │   └── ...                     # Other API endpoints
│       │   ├── components/                 # React components
│       │   ├── dashboard/                  # Main dashboard page
│       │   ├── documents-library/          # Document management UI
│       │   ├── guest-management/           # Guest management UI
│       │   ├── hotel-management/           # Hotel management UI
│       │   └── upload-center/              # Document upload UI
│       ├── components/ui/                  # Reusable UI components
│       ├── lib/                           # Utility libraries
│       └── migrations/                    # Database migrations
├── INITI-AI-Client-Side-site-main/         # Client-facing application
│   └── src/
│       ├── app/                           # Next.js app directory
│       │   ├── api/                       # Session tracking APIs
│       │   ├── chat/                      # Main chat interface
│       │   ├── hotels/[hotelSlug]/        # Hotel-specific pages
│       │   └── ...                        # Other pages
│       ├── components/                    # React components
│       │   ├── BotpressWebChat.tsx        # Chatbot integration
│       │   ├── UniversalHotelChat.tsx     # Multi-hotel chat handler
│       │   └── ...                        # Other components
│       ├── config/                        # Configuration files
│       │   ├── hotels.ts                  # Hotel configurations
│       │   └── multi-hotel-config.ts      # Multi-hotel setup
│       ├── contexts/                      # React contexts
│       └── utils/                         # Utility functions
└── Botpress Integration Files/            # Botpress workflow scripts
    ├── botpress-fixed-document-search.js  # Main search implementation
    ├── botpress-direct-supabase-search.js # Alternative search method
    └── test-*.js                         # Testing scripts
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Icons**: Heroicons, Lucide React

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Vector Search**: pgvector with embeddings

### AI & ML
- **Chatbot**: Botpress Cloud
- **Embeddings**: @xenova/transformers (local generation)
- **Model**: all-MiniLM-L6-v2
- **Document Processing**: PDF parsing with AI chunking

### Deployment
- **Frontend**: Vercel
- **Database**: Supabase Cloud
- **Chatbot**: Botpress Cloud

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Botpress Cloud account

### 1. Environment Setup

Create `.env.local` in both applications:

**Admin Dashboard:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Client Application:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BOTPRESS_BOT_ID=your-bot-id
NEXT_PUBLIC_BOTPRESS_PUBLIC_KEY=your-public-key
```

### 2. Database Setup

Run the migration scripts in the admin dashboard:

```bash
cd INITI-AI-Admin-Dashboard-main/ai-agency-v2
# Execute SQL files in migrations/ folder in Supabase SQL editor
```

### 3. Install Dependencies & Run

**Admin Dashboard:**
```bash
cd INITI-AI-Admin-Dashboard-main/ai-agency-v2
npm install
npm run dev
# Access at http://localhost:3000
```

**Client Application:**
```bash
cd INITI-AI-Client-Side-site-main
npm install
npm run dev
# Access at http://localhost:3001
```

### 4. Botpress Setup

1. Create bot in [Botpress Cloud](https://siderite.botpress.app/)
2. Configure domain whitelist with your URLs
3. Copy bot credentials to environment variables
4. Upload the workflow code from `botpress-fixed-document-search.js`

## 🏨 How It Works

### Guest Experience Flow

1. **QR Code Scan** - Guest scans QR code in hotel room
2. **Landing Page** - Redirected to hotel-specific landing page with session data
3. **AI Chat** - Botpress chatbot loads with hotel and room context
4. **Personalized Service** - AI provides contextual assistance based on:
   - Hotel-specific information
   - Room number and type
   - Available services
   - Document knowledge base

### Admin Workflow

1. **Document Upload** - Hotel staff upload policies, menus, guides
2. **AI Processing** - Documents are parsed and embedded for search
3. **Guest Management** - Track guest interactions and requests
4. **Analytics** - Monitor chatbot performance and guest satisfaction

### QR Code Integration

Each hotel room has a unique QR code with this structure:
```
https://your-domain.com/hotels/villa-lasala?hotel_id=villa-lasala&room_number=101&session_id=uuid
```

## 📊 Key Features

### Document Management & AI Search
- **Smart Upload**: Automatic PDF processing with AI chunking
- **Vector Embeddings**: Local generation using @xenova/transformers
- **Semantic Search**: Find relevant information using natural language
- **Multi-format Support**: PDFs, images, and text documents

### Multi-Hotel Architecture
- **Centralized Management**: Single dashboard for multiple properties
- **Hotel-specific Branding**: Customizable themes and configurations
- **Isolated Data**: Row-level security ensures data separation
- **Scalable Design**: Easy addition of new hotel properties

### Guest Services Integration
- **Room Service**: Direct integration with hotel service systems
- **Concierge Services**: AI-powered recommendations and bookings
- **Information Desk**: Instant access to hotel policies and information
- **Multilingual Support**: Automatic language detection and response

## 🔧 Configuration

### Adding a New Hotel

1. **Database Setup**: Add hotel record to `hotels` table
2. **Configuration**: Add hotel config to `hotels.ts`
3. **Landing Page**: Create hotel-specific page in `hotels/[hotelSlug]`
4. **QR Codes**: Generate room-specific QR codes
5. **Document Upload**: Add hotel-specific documents and knowledge base

### Customizing AI Responses

Edit the Botpress workflow files:
- `botpress-fixed-document-search.js` - Main search logic
- Adjust `match_threshold` for search sensitivity
- Customize response templates for different confidence levels

## 📈 Analytics & Monitoring

### Built-in Analytics
- **Session Tracking**: Every guest interaction is logged
- **Chat Metrics**: Response times, satisfaction scores
- **Document Usage**: Most searched content and documents
- **Performance Monitoring**: API response times and error rates

### Available Dashboards
- **Guest Management**: Track guest interactions and requests
- **Chatbot Metrics**: Performance and usage statistics
- **Document Analytics**: Search patterns and content effectiveness
- **Hotel Performance**: Per-property metrics and comparisons

## 🔒 Security Features

### Data Protection
- **Row Level Security (RLS)**: Database-level access control
- **Hotel Data Isolation**: Strict separation of hotel data
- **Secure Authentication**: Supabase Auth with role-based access
- **API Security**: Rate limiting and input validation

### Privacy Compliance
- **Session Management**: Temporary session data storage
- **GDPR Ready**: Data deletion and privacy controls
- **Audit Logging**: Complete interaction history
- **Secure File Storage**: Encrypted document storage

## 🚀 Deployment

### Production Deployment

**Admin Dashboard:**
```bash
cd INITI-AI-Admin-Dashboard-main/ai-agency-v2
npm run build
# Deploy to Vercel or your preferred platform
```

**Client Application:**
```bash
cd INITI-AI-Client-Side-site-main
npm run build
# Deploy to Vercel or your preferred platform
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- Botpress bot configuration
- Any API keys for external services

## 🧪 Testing

### Testing Scripts Available

- `test-botpress-embeddings.js` - Test complete AI search workflow
- `test-document-search-integration.js` - Test document search API
- `test-guest-management.js` - Test guest management features
- Various other test scripts for specific components

### Running Tests

```bash
# Test the complete system
node test-botpress-embeddings.js

# Test specific components
node test-document-search-integration.js
```

## 📚 Documentation

### Additional Guides
- `BOTPRESS-EMBEDDINGS-SOLUTION-GUIDE.md` - AI search implementation
- `RAG-IMPLEMENTATION-GUIDE.md` - Retrieval-augmented generation setup
- `SUPABASE-INTEGRATION-SUMMARY.md` - Database setup and configuration
- `GUEST-MANAGEMENT-SETUP.md` - Guest management system setup

### API Documentation
- `/api/search-documents` - Document search with AI embeddings
- `/api/upload` - Document upload and processing
- `/api/guests` - Guest management endpoints
- `/api/rooms` - Room management and QR code generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:

1. Check the troubleshooting guides in the documentation
2. Review the test scripts for debugging
3. Check browser console and network tabs for errors
4. Verify Supabase and Botpress configurations

## 📄 License

This project is proprietary software developed for INITI AI hotel management solutions.

---

## 🎯 Key Benefits

- **Reduced Staff Workload**: AI handles routine guest inquiries
- **24/7 Availability**: Guests get instant responses anytime
- **Consistent Service**: Standardized information across all properties
- **Scalable Solution**: Easy expansion to new hotels and services
- **Data-Driven Insights**: Analytics to improve guest experience
- **Cost Effective**: Reduce operational costs while improving service quality

## 🏆 Success Metrics

- **Guest Satisfaction**: Improved response times and service quality
- **Operational Efficiency**: Reduced staff workload for routine inquiries
- **Revenue Growth**: Better guest experience leading to increased bookings
- **Scalability**: Seamless addition of new hotel properties
- **Knowledge Management**: Centralized, searchable hotel information

This platform represents the future of hotel guest services, combining AI technology with practical hospitality solutions to create exceptional guest experiences while streamlining hotel operations.
