-- =====================================================
-- HOTEL DOCUMENT SEARCH SETUP
-- Creates vector similarity search function for hotel-specific documents
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Enable the vector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create vector similarity search function for hotel documents
CREATE OR REPLACE FUNCTION search_hotel_documents(
  hotel_id_param UUID,
  query_embedding vector(384), -- Adjust dimension based on your embedding model
  similarity_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  file_url text,
  file_type text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.file_url,
    d.file_type,
    d.created_at,
    (1 - (d.embedding <=> query_embedding)) as similarity
  FROM documents d
  WHERE 
    d.hotel_id = hotel_id_param 
    AND d.processed = true
    AND d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Create analytics table for search tracking (optional)
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_found BOOLEAN DEFAULT false,
  result_count INTEGER DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create index on embeddings for faster search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Create index on hotel_id for faster filtering
CREATE INDEX IF NOT EXISTS documents_hotel_id_idx ON documents(hotel_id);
CREATE INDEX IF NOT EXISTS documents_processed_idx ON documents(processed);

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION search_hotel_documents TO authenticated;
GRANT EXECUTE ON FUNCTION search_hotel_documents TO anon;

-- 7. RLS policies for search_analytics
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on search_analytics" ON search_analytics
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on search_analytics" ON search_analytics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 8. Test the function (replace with actual values)
-- SELECT * FROM search_hotel_documents(
--   '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
--   '[0.1, 0.2, 0.3, ...]'::vector, -- Your test embedding
--   0.5,
--   3
-- );

-- 9. Alternative search function using text similarity (fallback)
CREATE OR REPLACE FUNCTION search_hotel_documents_text(
  hotel_id_param UUID,
  search_query TEXT,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  file_url text,
  file_type text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.file_url,
    d.file_type,
    d.created_at,
    CASE 
      WHEN d.title ILIKE '%' || search_query || '%' THEN 0.8
      WHEN d.description ILIKE '%' || search_query || '%' THEN 0.6
      ELSE 0.3
    END as similarity
  FROM documents d
  WHERE 
    d.hotel_id = hotel_id_param 
    AND d.processed = true
    AND (
      d.title ILIKE '%' || search_query || '%' 
      OR d.description ILIKE '%' || search_query || '%'
    )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_hotel_documents_text TO authenticated;
GRANT EXECUTE ON FUNCTION search_hotel_documents_text TO anon; 