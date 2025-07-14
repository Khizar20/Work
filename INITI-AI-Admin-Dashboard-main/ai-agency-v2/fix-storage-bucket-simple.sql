-- =============================================
-- Simplified Storage Bucket Fix (User-Safe Version)
-- =============================================
-- Run this script in your Supabase SQL Editor
-- This version avoids operations that require table ownership

-- 1. Ensure the hotel_documents bucket exists with correct configuration
-- Note: You may need to create the bucket manually in Supabase Dashboard if this fails
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'hotel_documents', 
  'hotel_documents', 
  false,
  ARRAY[
    'application/pdf',
    'image/png', 
    'image/jpeg', 
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  10485760 -- 10MB limit
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    file_size_limit = EXCLUDED.file_size_limit;

-- 2. Verify bucket configuration
SELECT 
  'Bucket Configuration:' as check_type,
  id as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('hotel_documents', 'avatars');

-- 3. Check current user and hotel admin status
SELECT 
  'User and Hotel Admin Status:' as check_type,
  auth.uid() as current_user_id,
  (SELECT COUNT(*) FROM hotel_admins WHERE user_id = auth.uid()) as is_hotel_admin,
  (SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid() LIMIT 1) as hotel_id
WHERE auth.uid() IS NOT NULL;

-- 4. Verify if user has any hotel_admin record
SELECT 
  'Hotel Admin Details:' as check_type,
  ha.id as admin_id,
  ha.hotel_id,
  ha.user_id,
  ha.role,
  h.name as hotel_name
FROM hotel_admins ha
LEFT JOIN hotels h ON ha.hotel_id = h.id
WHERE ha.user_id = auth.uid();

-- 5. Check if there are any existing storage policies (for reference)
SELECT 
  'Existing Storage Policies:' as check_type,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as permission_type
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname ILIKE '%hotel%' OR policyname ILIKE '%document%')
ORDER BY policyname, cmd;
