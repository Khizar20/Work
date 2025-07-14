-- Test using the exact same parameters that the API is using
-- From the logs: target_hotel_id="8a1e6805-9253-4dd5-8893-0de3d7815555", target_document_id="26dd134c-7d00-4a73-903b-af507b3cbeb1"

-- First, let's verify the document exists and has embedding
SELECT 
    'Document Check' as test_name,
    id,
    title,
    hotel_id,
    CASE 
        WHEN embedding IS NULL THEN 'NO EMBEDDING'
        WHEN array_length(embedding, 1) IS NULL THEN 'EMPTY EMBEDDING'
        ELSE 'HAS EMBEDDING (' || array_length(embedding, 1) || ' dimensions)'
    END as embedding_status
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
    AND id = '26dd134c-7d00-4a73-903b-af507b3cbeb1';

-- Test the search function with a simple dummy embedding (same as our previous working test)
SELECT 
    'API Simulation Test' as test_name,
    id,
    title,
    similarity,
    content_excerpt
FROM search_documents(
    ARRAY[0.1, 0.2, 0.3]::vector(3), -- Dummy 3D embedding for testing
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0, -- Same threshold as API
    5,   -- Same limit as API
    '26dd134c-7d00-4a73-903b-af507b3cbeb1'::uuid -- Same document_id as API
);

-- Test the search function with proper 384-dimension dummy embedding
SELECT 
    'API Simulation 384D Test' as test_name,
    id,
    title,
    similarity,
    content_excerpt
FROM search_documents(
    -- Create a 384-dimension dummy embedding (same size as API)
    (SELECT array_agg(0.1) FROM generate_series(1, 384))::vector(384),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0, -- Same threshold as API
    5,   -- Same limit as API
    '26dd134c-7d00-4a73-903b-af507b3cbeb1'::uuid -- Same document_id as API
);

-- Test without document_id filter (search all documents)
SELECT 
    'API Simulation All Docs Test' as test_name,
    id,
    title,
    similarity,
    content_excerpt
FROM search_documents(
    (SELECT array_agg(0.1) FROM generate_series(1, 384))::vector(384),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0, -- Same threshold as API
    10,  -- Same limit as API  
    NULL -- No document_id filter
);

-- Check if there's an issue with the vector dimensions
SELECT 
    'Vector Dimension Check' as test_name,
    id,
    title,
    array_length(embedding, 1) as embedding_dimensions
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
    AND embedding IS NOT NULL; 