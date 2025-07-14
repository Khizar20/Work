-- Test Search Function Directly
-- Run this in Supabase SQL Editor to test why search returns 0 results

-- Test 1: Get the actual embedding from your document and test search function
SELECT 
    'Testing search with actual document embedding' as test_info,
    d.id,
    d.title,
    d.embedding IS NOT NULL as has_embedding,
    d.processed
FROM documents d
WHERE d.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND d.embedding IS NOT NULL
LIMIT 3;

-- Test 2: Test search function with zero threshold (should return at least the document we got embedding from)
SELECT 
    'Search Function Test - Zero Threshold' as test_name,
    s.*
FROM search_documents(
    (SELECT embedding FROM documents 
     WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' 
     AND id = '26dd134c-7d00-4a73-903b-af507b3cbeb1'),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0,  -- Zero threshold - should match itself perfectly
    10
) s;

-- Test 3: Test with very low threshold
SELECT 
    'Search Function Test - Low Threshold' as test_name,
    s.*
FROM search_documents(
    (SELECT embedding FROM documents 
     WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' 
     AND id = '26dd134c-7d00-4a73-903b-af507b3cbeb1'),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.01,  -- Very low threshold
    10
) s;

-- Test 4: Manual similarity test between your two documents with embeddings
SELECT 
    'Manual Similarity Test' as test_name,
    d1.id as doc1_id,
    d1.title as doc1_title,
    d2.id as doc2_id,
    d2.title as doc2_title,
    (1 - (d1.embedding <=> d2.embedding)) as similarity_score
FROM documents d1
CROSS JOIN documents d2
WHERE d1.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND d2.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
AND d1.embedding IS NOT NULL
AND d2.embedding IS NOT NULL
ORDER BY similarity_score DESC;

-- Test 5: Check if the search function filters are working correctly
SELECT 
    'Filter Test' as test_name,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as documents_with_embeddings,
    COUNT(CASE WHEN processed = true THEN 1 END) as processed_documents,
    COUNT(CASE WHEN embedding IS NOT NULL AND processed = true THEN 1 END) as searchable_documents
FROM documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'; 