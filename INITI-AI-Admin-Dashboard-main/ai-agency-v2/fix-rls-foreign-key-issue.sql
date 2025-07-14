-- CORRECTED RLS Policy for Document Upload
-- This fixes the foreign key relationship issue

-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON documents;

-- Create the correct policy that matches your database schema
-- The uploaded_by field references hotel_admins.id, not user_id
CREATE POLICY "Hotel admins can insert documents" ON documents
    FOR INSERT 
    WITH CHECK (
        -- Check if the uploaded_by field matches a hotel_admin record for this user
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.id = documents.uploaded_by  -- uploaded_by is hotel_admin.id
            AND ha.user_id = auth.uid()          -- current user must own that hotel_admin record
        )
    );

-- Also update the SELECT policy for consistency
DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON documents;
CREATE POLICY "Hotel admins can view their hotel documents" ON documents
    FOR SELECT 
    USING (
        -- User can view documents if they are a hotel admin for the same hotel
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
        OR
        -- User can also view documents they uploaded themselves
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.id = documents.uploaded_by
            AND ha.user_id = auth.uid()
        )
    );

-- Update UPDATE policy
DROP POLICY IF EXISTS "Hotel admins can update their hotel documents" ON documents;
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
            WHERE ha.id = documents.uploaded_by
            AND ha.user_id = auth.uid()
        )
    );

-- Update DELETE policy
DROP POLICY IF EXISTS "Hotel admins can delete their hotel documents" ON documents;
CREATE POLICY "Hotel admins can delete their hotel documents" ON documents
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Verification query to test the policy
SELECT 
    'Testing RLS policy for user: ' || auth.uid()::text as test_message,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.id = '26af09cb-8b56-4373-9d5e-111111111111'  -- Your hotel_admin.id
            AND ha.user_id = auth.uid()
        ) 
        THEN '✅ Policy should allow insert with uploaded_by = 26af09cb-8b56-4373-9d5e-111111111111'
        ELSE '❌ Policy will block insert - user does not own this hotel_admin record'
    END as policy_check;
