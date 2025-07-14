-- =====================================================
-- CLEAN UP PLACEHOLDER DOCUMENTS
-- Removes documents with placeholder/invalid URLs that don't have actual files
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. First, let's check for documents with placeholder/invalid URLs
SELECT 'Documents with placeholder URLs:' as status;
SELECT 
  id,
  title,
  file_url,
  hotel_id,
  created_at
FROM public.documents 
WHERE 
  file_url LIKE '%placeholder%' 
  OR file_url LIKE '%example.com%'
  OR file_url LIKE '%undefined%'
  OR file_url LIKE '%null%'
  OR file_url = ''
  OR file_url IS NULL
ORDER BY created_at DESC;

-- 2. Archive placeholder documents to deleted_documents before removal
INSERT INTO public.deleted_documents (
  original_id,
  hotel_id,
  uploaded_by,
  title,
  file_url,
  file_type,
  description,
  metadata,
  vector_id,
  processed,
  original_created_at,
  original_updated_at,
  deleted_by,
  deleted_at,
  deletion_reason
)
SELECT 
  d.id,
  d.hotel_id,
  d.uploaded_by,
  d.title,
  d.file_url,
  d.file_type,
  d.description,
  d.metadata,
  d.vector_id,
  d.processed,
  d.created_at,
  d.updated_at,
  auth.uid(), -- Current admin doing the cleanup
  NOW(),
  'Cleanup: Invalid placeholder URL'
FROM public.documents d
WHERE 
  d.file_url LIKE '%placeholder%' 
  OR d.file_url LIKE '%example.com%'
  OR d.file_url LIKE '%undefined%'
  OR d.file_url LIKE '%null%'
  OR d.file_url = ''
  OR d.file_url IS NULL;

-- 3. Delete placeholder documents from main table
DELETE FROM public.documents 
WHERE 
  file_url LIKE '%placeholder%' 
  OR file_url LIKE '%example.com%'
  OR file_url LIKE '%undefined%'
  OR file_url LIKE '%null%'
  OR file_url = ''
  OR file_url IS NULL;

-- 4. Verification - show remaining documents
SELECT 'Remaining valid documents:' as status;
SELECT 
  d.id,
  d.title,
  d.file_url,
  h.name as hotel_name,
  d.created_at
FROM public.documents d
JOIN public.hotels h ON d.hotel_id = h.id
ORDER BY d.created_at DESC;

-- 5. Show archived documents count
SELECT 'Archived placeholder documents count:' as status;
SELECT COUNT(*) as archived_count
FROM public.deleted_documents 
WHERE deletion_reason = 'Cleanup: Invalid placeholder URL';

SELECT 'Cleanup completed successfully!' as status;
