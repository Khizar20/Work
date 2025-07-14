# 🚀 Deploy Rooms and Chatbot Database Setup

## Step 1: Deploy Database Script

1. **Open Supabase Dashboard**: Go to your Supabase project
2. **Go to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Create New Query**: Click "New Query"
4. **Copy the Script**: Copy the entire contents of `setup-rooms-and-chatbot-relationships.sql`
5. **Paste and Run**: Paste the script and click "Run"

## Step 2: Verify Deployment

After running the script, you should see:

```
✅ Rooms table created
✅ Sample rooms inserted for existing hotels
✅ Chatbot relationships established
✅ RLS policies applied
✅ Database function created: get_room_chatbot_metrics()
```

## Step 3: Test the Function

Run this query in Supabase SQL Editor to test:

```sql
-- Test the new function
SELECT * FROM get_room_chatbot_metrics();
```

Expected result:
```
total_rooms | active_room_chat_sessions | chat_sessions_today | service_requests_from_bot
------------|---------------------------|---------------------|-------------------------
     12     |           0               |          0          |           0
```

## Step 4: Verify Dashboard Integration

After deployment:
1. Refresh your dashboard at `localhost:3000/dashboard`
2. The "Total Rooms" card should show the real count from your database
3. Check browser console - should see: `✅ Real chatbot dashboard metrics loaded`

## What Gets Created:

### Tables:
- `rooms` - Hotel room inventory with details
- Updated `chatbot_sessions` - Links to specific rooms
- Updated `room_service_orders` - Tracks chatbot vs manual requests

### Function:
- `get_room_chatbot_metrics()` - Returns real-time metrics for dashboard

### Sample Data:
- 12 rooms per hotel (Standard, Deluxe, Suite, Executive, Presidential)
- Different room statuses (available, occupied, cleaning)
- Amenities and pricing information
