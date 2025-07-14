# Hotel Admin Dashboard with Supabase Integration

This Next.js 14+ dashboard integrates with a Supabase PostgreSQL database to provide document management capabilities for hotel administrators.

## Project Structure

### Core Features

1. **Authentication**
   - Uses Supabase Auth for user authentication
   - Hotel admin users can only access their specific hotel data
   - Route protection via middleware

2. **Document Management**
   - Upload documents to Supabase Storage
   - View, list, and delete documents
   - Filter by document type and search functionality
   - Hotel-specific document scoping

3. **Development Tools**
   - Database seeding for testing
   - Diagnostics page to verify connectivity

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Environment Setup

1. Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

1. Use the Supabase SQL editor to create the necessary tables. The schema should include:

```sql
-- Create hotels table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  vector_doc_count INTEGER DEFAULT 0,
  trained_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotel_admins table
CREATE TABLE hotel_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_hotel UNIQUE(user_id, hotel_id)
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  uploaded_by UUID NOT NULL REFERENCES hotel_admins(id),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Create the hotel-documents storage bucket in Supabase Storage.

### Row-Level Security (RLS) Setup

This project includes an automated setup script to create the necessary tables, storage buckets, and Row Level Security policies. Run the script with:

```bash
# First, install required dependencies
npm install dotenv @supabase/supabase-js

# Create a .env file with your Supabase credentials
echo "SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >> .env

# Run the setup script
node scripts/setup-supabase.js
```

The script will:
1. Create all necessary database tables if they don't exist
2. Create and configure the `hotel-documents` storage bucket
3. Set up Row Level Security (RLS) policies for both tables and storage

This ensures hotel admins can only access their own hotel's data and files.

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. The application will be available at http://localhost:3000

### Seeding Test Data

Use the `/dev-tools/db-seed` page to create a hotel and associate it with your admin user account. This tool can also seed sample guests, FAQs, room service items, and local events.

### Testing Functionality

1. Visit the `/dev-tools/diagnostics` page to verify the Supabase connection is working properly.
2. Test document upload and management by using the diagnostics page and the Documents Library.

## Additional Information

- The dashboard uses a typed Supabase client to ensure type safety when working with the database.
- All document operations are scoped to the current user's hotel, enforced both in the application code and at the database level through RLS policies.
- The middleware ensures that authenticated users can only access their authorized routes.

## Developer Tools

The application includes several developer tools to help with development, testing, and troubleshooting:

1. **Diagnostics Page** (`/dev-tools/diagnostics`)
   - Tests Supabase connection status
   - Verifies authentication and hotel association
   - Tests document upload functionality

2. **Storage Explorer** (`/dev-tools/storage-explorer`)
   - Browse Supabase Storage buckets and files
   - View file metadata and contents
   - Helps diagnose storage issues

3. **Database Seeding** (`/dev-tools/db-seed`)
   - Create a hotel and associate it with admin user
   - Seed test data including guests, FAQs, etc.
   - Useful for setting up test environments quickly

## Troubleshooting

If you encounter issues:

1. Check the browser console for any errors
2. Verify your environment variables are correctly set
3. Use the diagnostics page to check connection status
4. Ensure your Supabase user has an associated hotel_admin record
5. Verify the Storage bucket permissions are configured correctly
6. Check RLS policies for documents table

For connection problems, the application includes a connection indicator in the dashboard header showing the current Supabase connection status.
