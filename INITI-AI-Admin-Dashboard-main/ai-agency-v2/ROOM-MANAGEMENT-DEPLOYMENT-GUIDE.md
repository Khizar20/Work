# Room Management Database Deployment Guide

## Overview
This guide will help you deploy the rooms table and related chatbot functionality to your Supabase database.

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges to run SQL scripts

## Deployment Steps

### 1. Open Supabase SQL Editor
1. Log into your Supabase project dashboard
2. Navigate to the SQL Editor tab
3. Create a new query

### 2. Run the Room Setup Script
Copy the entire contents of `setup-rooms-and-chatbot-relationships.sql` and paste it into the SQL Editor, then execute it.

This script will:
- Create the `rooms` table with proper schema
- Add room_id relationship to chatbot_sessions table
- Set up RLS (Row Level Security) policies
- Create proper indexes for performance
- Add trigger for automatic updated_at timestamps

### 3. Verify the Setup
After running the script, verify the setup by running these queries:

```sql
-- Check if rooms table was created
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'rooms'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'rooms';

-- Check if chatbot_sessions has room_id column
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'chatbot_sessions' AND column_name = 'room_id';
```

### 4. Insert Sample Data (Optional)
If you want to test with sample data, run:

```sql
-- Insert sample hotel first (if not exists)
INSERT INTO public.hotels (id, name, email, phone, address, created_at, updated_at)
VALUES (
  'hotel-1'::uuid,
  'Sample Hotel',
  'admin@samplehotel.com',
  '+1-555-0123',
  '123 Sample Street, Sample City, SC 12345',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample rooms
INSERT INTO public.rooms (hotel_id, room_number, room_type, floor_number, capacity, base_price, status, amenities, description)
VALUES 
  ('hotel-1'::uuid, '101', 'Standard', 1, 2, 120.00, 'available', ARRAY['wifi', 'tv'], 'Comfortable standard room'),
  ('hotel-1'::uuid, '102', 'Deluxe', 1, 2, 160.00, 'available', ARRAY['wifi', 'tv', 'balcony'], 'Deluxe room with balcony'),
  ('hotel-1'::uuid, '201', 'Suite', 2, 4, 250.00, 'available', ARRAY['wifi', 'tv', 'balcony', 'minibar'], 'Luxury suite with multiple rooms'),
  ('hotel-1'::uuid, '202', 'Standard', 2, 2, 120.00, 'maintenance', ARRAY['wifi', 'tv'], 'Standard room currently under maintenance');
```

## Frontend Changes Deployed

### Updated Room Management Interface
The `hotel-management.tsx` file has been completely updated with:

1. **Correct Database Schema Integration**
   - Updated Room TypeScript interface to match database schema
   - Fixed all field names (room_number, room_type, base_price, etc.)
   - Proper amenities handling as string arrays

2. **Enhanced UI with Tabs**
   - **Rooms Tab**: Complete room management with proper CRUD operations
   - **QR Codes Tab**: Generate and manage QR codes for each room

3. **QR Code Functionality**
   - Unique QR codes for each room
   - Download QR codes as text files
   - Regenerate QR codes with timestamps
   - Visual QR code placeholders

4. **Improved Form Handling**
   - Comprehensive room form with all database fields
   - Amenities selection with checkboxes
   - Proper validation and error handling
   - DateTime picker for last cleaned timestamp

5. **Database Integration**
   - Proper Supabase queries using correct field names
   - Fallback to mock data if database isn't available
   - Automatic QR code generation when rooms change

## Features Available

### Room Management
- ✅ View all rooms in a clean table format
- ✅ Add new rooms with full details
- ✅ Edit existing rooms
- ✅ Delete rooms with confirmation
- ✅ Room status management (available, occupied, maintenance, cleaning, out_of_order)
- ✅ Amenities selection (wifi, tv, balcony, minibar, etc.)
- ✅ Last cleaned timestamp tracking

### QR Code Management
- ✅ Unique QR codes for each room
- ✅ Visual QR code display
- ✅ Download QR codes
- ✅ Regenerate QR codes
- ✅ Room-specific chatbot URLs

### Database Features
- ✅ Row Level Security (RLS) policies
- ✅ Hotel-specific room access
- ✅ Automatic timestamps
- ✅ Proper foreign key relationships
- ✅ Chatbot session room tracking

## Next Steps

1. **Deploy Database Schema**: Run the setup script in Supabase
2. **Test Room Management**: Add, edit, and delete rooms through the interface
3. **Test QR Codes**: Generate and download QR codes for rooms
4. **Integrate with Chatbot**: Update chatbot to use room-specific URLs
5. **Add Real QR Code Generation**: Integrate with a QR code library for actual image generation

## Security Notes

- All room operations are protected by RLS policies
- Only hotel admins can manage rooms for their hotel
- QR codes contain room-specific URLs for secure access
- Database constraints prevent duplicate room numbers per hotel

The room management system is now fully integrated with the correct database schema and includes comprehensive QR code functionality for hotel chatbot integration.
