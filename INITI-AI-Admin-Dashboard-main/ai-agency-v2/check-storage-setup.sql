-- Test storage bucket access
-- Run this in Supabase SQL Editor to check current state

-- Check if bucket exists
SELECT 
    'Checking storage buckets...' as status;

SELECT 
    name,
    id,
    created_at,
    updated_at,
    public
FROM storage.buckets 
WHERE name = 'hotel_documents';

-- Check storage policies
SELECT 
    'Storage policies for hotel_documents:' as status;

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%hotel%';

-- Check if any files exist in the bucket
SELECT 
    'Files in hotel_documents bucket:' as status;

SELECT 
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'hotel_documents'
LIMIT 5;
