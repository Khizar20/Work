-- Database Verification Queries
-- Run these in your Supabase SQL Editor to verify the setup

-- 1. Check if QR code columns were added successfully
SELECT 
    'hotels table structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'hotels' 
    AND table_schema = 'public'
    AND column_name IN ('base_url', 'name', 'slug');

-- 2. Check rooms table QR code columns
SELECT 
    'rooms table QR columns' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
    AND table_schema = 'public'
    AND column_name IN ('qr_code_url', 'qr_session_id', 'room_number', 'hotel_id');

-- 3. Check if functions were created
SELECT 
    'database functions' as check_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('generate_room_qr_code', 'regenerate_hotel_qr_codes', 'auto_generate_room_qr_code');

-- 4. Check if triggers were created
SELECT 
    'triggers' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name = 'trigger_auto_generate_qr_code';

-- 5. Check if view was created
SELECT 
    'views' as check_type,
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
    AND table_name = 'room_qr_codes';

-- 6. Check actual data - hotels with base_url
SELECT 
    'hotel data' as check_type,
    id,
    name,
    slug,
    base_url,
    created_at
FROM public.hotels 
LIMIT 5;

-- 7. Check actual data - rooms with QR codes
SELECT 
    'room QR data' as check_type,
    id,
    room_number,
    hotel_id,
    qr_code_url,
    qr_session_id,
    created_at
FROM public.rooms 
WHERE qr_code_url IS NOT NULL
LIMIT 5;

-- 8. Test the QR code generation function
SELECT 
    'QR function test' as check_type,
    generate_room_qr_code(
        (SELECT id FROM public.hotels LIMIT 1),
        '999',
        gen_random_uuid()
    ) as sample_qr_url;

-- 9. Check room_qr_codes view data
SELECT 
    'QR codes view' as check_type,
    room_id,
    hotel_name,
    room_number,
    qr_code_url,
    hotel_base_url
FROM room_qr_codes 
LIMIT 3;

-- 10. Count total rooms with QR codes
SELECT 
    'QR code statistics' as check_type,
    COUNT(*) as total_rooms,
    COUNT(qr_code_url) as rooms_with_qr_codes,
    COUNT(qr_session_id) as rooms_with_session_ids
FROM public.rooms;

-- 11. Check if any rooms belong to your user's hotel
-- Replace 'YOUR_USER_ID' with your actual auth user ID
/*
SELECT 
    'user hotel rooms' as check_type,
    r.room_number,
    r.qr_code_url,
    h.name as hotel_name
FROM public.rooms r
JOIN public.hotels h ON r.hotel_id = h.id
JOIN public.hotel_admins ha ON h.id = ha.hotel_id
WHERE ha.user_id = 'YOUR_USER_ID'
LIMIT 5;
*/

-- Success indicators:
-- ✅ hotels table should have base_url column
-- ✅ rooms table should have qr_code_url and qr_session_id columns  
-- ✅ Functions should be created (3 functions)
-- ✅ Trigger should be created (1 trigger)
-- ✅ View should be created (room_qr_codes)
-- ✅ Sample rooms should have QR code URLs generated
-- ✅ QR URLs should contain your base_url and proper format
