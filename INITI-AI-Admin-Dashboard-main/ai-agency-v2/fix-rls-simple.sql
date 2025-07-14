-- SIMPLE RLS FIX - Just allow access to your hotel's documents

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can only see their own documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can only see their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Restrict document access" ON public.documents;
DROP POLICY IF EXISTS "Allow anonymous read access to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow authenticated read access to documents" ON public.documents;

-- Create one simple policy for your hotel
CREATE POLICY "Allow access to hotel grand newwest documents" 
ON public.documents 
FOR SELECT 
TO anon, authenticated, service_role
USING (
  hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'::uuid
  OR 
  processed = true
);

-- Ensure RLS is enabled
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON public.documents TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_documents TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_documents_by_ids TO anon, authenticated;

-- Test the access
SELECT 'Should return your document:' as test, id, title, hotel_id 
FROM public.documents 
WHERE hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'; 