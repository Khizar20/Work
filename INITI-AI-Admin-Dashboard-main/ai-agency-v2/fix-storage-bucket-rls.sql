-- =============================================
-- Fix Storage Bucket and RLS Policies for Document Upload
-- =============================================
-- Run this script in your Supabase SQL Editor to fix the document upload authorization issue

-- 1. Ensure the hotel_documents bucket exists with correct configuration
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

-- 2. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies for hotel_documents bucket to avoid conflicts
DROP POLICY IF EXISTS "Hotel admins can upload documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can read their hotel's documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can update their hotel's documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can delete their hotel's documents." ON storage.objects;

-- Also drop any old hotel-documents policies (old naming)
DROP POLICY IF EXISTS "Hotel admins can upload documents to hotel-documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can read hotel-documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can update hotel-documents." ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can delete hotel-documents." ON storage.objects;

-- 4. Create new RLS policies for hotel_documents bucket
CREATE POLICY "Hotel admins can upload documents."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hotel_documents' AND 
    EXISTS (
      SELECT 1 FROM hotel_admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hotel admins can read their hotel's documents."
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hotel_documents' AND
    EXISTS (
      SELECT 1 FROM hotel_admins ha
      JOIN hotels h ON ha.hotel_id = h.id
      WHERE ha.user_id = auth.uid() 
      AND (
        -- Allow reading files in hotel's folder or any file if user is hotel admin
        (storage.foldername(name))[1] = h.id::text OR
        (storage.foldername(name))[1] = ha.hotel_id::text
      )
    )
  );

CREATE POLICY "Hotel admins can update their hotel's documents."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hotel_documents' AND
    EXISTS (
      SELECT 1 FROM hotel_admins ha
      JOIN hotels h ON ha.hotel_id = h.id
      WHERE ha.user_id = auth.uid() 
      AND (
        (storage.foldername(name))[1] = h.id::text OR
        (storage.foldername(name))[1] = ha.hotel_id::text
      )
    )
  );

CREATE POLICY "Hotel admins can delete their hotel's documents."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hotel_documents' AND
    EXISTS (
      SELECT 1 FROM hotel_admins ha
      JOIN hotels h ON ha.hotel_id = h.id
      WHERE ha.user_id = auth.uid() 
      AND (
        (storage.foldername(name))[1] = h.id::text OR
        (storage.foldername(name))[1] = ha.hotel_id::text
      )
    )
  );

-- 5. Ensure avatars bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing avatar policies to avoid conflicts
DROP POLICY IF EXISTS "Avatars are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;

-- Create avatar policies
CREATE POLICY "Avatars are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. Verify configuration
SELECT 
  'Bucket Configuration:' as check_type,
  id as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('hotel_documents', 'avatars');

-- 7. Verify RLS policies
SELECT 
  'Storage RLS Policies:' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%hotel%' OR policyname LIKE '%avatar%'
ORDER BY policyname;

-- 8. Test data to verify setup
SELECT 
  'User and Hotel Admin Status:' as check_type,
  auth.uid() as current_user_id,
  (SELECT COUNT(*) FROM hotel_admins WHERE user_id = auth.uid()) as is_hotel_admin,
  (SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid() LIMIT 1) as hotel_id
WHERE auth.uid() IS NOT NULL;
