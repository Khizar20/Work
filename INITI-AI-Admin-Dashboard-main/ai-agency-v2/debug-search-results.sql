-- Debug Search Results 
-- Run this in Supabase SQL Editor to understand why search returns 0 results

-- 1. First, let's check if your document exists and has embeddings
SELECT 
    'Document Check' as test_type,
    id,
    title,
    hotel_id,
    processed,
    CASE 
        WHEN embedding IS NULL THEN 'NO EMBEDDING'
        ELSE 'HAS EMBEDDING (' || array_length(embedding, 1) || ' dimensions)'
    END as embedding_status,
    created_at
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
ORDER BY created_at DESC;

-- 2. Check if the search functions exist
SELECT 
    'Function Check' as test_type,
    routine_name,
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name IN ('search_documents', 'search_documents_by_ids')
ORDER BY routine_name;

-- 3. Test the search function with a very simple query using actual embedding
-- This will test if the function works at all
DO $$
DECLARE
    test_embedding vector(384);
    result_count integer;
BEGIN
    -- Get an actual embedding from your document
    SELECT embedding INTO test_embedding 
    FROM documents 
    WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' 
    AND embedding IS NOT NULL 
    LIMIT 1;
    
    IF test_embedding IS NOT NULL THEN
        -- Test the search function with the actual embedding
        SELECT COUNT(*) INTO result_count
        FROM search_documents(
            test_embedding,
            '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
            0.01,  -- Very low threshold
            10
        );
        
        RAISE NOTICE 'Search function test: Found % documents with threshold 0.01', result_count;
        
        -- Also test with zero threshold (should return the document we got embedding from)
        SELECT COUNT(*) INTO result_count
        FROM search_documents(
            test_embedding,
            '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
            0.0,   -- Zero threshold - should match itself
            10
        );
        
        RAISE NOTICE 'Search function test with 0.0 threshold: Found % documents', result_count;
    ELSE
        RAISE NOTICE 'No documents with embeddings found for testing';
    END IF;
END $$;

-- 4. Test manual similarity calculation
SELECT 
    'Manual Similarity Test' as test_type,
    d1.id as doc1_id,
    d1.title as doc1_title,
    d2.id as doc2_id, 
    d2.title as doc2_title,
    (1 - (d1.embedding <=> d2.embedding)) as similarity
FROM documents d1
CROSS JOIN documents d2
WHERE d1.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND d2.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND d1.embedding IS NOT NULL
AND d2.embedding IS NOT NULL
ORDER BY similarity DESC
LIMIT 5;

-- 5. Check embedding dimensions and validity
SELECT 
    'Embedding Validation' as test_type,
    id,
    title,
    array_length(embedding, 1) as embedding_dimensions,
    CASE 
        WHEN array_length(embedding, 1) = 384 THEN 'CORRECT'
        ELSE 'INCORRECT'
    END as dimension_status
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND embedding IS NOT NULL;

-- 6. Test if pgvector extension is working
SELECT 
    'Vector Extension Test' as test_type,
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'vector';

-- 7. Test the specific document search function
SELECT 
    'Specific Document Search Test' as test_type,
    COUNT(*) as document_count
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND id = '26dd134c-7d00-4a73-903b-af507b3cbeb1'
AND embedding IS NOT NULL
AND processed = true; 