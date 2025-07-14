-- Test query to check hotel assignment data
-- Run this in your Supabase SQL Editor to verify the data

-- 1. Check if user exists in profiles table
SELECT 'Profiles table check:' as check_type, * FROM profiles LIMIT 5;

-- 2. Check if hotel_admins table exists and has data
SELECT 'Hotel admins table check:' as check_type, * FROM hotel_admins LIMIT 5;

-- 3. Check if hotels table exists and has data  
SELECT 'Hotels table check:' as check_type, * FROM hotels LIMIT 5;

-- 4. Check the JOIN between profiles, hotel_admins, and hotels
SELECT 
  'Full JOIN check:' as check_type,
  p.id as profile_id,
  p.name as profile_name,
  p.user_id,
  ha.id as admin_id,
  ha.hotel_id,
  ha.role as admin_role,
  h.name as hotel_name,
  h.city as hotel_city
FROM profiles p
LEFT JOIN hotel_admins ha ON p.user_id = ha.user_id  
LEFT JOIN hotels h ON ha.hotel_id = h.id
LIMIT 5;

-- 5. Check specifically for the current user (replace USER_ID with actual user ID)
-- SELECT 
--   p.*,
--   ha.*,
--   h.*
-- FROM profiles p
-- LEFT JOIN hotel_admins ha ON p.user_id = ha.user_id
-- LEFT JOIN hotels h ON ha.hotel_id = h.id  
-- WHERE p.user_id = 'YOUR_USER_ID_HERE';
