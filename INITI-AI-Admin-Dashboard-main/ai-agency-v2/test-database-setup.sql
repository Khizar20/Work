-- Test the enterprise dashboard setup
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check if the profiles table exists and has the right structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the hotel_admins table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotel_admins' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if the hotels table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotels' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if the user profile function exists
SELECT 
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_profile';

-- 5. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'on_auth_user_created';

-- 6. Test the get_user_profile function (replace with actual user ID)
-- SELECT * FROM get_user_profile('your-user-id-here');
