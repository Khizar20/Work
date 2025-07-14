-- Check bucket configuration and storage objects
-- Run this in Supabase SQL Editor

-- Check bucket configuration
SELECT 
    'Bucket Configuration:' as info;

SELECT 
    name,
    public,
    created_at
FROM storage.buckets 
WHERE name = 'hotel_documents';

-- Check actual storage objects
SELECT 
    'Storage Objects in hotel_documents:' as info;

SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'hotel_documents'
ORDER BY created_at DESC
LIMIT 10;

-- Check storage policies
SELECT 
    'Storage Policies:' as info;

SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname ILIKE '%hotel%'
ORDER BY policyname;
