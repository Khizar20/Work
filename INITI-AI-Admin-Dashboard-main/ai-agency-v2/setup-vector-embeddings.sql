-- Enable pgvector extension for vector embeddings
-- Run this SQL in your Supabase SQL Editor

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to documents table if it doesn't exist
-- This column will store 384-dimensional embeddings from all-MiniLM-L6-v2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'documents'::regclass AND attname = 'embedding') THEN
    ALTER TABLE documents ADD COLUMN embedding vector(384);
  END IF;
END $$;

-- 3. Create index for efficient vector similarity search
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- 4. Update database types comment to reflect the vector capability
COMMENT ON COLUMN documents.embedding IS 'Vector embedding (384 dimensions) generated from document text using all-MiniLM-L6-v2 model';

-- 5. Verify the setup
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' AND column_name = 'embedding';

-- 6. Show current documents and their embedding status
SELECT id, title, file_type, processed, 
       CASE 
         WHEN embedding IS NULL THEN 'No embedding' 
         ELSE 'Has embedding (' || array_length(embedding::real[], 1) || ' dimensions)'
       END as embedding_status
FROM documents; 