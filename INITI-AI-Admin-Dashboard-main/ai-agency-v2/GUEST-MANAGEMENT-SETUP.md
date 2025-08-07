# Guest Management System Setup Guide

## Overview
This guide will help you set up a comprehensive guest management system for the Hospitality AI Admin Dashboard. The system allows hotel administrators to add, edit, delete, and search guest information with a simplified schema.

## Database Schema

### Actual Guests Table Structure
The guests table has the following fields:

```sql
-- Core fields
id: UUID (Primary Key, auto-generated)
hotel_id: UUID (Foreign Key to hotels table)
created_at: TIMESTAMPTZ (Default: now())

-- Guest information fields
name: TEXT (Required - Full name of the guest)
email: TEXT (Optional)
first_name: VARCHAR (Optional)
last_name: VARCHAR (Optional)
phone: VARCHAR (Optional)
nationality: VARCHAR (Optional)
address: TEXT (Optional)
city: VARCHAR (Optional)
state: VARCHAR (Optional)
country: VARCHAR (Optional)
room_number: VARCHAR (Optional)
hotel_name: VARCHAR (Optional)
updated_at: TIMESTAMPTZ (Default: now())
```

## Setup Instructions

### 1. Apply Database Schema
Run the SQL script to enhance the guests table:

```bash
# Navigate to your Supabase dashboard
# Go to SQL Editor
# Run the contents of enhance-guests-table.sql
```

### 2. API Endpoints Created

#### GET /api/guests
- **Purpose**: Fetch all guests with pagination and search
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term for name, email, or room number

#### POST /api/guests
- **Purpose**: Create a new guest
- **Required Fields**: `name` (full name)
- **Optional Fields**: `first_name`, `last_name`, `email`, `phone`, `nationality`, `address`, `city`, `state`, `country`, `room_number`

#### GET /api/guests/[id]
- **Purpose**: Get a specific guest by ID

#### PUT /api/guests/[id]
- **Purpose**: Update a guest's information

#### DELETE /api/guests/[id]
- **Purpose**: Delete a guest

### 3. Admin Interface Features

#### Guest Management Page (`/guest-management`)
- **Add New Guest**: Modal form with all guest fields
- **Edit Guest**: Update existing guest information
- **Delete Guest**: Remove guest with confirmation
- **Search**: Real-time search by name, email, or room number
- **Pagination**: Navigate through large guest lists
- **Responsive Design**: Works on desktop and mobile

#### Form Fields
- **Full Name** (Required): Guest's complete name
- **First Name** (Optional): Guest's first name
- **Last Name** (Optional): Guest's last name
- **Room Number** (Optional): Assigned room number
- **Email** (Optional): Contact email address
- **Phone** (Optional): Contact phone number
- **Nationality** (Optional): Guest's nationality
- **Address** (Optional): Full address
- **City** (Optional): City name
- **State/Province** (Optional): State or province
- **Country** (Optional): Country name

### 4. Security Features

#### Row Level Security (RLS)
- Hotel admins can only access guests from their assigned hotel
- Automatic hotel_id assignment based on admin's hotel
- Secure API endpoints with authentication

#### Data Validation
- Required field validation (name is required)
- Email format validation
- Phone number validation

### 5. Testing the System

#### Run the Test Script
```bash
node test-guest-management.js
```

This will test:
- Guest creation
- Guest retrieval
- Guest updates
- Guest statistics
- Guest deletion

#### Manual Testing
1. Navigate to `/guest-management` in the admin dashboard
2. Try adding a new guest with all fields
3. Search for the guest
4. Edit the guest's information
5. Delete the guest

### 6. Integration with Existing System

#### Sidebar Navigation
The guest management link has been added to the sidebar navigation:
- **Location**: Between Documents and Room Management
- **Icon**: Users icon
- **Route**: `/guest-management`

#### Database Views
- `guest_details`: View with hotel information
- `get_guest_statistics`: Function for guest analytics

### 7. Features Included

#### ✅ Completed Features
- [x] Enhanced database schema
- [x] CRUD API endpoints
- [x] Admin interface with forms
- [x] Search and pagination
- [x] Row Level Security
- [x] Data validation
- [x] Responsive design
- [x] Error handling
- [x] Success notifications
- [x] Test script

#### 🔄 Future Enhancements
- [ ] Guest photo upload
- [ ] Guest preferences tracking
- [ ] Check-in/check-out dates
- [ ] Guest history
- [ ] Bulk import/export
- [ ] Guest analytics dashboard
- [ ] Integration with booking system

### 8. Troubleshooting

#### Common Issues

**1. "Admin not found" error**
- Ensure the user is properly assigned to a hotel in the `hotel_admins` table
- Check that the hotel_id exists in the `hotels` table

**2. "Missing required field: name" error**
- The guest's full name is required
- Make sure to fill in the "Full Name" field

**3. Database connection errors**
- Verify Supabase credentials in environment variables
- Check network connectivity

**4. Form validation errors**
- Ensure the "Full Name" field is filled
- Check email format
- Verify phone number format

### 9. Environment Variables

Ensure these environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 10. File Structure

```
app/
├── api/
│   └── guests/
│       ├── route.ts              # Main CRUD endpoints
│       └── [id]/
│           └── route.ts          # Individual guest operations
├── guest-management/
│   └── page.tsx                 # Guest management interface
└── components/
    └── Sidebar.tsx              # Updated with guest management link

utils/
└── database.types.ts            # Updated with new guest schema
```

## Usage Examples

### Adding a New Guest
1. Click "Add Guest" button
2. Fill in the required "Full Name" field
3. Add optional information (email, phone, address, etc.)
4. Click "Add Guest" to save

### Searching Guests
1. Use the search bar to find guests by:
   - Full name
   - Email address
   - Room number

### Editing a Guest
1. Click the edit button (pencil icon) next to any guest
2. Modify the information in the form
3. Click "Update Guest" to save changes

### Deleting a Guest
1. Click the delete button (trash icon) next to any guest
2. Confirm the deletion in the popup
3. The guest will be permanently removed

## Key Features

### Automatic Data Population
- **hotel_id**: Automatically fetched from the current admin's hotel
- **hotel_name**: Automatically fetched from the current admin's hotel
- **id**: Automatically generated UUID for each guest
- **created_at**: Automatically set to current timestamp
- **updated_at**: Automatically updated when guest is modified

### Form Validation
- Full name is required
- Email format validation (if provided)
- Phone number validation (if provided)

### Search Functionality
- Search by guest name (full name, first name, or last name)
- Search by email address
- Search by room number

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test script output
3. Check browser console for errors
4. Verify database permissions and RLS policies

---

**Note**: This guest management system is designed to be simple yet comprehensive, focusing on the essential guest information needed for hotel operations. The schema matches your actual database structure and automatically handles hotel assignment and ID generation. 