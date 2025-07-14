-- Debug file paths in documents table
-- Run this in Supabase SQL Editor to see current file URLs

SELECT 
    'Current documents and their file URLs:' as debug_info;

SELECT 
    id,
    title,
    file_url,
    hotel_id,
    uploaded_by,
    created_at
FROM public.documents 
ORDER BY created_at DESC
LIMIT 5;

-- Check storage objects to see actual file names
SELECT 
    'Files in storage bucket:' as storage_info;

SELECT 
    name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'hotel_documents'
ORDER BY created_at DESC
LIMIT 10;
