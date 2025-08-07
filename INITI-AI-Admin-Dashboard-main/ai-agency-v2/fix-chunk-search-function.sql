-- Fix the chunk search function data type mismatch
-- Run this SQL in your Supabase SQL Editor

-- 1. Fix the search_content_chunks function
CREATE OR REPLACE FUNCTION search_content_chunks(
  query_embedding vector(384),
  target_hotel_id uuid,
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5,
  target_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  chunk_content text,
  similarity float,
  chunk_index integer,
  chunk_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.document_id,
    d.title as document_title,
    c.content as chunk_content,
    (1 - (c.embedding <=> query_embedding)) as similarity,
    c.chunk_index,
    c.chunk_type::text as chunk_type -- Cast VARCHAR to TEXT
  FROM content_chunks c
  JOIN documents d ON c.document_id = d.id
  WHERE 
    c.hotel_id = target_hotel_id 
    AND c.embedding IS NOT NULL
    AND d.processed = true
    AND (target_document_id IS NULL OR c.document_id = target_document_id)
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Fix the search_documents_with_chunks function
CREATE OR REPLACE FUNCTION search_documents_with_chunks(
  query_embedding vector(384),
  target_hotel_id uuid,
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  search_type text,
  document_id uuid,
  document_title text,
  content_excerpt text,
  similarity float,
  chunk_id uuid,
  chunk_index integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First try chunk-level search for better semantic matching
  RETURN QUERY
  SELECT 
    'chunk'::text as search_type,
    c.document_id,
    c.document_title,
    c.chunk_content as content_excerpt,
    c.similarity,
    c.id as chunk_id,
    c.chunk_index
  FROM search_content_chunks(query_embedding, target_hotel_id, match_threshold, match_count) c
  ORDER BY c.similarity DESC;
  
  -- If no chunks found, fall back to document-level search
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'document'::text as search_type,
      d.id as document_id,
      d.title as document_title,
      COALESCE(
        CASE 
          WHEN d.content IS NOT NULL AND LENGTH(d.content) > 0 THEN 
            CASE 
              WHEN LENGTH(d.content) > 500 THEN LEFT(d.content, 500) || '...'
              ELSE d.content
            END
          ELSE d.description
        END,
        d.title
      ) as content_excerpt,
      (1 - (d.embedding <=> query_embedding)) as similarity,
      NULL::uuid as chunk_id,
      0 as chunk_index
    FROM documents d
    WHERE 
      d.hotel_id = target_hotel_id 
      AND d.embedding IS NOT NULL
      AND d.processed = true
      AND (1 - (d.embedding <=> query_embedding)) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
  END IF;
END;
$$;

-- 3. Test the fixed function
SELECT 
  chunk_content,
  similarity,
  chunk_index,
  chunk_type
FROM search_content_chunks(
  (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' LIMIT 1),
  '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
  0.1,
  3
) 
LIMIT 3; 