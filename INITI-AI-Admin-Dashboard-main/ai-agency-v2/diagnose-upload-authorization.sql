-- =============================================
-- Diagnostic Script for Document Upload Authorization Issues
-- =============================================
-- Run this in Supabase SQL Editor while logged in as a user to diagnose upload issues

-- 1. Check current user authentication status
SELECT 
  'Authentication Status:' as check_type,
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated'
    ELSE 'Not Authenticated'
  END as auth_status;

-- 2. Check if user exists in profiles table
SELECT 
  'Profile Status:' as check_type,
  p.id,
  p.user_id,
  p.name,
  p.created_at
FROM profiles p
WHERE p.user_id = auth.uid();

-- 3. Check if user is a hotel admin
SELECT 
  'Hotel Admin Status:' as check_type,
  ha.id as admin_id,
  ha.hotel_id,
  ha.user_id,
  ha.role as admin_role,
  ha.created_at
FROM hotel_admins ha
WHERE ha.user_id = auth.uid();

-- 4. Check hotel information for the user
SELECT 
  'Hotel Information:' as check_type,
  h.id as hotel_id,
  h.name as hotel_name,
  h.is_active,
  ha.role as user_role_in_hotel
FROM hotel_admins ha
JOIN hotels h ON ha.hotel_id = h.id
WHERE ha.user_id = auth.uid();

-- 5. Check storage bucket configuration
SELECT 
  'Storage Bucket Config:' as check_type,
  id as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('hotel_documents', 'avatars');

-- 6. Check storage RLS policies
SELECT 
  'Storage RLS Policies:' as check_type,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as permission_type,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname ILIKE '%hotel%' OR policyname ILIKE '%document%')
ORDER BY policyname, cmd;

-- 7. Test if user can upload to hotel_documents bucket (simulation)
SELECT 
  'Upload Permission Test:' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM hotel_admins 
      WHERE user_id = auth.uid()
    ) THEN 'ALLOWED - User is hotel admin'
    ELSE 'DENIED - User is not hotel admin'
  END as upload_permission,
  (SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid() LIMIT 1) as target_hotel_folder;

-- 8. Test file path that would be used
SELECT 
  'File Path Test:' as check_type,
  CONCAT('hotel-', (SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid() LIMIT 1), '/test-file.pdf') as example_file_path,
  CASE 
    WHEN (SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid() LIMIT 1) IS NOT NULL 
    THEN 'Valid path structure'
    ELSE 'Invalid - no hotel_id found'
  END as path_status;

-- 9. Check table RLS policies for documents table
SELECT 
  'Documents Table RLS:' as check_type,
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
WHERE schemaname = 'public' 
  AND tablename = 'documents'
ORDER BY policyname, cmd;

-- 10. Final recommendation
SELECT 
  'Diagnostic Summary:' as check_type,
  CASE 
    WHEN auth.uid() IS NULL THEN 'ERROR: User not authenticated'
    WHEN NOT EXISTS (SELECT 1 FROM hotel_admins WHERE user_id = auth.uid()) 
      THEN 'ERROR: User is not a hotel admin - need to run hotel assignment script'    WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'hotel_documents')
      THEN 'ERROR: hotel_documents bucket does not exist'
    WHEN (SELECT public FROM storage.buckets WHERE id = 'hotel_documents') = true
      THEN 'WARNING: hotel_documents bucket is public (should be private)'
    ELSE 'OK: Basic setup appears correct - check RLS policies'
  END as status,
  
  CASE 
    WHEN auth.uid() IS NULL THEN 'Login to the application first'
    WHEN NOT EXISTS (SELECT 1 FROM hotel_admins WHERE user_id = auth.uid()) 
      THEN 'Run setup-auto-user-assignment.sql or fix-hotel-relationship.sql'    WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'hotel_documents')
      THEN 'Run fix-storage-bucket-rls.sql'
    WHEN (SELECT public FROM storage.buckets WHERE id = 'hotel_documents') = true
      THEN 'Update bucket to be private'
    ELSE 'Check storage RLS policies in detail'
  END as recommendation;
