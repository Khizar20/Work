-- RECOMMENDED: Fixed RLS Policy (Keep Current Schema)
-- This is the safer, better approach

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Hotel admins can insert documents" ON documents;

-- Create the correct policy that matches your current database schema
CREATE POLICY "Hotel admins can insert documents" ON documents
    FOR INSERT 
    WITH CHECK (
        -- Check if uploaded_by (hotel_admin.id) belongs to current user
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.id = documents.uploaded_by  -- Match FK: documents.uploaded_by → hotel_admins.id
            AND ha.user_id = auth.uid()          -- Hotel admin belongs to current user
        )
    );

-- Also fix the SELECT policy for consistency
DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON documents;
CREATE POLICY "Hotel admins can view their hotel documents" ON documents
    FOR SELECT 
    USING (
        -- Users can view documents from their hotel
        EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.user_id = auth.uid()
            AND ha.hotel_id = documents.hotel_id
        )
    );

-- Test the policy with your actual data
SELECT 
    'Testing with your data:' as test_info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM hotel_admins ha
            WHERE ha.id = '26af09cb-8b56-4373-9d5e-111111111111'::uuid
            AND ha.user_id = '5fd160bb-f8c0-4910-bdea-a058503ff33f'::uuid
        ) 
        THEN '✅ Policy will ALLOW insert - hotel_admin belongs to user'
        ELSE '❌ Policy will BLOCK insert - check data relationships'
    END as policy_result;
