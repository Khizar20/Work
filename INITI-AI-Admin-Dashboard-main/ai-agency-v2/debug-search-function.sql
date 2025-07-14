-- Debug Document Search Function
-- Run this in Supabase SQL Editor to debug why search returns 0 results

-- 1. Check what documents exist for your hotel
SELECT id, title, description, file_type, processed, 
       CASE WHEN embedding IS NULL THEN 'No embedding' ELSE 'Has embedding' END as embedding_status
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
ORDER BY created_at DESC;

-- 2. Test search with very low threshold (0.1)
SELECT * FROM search_documents(
  -- Use embedding from your existing document
  (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' AND embedding IS NOT NULL LIMIT 1),
  '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
  0.1,  -- Very low threshold
  5
);

-- 3. Create a more lenient search function for testing
CREATE OR REPLACE FUNCTION search_documents_debug(
  query_embedding vector(384),
  target_hotel_id uuid,
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  file_type text,
  similarity float,
  content_excerpt text,
  has_embedding boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.file_type,
    -- Calculate cosine similarity
    CASE 
      WHEN d.embedding IS NOT NULL THEN (1 - (d.embedding <=> query_embedding))
      ELSE 0.0
    END as similarity,
    -- Provide a content excerpt
    COALESCE(
      CASE 
        WHEN LENGTH(d.description) > 200 THEN LEFT(d.description, 200) || '...'
        ELSE d.description
      END,
      d.title
    ) as content_excerpt,
    (d.embedding IS NOT NULL) as has_embedding
  FROM documents d
  WHERE 
    d.hotel_id = target_hotel_id 
    AND d.processed = true
    AND (
      d.embedding IS NULL 
      OR (1 - (d.embedding <=> query_embedding)) > match_threshold
    )
  ORDER BY 
    CASE 
      WHEN d.embedding IS NOT NULL THEN d.embedding <=> query_embedding
      ELSE 1.0
    END
  LIMIT match_count;
END;
$$; 