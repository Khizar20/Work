-- Supabase RLS Policies for Document Upload
-- This script creates the necessary Row Level Security policies to allow hotel admins to upload documents

-- ============================================================================
-- DOCUMENTS TABLE RLS POLICIES
-- ============================================================================

-- First, enable RLS on the documents table if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON documents;
DROP POLICY IF EXISTS "Hotel admins can update their hotel documents" ON documents;
DROP POLICY IF EXISTS "Hotel admins can delete their hotel documents" ON documents;

-- Policy 1: Allow hotel admins to INSERT documents for their hotel
CREATE POLICY "Hotel admins can insert documents" ON documents
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Policy 2: Allow hotel admins to SELECT documents from their hotel
CREATE POLICY "Hotel admins can view their hotel documents" ON documents
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Policy 3: Allow hotel admins to UPDATE documents from their hotel
CREATE POLICY "Hotel admins can update their hotel documents" ON documents
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Policy 4: Allow hotel admins to DELETE documents from their hotel
CREATE POLICY "Hotel admins can delete their hotel documents" ON documents
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- ============================================================================
-- HOTEL_ADMINS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on hotel_admins table if not already enabled
ALTER TABLE hotel_admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own hotel admin records" ON hotel_admins;
DROP POLICY IF EXISTS "Users can update their own hotel admin records" ON hotel_admins;

-- Policy: Allow users to view their own hotel admin records
CREATE POLICY "Users can view their own hotel admin records" ON hotel_admins
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Allow users to update their own hotel admin records
CREATE POLICY "Users can update their own hotel admin records" ON hotel_admins
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HOTELS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on hotels table if not already enabled
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hotel admins can view their hotel" ON hotels;
DROP POLICY IF EXISTS "Hotel admins can update their hotel" ON hotels;

-- Policy: Allow hotel admins to view their hotel
CREATE POLICY "Hotel admins can view their hotel" ON hotels
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = hotels.id
        )
    );

-- Policy: Allow hotel admins to update their hotel
CREATE POLICY "Hotel admins can update their hotel" ON hotels
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = hotels.id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = hotels.id
        )
    );

-- ============================================================================
-- PROFILES TABLE RLS POLICIES (Optional)
-- ============================================================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Policy: Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET POLICIES (for hotel_documents bucket)
-- ============================================================================

-- Note: Storage policies are handled separately through the Supabase dashboard or storage API
-- These are the equivalent policies for the hotel_documents storage bucket:

/*
Storage Bucket: hotel_documents

Policy 1: "Hotel admins can upload documents"
Operation: INSERT
Target roles: authenticated
USING expression:
bucket_id = 'hotel_documents' AND 
EXISTS (
  SELECT 1 FROM hotel_admins 
  WHERE user_id = auth.uid()
)

Policy 2: "Hotel admins can read their hotel documents"
Operation: SELECT
Target roles: authenticated
USING expression:
bucket_id = 'hotel_documents' AND
EXISTS (
  SELECT 1 FROM hotel_admins ha
  WHERE ha.user_id = auth.uid()
)

Policy 3: "Hotel admins can update their documents"
Operation: UPDATE
Target roles: authenticated
USING expression: (same as Policy 2)

Policy 4: "Hotel admins can delete their documents"
Operation: DELETE
Target roles: authenticated
USING expression: (same as Policy 2)
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test query to verify RLS policies are working
-- Run this after the policies are created to test:

/*
-- Check if current user has hotel admin access
SELECT 
  ha.id as hotel_admin_id,
  ha.hotel_id,
  ha.role,
  h.name as hotel_name
FROM hotel_admins ha
JOIN hotels h ON h.id = ha.hotel_id
WHERE ha.user_id = auth.uid();

-- Test document insert permissions
-- This should return true if the user can insert documents
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM hotel_admins ha
      WHERE ha.user_id = auth.uid()
      AND ha.hotel_id = '8a1e6805-9253-4dd5-8893-0de3d7815555'  -- Replace with actual hotel_id
    ) 
    THEN 'User can insert documents for this hotel'
    ELSE 'User cannot insert documents for this hotel'
  END as permission_check;
*/

-- ============================================================================
-- GRANT PERMISSIONS TO authenticated ROLE
-- ============================================================================

-- Ensure the authenticated role has the necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT, UPDATE ON hotel_admins TO authenticated;
GRANT SELECT, UPDATE ON hotels TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created successfully!';
    RAISE NOTICE '📄 Documents table: Hotel admins can now insert/view/update/delete documents for their hotel';
    RAISE NOTICE '🏨 Hotels table: Hotel admins can view and update their hotel';
    RAISE NOTICE '👤 Profiles table: Users can manage their own profiles';
    RAISE NOTICE '🔑 Hotel_admins table: Users can view their own admin records';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Document upload should now work for hotel admins!';
    RAISE NOTICE '💡 Remember to also configure storage bucket policies via Supabase Dashboard';
END $$;
