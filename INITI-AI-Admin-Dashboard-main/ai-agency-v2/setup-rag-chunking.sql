-- Setup RAG with Content Chunking for Semantic Search
-- This creates a system that stores content chunks with embeddings for better semantic matching

-- 1. Create a content_chunks table for storing document chunks
CREATE TABLE IF NOT EXISTS content_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    chunk_type VARCHAR(50) DEFAULT 'text', -- 'text', 'section', 'paragraph'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_content_chunks_document_id ON content_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_hotel_id ON content_chunks(hotel_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding ON content_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. Create function for semantic chunk search
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
    c.chunk_type
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

-- 4. Create function to get contextual chunks (surrounding chunks for better context)
CREATE OR REPLACE FUNCTION get_contextual_chunks(
  base_chunk_id uuid,
  context_window int DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  is_primary boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  base_doc_id uuid;
  base_chunk_idx integer;
BEGIN
  -- Get the base chunk info
  SELECT document_id, chunk_index INTO base_doc_id, base_chunk_idx
  FROM content_chunks WHERE id = base_chunk_id;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    (c.id = base_chunk_id) as is_primary
  FROM content_chunks c
  WHERE 
    c.document_id = base_doc_id
    AND c.chunk_index BETWEEN (base_chunk_idx - context_window) AND (base_chunk_idx + context_window)
  ORDER BY c.chunk_index;
END;
$$;

-- 5. Create function to combine document and chunk search
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

-- 6. Check current state
SELECT 
  'Documents' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as with_content,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embedding
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'

UNION ALL

SELECT 
  'Content Chunks' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as with_content,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embedding
FROM content_chunks 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'; 