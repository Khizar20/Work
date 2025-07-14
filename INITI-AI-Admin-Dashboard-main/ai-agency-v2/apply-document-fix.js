const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://rrkqxfnvvxwgfxfnrcyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya3F4Zm52dnh3Z2Z4Zm5yY3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMjU2NiwiZXhwIjoyMDUwMTA4NTY2fQ.T8f3z3Z8kFJZc0q8u8G7H1TYZ4fqFo4VQ2NvE8VeGjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDocumentPolicies() {
  try {
    console.log('🔧 Fixing document RLS policies...');

    // Drop existing policies
    const dropQueries = [
      'DROP POLICY IF EXISTS "Hotel admins can view their hotel documents" ON public.documents',
      'DROP POLICY IF EXISTS "Hotel admins can insert documents" ON public.documents',
      'DROP POLICY IF EXISTS "Hotel admins can update their hotel documents" ON public.documents',
      'DROP POLICY IF EXISTS "Hotel admins can delete their hotel documents" ON public.documents'
    ];

    for (const query of dropQueries) {
      const { error } = await supabase.rpc('exec', { sql: query });
      if (error) console.log('Drop policy result:', error.message);
    }

    // Create new policies
    const policies = [
      {
        name: 'SELECT Policy',
        sql: `CREATE POLICY "Hotel admins can view their hotel documents" ON public.documents
              FOR SELECT 
              USING (
                  hotel_id IN (
                      SELECT ha.hotel_id 
                      FROM public.hotel_admins ha 
                      WHERE ha.user_id = auth.uid()
                  )
              )`
      },
      {
        name: 'INSERT Policy',
        sql: `CREATE POLICY "Hotel admins can insert documents" ON public.documents
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
              )`
      },
      {
        name: 'UPDATE Policy',
        sql: `CREATE POLICY "Hotel admins can update their hotel documents" ON public.documents
              FOR UPDATE 
              USING (
                  hotel_id IN (
                      SELECT ha.hotel_id 
                      FROM public.hotel_admins ha 
                      WHERE ha.user_id = auth.uid()
                  )
              )`
      },
      {
        name: 'DELETE Policy',
        sql: `CREATE POLICY "Hotel admins can delete their hotel documents" ON public.documents
              FOR DELETE 
              USING (
                  hotel_id IN (
                      SELECT ha.hotel_id 
                      FROM public.hotel_admins ha 
                      WHERE ha.user_id = auth.uid()
                  )
              )`
      }
    ];

    for (const policy of policies) {
      console.log(`Creating ${policy.name}...`);
      const { error } = await supabase.rpc('exec', { sql: policy.sql });
      if (error) {
        console.error(`❌ Error creating ${policy.name}:`, error.message);
      } else {
        console.log(`✅ Created ${policy.name}`);
      }
    }

    console.log('🎉 Document RLS policies update complete!');

  } catch (err) {
    console.error('Caught error:', err);
  }
}

fixDocumentPolicies();
