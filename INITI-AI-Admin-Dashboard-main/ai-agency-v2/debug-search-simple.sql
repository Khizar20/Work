-- Simple Debug Search Results 
-- Run these queries ONE BY ONE in Supabase SQL Editor

-- Query 1: Check if your document exists and has embeddings
SELECT 
    id,
    title,
    hotel_id,
    processed,
    CASE 
        WHEN embedding IS NULL THEN 'NO EMBEDDING'
        ELSE 'HAS EMBEDDING'
    END as embedding_status,
    created_at
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
ORDER BY created_at DESC;

-- Query 2: Check if search functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('search_documents', 'search_documents_by_ids')
ORDER BY routine_name;

-- Query 3: Check embedding dimensions
SELECT 
    id,
    title,
    array_length(embedding, 1) as embedding_dimensions
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND embedding IS NOT NULL;

-- Query 4: Check if pgvector extension is installed
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'vector';

-- Query 5: Test if your specific document has all required fields
SELECT 
    id,
    title,
    hotel_id,
    processed,
    embedding IS NOT NULL as has_embedding
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND id = '26dd134c-7d00-4a73-903b-af507b3cbeb1';

-- Query 6: Simple test of search function (run this ONLY if previous queries show embeddings exist)
-- REPLACE 'your_actual_embedding_here' with an actual embedding from Query 3
/*
SELECT * FROM search_documents(
    (SELECT embedding FROM documents WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' AND embedding IS NOT NULL LIMIT 1),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0,
    5
);
*/ 