-- Quick RLS Fix for Document Upload
-- Run this in Supabase SQL Editor to allow hotel admins to upload documents

-- Enable RLS and create policies for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON documents;

-- Allow hotel admins to insert documents for their hotel
CREATE POLICY "Hotel admins can insert documents" ON documents
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Allow hotel admins to view documents from their hotel
CREATE POLICY "Hotel admins can view their hotel documents" ON documents
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Ensure authenticated users have table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;

-- Enable RLS on hotel_admins table and allow users to read their own records
ALTER TABLE hotel_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own hotel admin records" ON hotel_admins;
CREATE POLICY "Users can view their own hotel admin records" ON hotel_admins
    FOR SELECT 
    USING (auth.uid() = user_id);

GRANT SELECT ON hotel_admins TO authenticated;

-- Success message
SELECT '✅ RLS policies created! Document upload should now work.' as result;
