-- IMMEDIATE FIX: Document System RLS Policies
-- Run this script to fix your current document access issues

-- =============================================================================
-- STEP 1: Clean up existing policies
-- =============================================================================

-- Drop existing document policies
DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can update their hotel documents" ON public.documents;
DROP POLICY IF EXISTS "Hotel admins can delete their hotel documents" ON public.documents;

-- =============================================================================
-- STEP 2: Create working RLS policies
-- =============================================================================

-- SELECT: Allow hotel admins to see all documents from their hotel
CREATE POLICY "Hotel admins can view their hotel documents" ON public.documents
    FOR SELECT 
    USING (
        hotel_id IN (
            SELECT ha.hotel_id 
            FROM public.hotel_admins ha 
            WHERE ha.user_id = auth.uid()
        )
    );

-- INSERT: Allow hotel admins to upload documents
CREATE POLICY "Hotel admins can insert documents" ON public.documents
    FOR INSERT 
    WITH CHECK (
        uploaded_by IN (
            SELECT ha.id 
            FROM public.hotel_admins ha 
            WHERE ha.user_id = auth.uid()
        )
        AND hotel_id IN (
            SELECT ha.hotel_id 
            FROM public.hotel_admins ha 
            WHERE ha.user_id = auth.uid()
        )
    );

-- UPDATE: Allow hotel admins to update documents from their hotel
CREATE POLICY "Hotel admins can update their hotel documents" ON public.documents
    FOR UPDATE 
    USING (
        hotel_id IN (
            SELECT ha.hotel_id 
            FROM public.hotel_admins ha 
            WHERE ha.user_id = auth.uid()
        )
    );

-- DELETE: Allow hotel admins to delete documents from their hotel
CREATE POLICY "Hotel admins can delete their hotel documents" ON public.documents
    FOR DELETE 
    USING (
        hotel_id IN (
            SELECT ha.hotel_id 
            FROM public.hotel_admins ha 
            WHERE ha.user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP 3: Verify current user setup
-- =============================================================================

-- Check your current user setup (uncomment to run):
-- SELECT 
--     'Current User: ' || auth.uid()::text as user_info,
--     ha.id as hotel_admin_id,
--     ha.hotel_id,
--     ha.role,
--     h.name as hotel_name
-- FROM hotel_admins ha
-- JOIN hotels h ON ha.hotel_id = h.id
-- WHERE ha.user_id = auth.uid();

-- Check documents for current user (uncomment to run):
-- SELECT 
--     d.id,
--     d.title,
--     d.file_type,
--     d.created_at,
--     d.hotel_id,
--     d.uploaded_by,
--     h.name as hotel_name
-- FROM documents d
-- JOIN hotels h ON d.hotel_id = h.id
-- WHERE d.hotel_id IN (
--     SELECT hotel_id FROM hotel_admins WHERE user_id = auth.uid()
-- );

-- =============================================================================
-- NOTES FOR YOUR DOCUMENT SYSTEM:
-- =============================================================================

-- CURRENT RELATIONSHIP STRUCTURE (CORRECT):
-- auth.users.id → hotel_admins.user_id (FK)
-- hotel_admins.id → documents.uploaded_by (FK)  
-- hotels.id → documents.hotel_id (FK)
-- hotels.id → hotel_admins.hotel_id (FK)

-- STORAGE BUCKET STRUCTURE:
-- Bucket: hotel_documents
-- Folder structure: /{hotel_id}/{filename}
-- Access: Only hotel admins from that hotel can access

-- SECURITY MODEL:
-- 1. User authenticates with Supabase Auth (auth.users)
-- 2. User is linked to hotel_admins table via user_id
-- 3. Documents are scoped to hotel via hotel_id
-- 4. Documents track uploader via uploaded_by (hotel_admin.id)
-- 5. RLS policies ensure users only see documents from their hotel

-- YOUR API SHOULD FILTER BY:
-- - documents.hotel_id = current_user's_hotel_id  (for hotel-level access)
-- - documents.uploaded_by = current_user's_hotel_admin_id  (for user-specific access)
