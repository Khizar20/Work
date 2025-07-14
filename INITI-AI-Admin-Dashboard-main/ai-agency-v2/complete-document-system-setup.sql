-- Complete Document Management System Setup
-- This file sets up the proper RLS policies and relationships for document management

-- =============================================================================
-- 1. ENSURE PROPER TABLE STRUCTURE
-- =============================================================================

-- Verify documents table structure (should already exist based on your schema)
-- CREATE TABLE IF NOT EXISTS public.documents (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   hotel_id uuid NOT NULL,
--   uploaded_by uuid NOT NULL,
--   title text NOT NULL,
--   file_url text NOT NULL,
--   file_type text NOT NULL CHECK (file_type = ANY (ARRAY['pdf'::text, 'png'::text, 'jpeg'::text, 'jpg'::text, 'docx'::text, 'pptx'::text])),
--   description text,
--   processed boolean NOT NULL DEFAULT false,
--   created_at timestamp with time zone NOT NULL DEFAULT now(),
--   updated_at timestamp with time zone NOT NULL DEFAULT now(),
--   metadata jsonb,
--   vector_id text,
--   CONSTRAINT documents_pkey PRIMARY KEY (id),
--   CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.hotel_admins(id),
--   CONSTRAINT documents_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id)
-- );

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on hotel_admins table (if not already enabled)
ALTER TABLE public.hotel_admins ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. DROP EXISTING POLICIES (Clean slate)
-- =============================================================================

DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can update their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can delete their hotel documents" ON public.documents;

-- Drop hotel_admins policies if they exist
DROP POLICY IF EXISTS "Users can view their hotel admin profile" ON public.hotel_admins;
DROP POLICY IF EXISTS "Users can update their hotel admin profile" ON public.hotel_admins;

-- =============================================================================
-- 4. CREATE HOTEL_ADMINS RLS POLICIES
-- =============================================================================

-- Policy for hotel admins to view their own profile
CREATE POLICY "Users can view their hotel admin profile" ON public.hotel_admins
    FOR SELECT 
    USING (user_id = auth.uid());

-- Policy for hotel admins to update their own profile
CREATE POLICY "Users can update their hotel admin profile" ON public.hotel_admins
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- 5. CREATE DOCUMENTS RLS POLICIES
-- =============================================================================

-- SELECT Policy: Hotel admins can view documents from their hotel
-- This allows admins to see ALL documents from their hotel, not just their own uploads
CREATE POLICY "Hotel admins can view their hotel documents" ON public.documents
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- INSERT Policy: Hotel admins can upload documents to their hotel
CREATE POLICY "Hotel admins can insert documents" ON public.documents
    FOR INSERT 
    WITH CHECK (
        -- Verify the user is a hotel admin for the specified hotel
        EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
            AND ha.id = documents.uploaded_by  -- Must use their own hotel_admin.id
        )
    );

-- UPDATE Policy: Hotel admins can update documents from their hotel
CREATE POLICY "Hotel admins can update their hotel documents" ON public.documents
    FOR UPDATE 
    USING (
        -- Can update documents from their hotel
        EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    )
    WITH CHECK (
        -- Ensure updated data still belongs to their hotel
        EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- DELETE Policy: Hotel admins can delete documents from their hotel
CREATE POLICY "Hotel admins can delete their hotel documents" ON public.documents
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- =============================================================================
-- 6. STORAGE BUCKET POLICIES
-- =============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies for hotel_documents bucket
DROP POLICY IF EXISTS "Hotel admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Hotel admins can delete documents" ON storage.objects;

-- Allow hotel admins to upload files to their hotel folder
CREATE POLICY "Hotel admins can upload documents" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'hotel_documents' 
        AND EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND (storage.foldername(name))[1] = ha.hotel_id::text
        )
    );

-- Allow hotel admins to view files from their hotel folder
CREATE POLICY "Hotel admins can view documents" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'hotel_documents' 
        AND EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND (storage.foldername(name))[1] = ha.hotel_id::text
        )
    );

-- Allow hotel admins to delete files from their hotel folder
CREATE POLICY "Hotel admins can delete documents" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'hotel_documents' 
        AND EXISTS (
            SELECT 1 FROM public.hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND (storage.foldername(name))[1] = ha.hotel_id::text
        )
    );

-- =============================================================================
-- 7. UTILITY FUNCTIONS
-- =============================================================================

-- Function to get hotel admin info for current user
CREATE OR REPLACE FUNCTION get_current_hotel_admin()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    hotel_id uuid,
    role text,
    fullname text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT ha.id, ha.user_id, ha.hotel_id, ha.role, ha.fullname
    FROM public.hotel_admins ha
    WHERE ha.user_id = auth.uid()
    LIMIT 1;
$$;

-- Function to check if user can access hotel
CREATE OR REPLACE FUNCTION can_access_hotel(target_hotel_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.hotel_admins ha
        WHERE ha.user_id = auth.uid()
        AND ha.hotel_id = target_hotel_id
    );
$$;

-- =============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_hotel_id ON public.documents(hotel_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_admins_user_id ON public.hotel_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_admins_hotel_id ON public.hotel_admins(hotel_id);

-- =============================================================================
-- 9. VERIFICATION QUERIES
-- =============================================================================

-- Test the setup with these queries (run as authenticated user):

-- 1. Check if current user has hotel admin access
-- SELECT * FROM get_current_hotel_admin();

-- 2. Test document access for current user
-- SELECT 
--     d.*,
--     ha.fullname as uploader_name,
--     h.name as hotel_name
-- FROM documents d
-- JOIN hotel_admins ha ON d.uploaded_by = ha.id
-- JOIN hotels h ON d.hotel_id = h.id
-- WHERE d.hotel_id IN (
--     SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid()
-- );

-- 3. Test if user can access a specific hotel
-- SELECT can_access_hotel('YOUR_HOTEL_ID_HERE');

-- =============================================================================
-- 10. GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant access to authenticated users for the utility functions
GRANT EXECUTE ON FUNCTION get_current_hotel_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_hotel(uuid) TO authenticated;

-- Grant access to necessary tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, UPDATE ON public.hotel_admins TO authenticated;
GRANT SELECT ON public.hotels TO authenticated;
