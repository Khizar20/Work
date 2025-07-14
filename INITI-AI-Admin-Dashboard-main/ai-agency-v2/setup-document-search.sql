-- Document Search Function for Botpress Integration
-- Run this SQL in your Supabase SQL Editor

-- First, drop existing search_documents function to avoid conflicts
DROP FUNCTION IF EXISTS search_documents(vector, uuid, float, int);
DROP FUNCTION IF EXISTS search_documents(vector, uuid, float, int, uuid);

-- Create function for semantic document search with optional document ID filtering
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
    -- Provide a content excerpt (description or title)
    COALESCE(
      CASE 
        WHEN LENGTH(d.description) > 200 THEN LEFT(d.description, 200) || '...'
        ELSE d.description
      END,
      d.title
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

-- Create additional function for searching by multiple document IDs
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
    -- Provide a content excerpt (description or title)
    COALESCE(
      CASE 
        WHEN LENGTH(d.description) > 200 THEN LEFT(d.description, 200) || '...'
        ELSE d.description
      END,
      d.title
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_documents TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents TO anon;
GRANT EXECUTE ON FUNCTION search_documents_by_ids TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents_by_ids TO anon;

-- Test the updated function with a sample query using your actual data structure
-- You can run this to test once you have documents with embeddings:
/*
-- Test general search (all documents in hotel)
SELECT * FROM search_documents(
  (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' AND embedding IS NOT NULL LIMIT 1),
  '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
  0.2,
  3
);

-- Test search with specific document ID using your actual document ID
SELECT * FROM search_documents(
  (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' AND embedding IS NOT NULL LIMIT 1),
  '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
  0.2,
  3,
  '26dd134c-7d00-4a73-903b-af507b3cbeb1'::uuid
);

-- Test search with multiple document IDs
SELECT * FROM search_documents_by_ids(
  (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' AND embedding IS NOT NULL LIMIT 1),
  '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
  ARRAY['26dd134c-7d00-4a73-903b-af507b3cbeb1'::uuid],
  0.2,
  3
);
*/

-- Create indexes for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_documents_hotel_embedding 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WHERE hotel_id IS NOT NULL AND embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_hotel_id_id 
ON documents(hotel_id, id) 
WHERE embedding IS NOT NULL AND processed = true;

-- Verify the functions were created
SELECT routine_name, routine_type, specific_name
FROM information_schema.routines 
WHERE routine_name IN ('search_documents', 'search_documents_by_ids')
ORDER BY routine_name; 