-- =====================================================
-- ALTERNATIVE: Direct Room Count Queries
-- Use these if you prefer direct queries over the database function
-- =====================================================

-- 1. Get total room count for current user's hotel
SELECT COUNT(*) as total_rooms
FROM public.rooms r
JOIN public.hotel_admins ha ON r.hotel_id = ha.hotel_id
WHERE ha.user_id = auth.uid()
AND r.is_active = true;

-- 2. Get detailed room breakdown by status
SELECT 
  r.status,
  COUNT(*) as room_count
FROM public.rooms r
JOIN public.hotel_admins ha ON r.hotel_id = ha.hotel_id
WHERE ha.user_id = auth.uid()
AND r.is_active = true
GROUP BY r.status
ORDER BY r.status;

-- 3. Get room breakdown by type
SELECT 
  r.room_type,
  COUNT(*) as room_count,
  AVG(r.base_price) as avg_price
FROM public.rooms r
JOIN public.hotel_admins ha ON r.hotel_id = ha.hotel_id
WHERE ha.user_id = auth.uid()
AND r.is_active = true
GROUP BY r.room_type
ORDER BY room_count DESC;

-- 4. Complete hotel dashboard summary
SELECT 
  h.name as hotel_name,
  COUNT(r.id) as total_rooms,
  COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms,
  COUNT(CASE WHEN r.status = 'occupied' THEN 1 END) as occupied_rooms,
  COUNT(CASE WHEN r.status = 'cleaning' THEN 1 END) as cleaning_rooms,
  COUNT(CASE WHEN r.status = 'maintenance' THEN 1 END) as maintenance_rooms
FROM public.hotels h
JOIN public.hotel_admins ha ON h.id = ha.hotel_id
LEFT JOIN public.rooms r ON h.id = r.hotel_id AND r.is_active = true
WHERE ha.user_id = auth.uid()
GROUP BY h.id, h.name;

-- 5. If you want to add a static total_rooms column to hotels table (NOT RECOMMENDED)
-- This approach is not recommended because it requires manual updates
-- ALTER TABLE public.hotels ADD COLUMN total_rooms INTEGER DEFAULT 0;
-- UPDATE public.hotels SET total_rooms = (
--   SELECT COUNT(*) FROM public.rooms 
--   WHERE hotel_id = hotels.id AND is_active = true
-- );
