-- Add content field to documents table to store extracted PDF text
-- Run this SQL in your Supabase SQL Editor

-- 1. Add content column to store the full extracted text from PDFs
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content TEXT;

-- 2. Add index for faster text searches (optional)
CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING gin(to_tsvector('english', content));

-- 3. Update the search_documents function to return actual content
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(384),
  target_hotel_id uuid,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  target_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  file_type text,
  similarity float,
  content_excerpt text
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
    (1 - (d.embedding <=> query_embedding)) as similarity,
    -- Return actual content excerpt, fallback to description
    COALESCE(
      CASE 
        WHEN d.content IS NOT NULL AND LENGTH(d.content) > 0 THEN 
          CASE 
            WHEN LENGTH(d.content) > 500 THEN LEFT(d.content, 500) || '...'
            ELSE d.content
          END
        WHEN d.description IS NOT NULL AND LENGTH(d.description) > 0 THEN
          CASE 
            WHEN LENGTH(d.description) > 200 THEN LEFT(d.description, 200) || '...'
            ELSE d.description
          END
        ELSE d.title
      END
    ) as content_excerpt
  FROM documents d
  WHERE 
    d.hotel_id = target_hotel_id 
    AND d.embedding IS NOT NULL
    AND d.processed = true
    AND (target_document_id IS NULL OR d.id = target_document_id)
    AND (1 - (d.embedding <=> query_embedding)) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Update the search_documents_by_ids function as well
CREATE OR REPLACE FUNCTION search_documents_by_ids(
  query_embedding vector(384),
  target_hotel_id uuid,
  target_document_ids uuid[],
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  file_type text,
  similarity float,
  content_excerpt text
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
    (1 - (d.embedding <=> query_embedding)) as similarity,
    -- Return actual content excerpt, fallback to description
    COALESCE(
      CASE 
        WHEN d.content IS NOT NULL AND LENGTH(d.content) > 0 THEN 
          CASE 
            WHEN LENGTH(d.content) > 500 THEN LEFT(d.content, 500) || '...'
            ELSE d.content
          END
        WHEN d.description IS NOT NULL AND LENGTH(d.description) > 0 THEN
          CASE 
            WHEN LENGTH(d.description) > 200 THEN LEFT(d.description, 200) || '...'
            ELSE d.description
          END
        ELSE d.title
      END
    ) as content_excerpt
  FROM documents d
  WHERE 
    d.hotel_id = target_hotel_id 
    AND d.embedding IS NOT NULL
    AND d.processed = true
    AND d.id = ANY(target_document_ids)
    AND (1 - (d.embedding <=> query_embedding)) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Check the current state
SELECT id, title, 
       CASE WHEN content IS NULL THEN 'No content' ELSE 'Has content (' || LENGTH(content) || ' chars)' END as content_status,
       CASE WHEN embedding IS NULL THEN 'No embedding' ELSE 'Has embedding' END as embedding_status
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'; 