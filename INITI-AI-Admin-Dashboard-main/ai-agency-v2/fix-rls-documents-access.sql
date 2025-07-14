-- Fix RLS policies for documents table to allow API access
-- This will enable the search endpoints to access documents

-- 1. Check current RLS policies on documents table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'documents' AND schemaname = 'public';

-- 2. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can only see their own documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can only see their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Restrict document access" ON public.documents;

-- 3. Create permissive policies for API access

-- Allow anonymous (API) users to read all documents
CREATE POLICY "Allow anonymous read access to documents" 
ON public.documents 
FOR SELECT 
TO anon 
USING (true);

-- Allow authenticated users to read all documents
CREATE POLICY "Allow authenticated read access to documents" 
ON public.documents 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to documents" 
ON public.documents 
FOR ALL 
TO service_role 
USING (true);

-- 4. Alternative: If you want hotel-specific access, use this instead
-- (Comment out the above policies and uncomment these)

/*
-- Allow API access to documents for specific hotel
CREATE POLICY "Allow API access to hotel documents" 
ON public.documents 
FOR SELECT 
TO anon, authenticated 
USING (
  hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid
  OR 
  auth.role() = 'service_role'
);
*/

-- 5. Ensure RLS is enabled but with permissive policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions to anon role
GRANT SELECT ON public.documents TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 7. Grant permissions to authenticated role
GRANT SELECT ON public.documents TO authenticated;

-- 8. Allow access to the search functions
GRANT EXECUTE ON FUNCTION public.search_documents TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_documents_by_ids TO anon, authenticated;

-- 9. Verify the policies are applied
SELECT 
    'RLS Policies for documents table:' as info,
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'documents' AND schemaname = 'public';

-- 10. Test query to verify access (should return documents)
SELECT 
    'Test query - should return documents:' as test,
    id, 
    title, 
    hotel_id, 
    processed 
FROM public.documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
LIMIT 5; 

-- 11. CORRECTED: Test the search function with actual embedding (run this after verifying documents exist)
-- First check which documents have embeddings:
SELECT 
    'Documents with embeddings:' as info,
    id, 
    title, 
    processed,
    CASE WHEN embedding IS NULL THEN 'NO EMBEDDING' ELSE 'HAS EMBEDDING' END as embedding_status
FROM public.documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'
ORDER BY processed DESC;

-- Test search function using an existing document's embedding:
SELECT 
    'Search function test:' as test_name,
    s.id,
    s.title,
    s.similarity,
    s.content_excerpt
FROM search_documents(
    (SELECT embedding FROM documents 
     WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555' 
     AND embedding IS NOT NULL 
     LIMIT 1),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.1,  -- Low threshold
    5
) s;

-- Alternative: Test with a dummy 384-dimension vector if no embeddings exist:
SELECT 
    'Search function test with dummy embedding:' as test_name,
    s.id,
    s.title,
    s.similarity,
    s.content_excerpt
FROM search_documents(
    (SELECT array_agg(0.1) FROM generate_series(1, 384))::vector(384),
    '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid,
    0.0,  -- Very low threshold
    5
) s; 