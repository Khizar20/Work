// setup-supabase.js
// This script is meant to be run from the command line to set up Supabase tables, buckets and RLS policies
// Example: node setup-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Constants
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create a Supabase client with admin privileges
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Create required tables if they don't exist
 */
async function createTables() {
  console.log('Creating tables...');
  
  try {
    // Create hotels table
    const { error: hotelsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hotels (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          address TEXT NOT NULL,
          city TEXT NOT NULL,
          region TEXT,
          postal_code TEXT,
          country TEXT NOT NULL,
          description TEXT NOT NULL,
          website TEXT,
          phone TEXT,
          email TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          timezone TEXT NOT NULL DEFAULT 'UTC',
          vector_doc_count INTEGER DEFAULT 0,
          trained_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (hotelsError) throw hotelsError;
    
    // Create hotel_admins table
    const { error: adminsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS hotel_admins (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          hotel_id UUID NOT NULL REFERENCES hotels(id),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          role TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_user_hotel UNIQUE(user_id, hotel_id)
        );
      `
    });
    
    if (adminsError) throw adminsError;
    
    // Create documents table
    const { error: documentsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          hotel_id UUID NOT NULL REFERENCES hotels(id),
          uploaded_by UUID NOT NULL REFERENCES hotel_admins(id),
          title TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_type TEXT NOT NULL,
          description TEXT,
          processed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (documentsError) throw documentsError;
    
    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }
}

/**
 * Create and configure storage bucket for hotel documents
 */
async function setupStorageBucket() {
  console.log('Setting up storage bucket...');
    try {
    // First, check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === 'hotel_documents');
    
    if (!bucketExists) {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket('hotel_documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        fileSizeLimit: 10485760, // 10MB
      });
        if (error) throw error;
      console.log('Created hotel_documents bucket');
    } else {
      // Update bucket config
      const { error } = await supabase.storage.updateBucket('hotel_documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        fileSizeLimit: 10485760, // 10MB
      });
        if (error) throw error;
      console.log('Updated hotel_documents bucket configuration');
    }
    
    console.log('Storage bucket setup completed!');
  } catch (err) {
    console.error('Error setting up storage bucket:', err);
    throw err;
  }
}

/**
 * Create RLS policies for the tables
 */
async function setupTableRLS() {
  console.log('Setting up table RLS policies...');
  
  try {
    // Enable RLS on tables
    const tables = ['hotels', 'hotel_admins', 'documents'];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('execute_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      if (error) {
        // If error is "syntax error at or near "ENABLE"" then RLS is already enabled
        if (!error.message.includes('syntax error')) {
          throw error;
        }
      }
    }
    
    // Create policies for documents table
    const documentsPolicies = [
      {
        name: "Hotel Admins can view their hotel documents",
        table: "documents",
        operation: "SELECT",
        definition: `
          hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
          )
        `
      },
      {
        name: "Hotel Admins can create documents for their hotel",
        table: "documents",
        operation: "INSERT",
        check: `
          hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
          )
        `
      },
      {
        name: "Hotel Admins can update their hotel documents",
        table: "documents",
        operation: "UPDATE",
        definition: `
          hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
          )
        `
      },
      {
        name: "Hotel Admins can delete their hotel documents",
        table: "documents",
        operation: "DELETE",
        definition: `
          hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
          )
        `
      }
    ];
    
    // Create each policy, dropping existing policies with the same name first
    for (const policy of documentsPolicies) {
      // Try to drop the policy first (ignoring errors if it doesn't exist)
      try {
        await supabase.rpc('execute_sql', {
          sql: `DROP POLICY IF EXISTS "${policy.name}" ON ${policy.table};`
        });
      } catch (err) {
        console.warn(`Could not drop policy ${policy.name}:`, err.message);
      }
      
      // Create the policy
      let sql;
      if (policy.operation === 'INSERT') {
        sql = `
          CREATE POLICY "${policy.name}" 
          ON ${policy.table}
          FOR ${policy.operation} 
          WITH CHECK (${policy.check});
        `;
      } else {
        sql = `
          CREATE POLICY "${policy.name}" 
          ON ${policy.table}
          FOR ${policy.operation} 
          USING (${policy.definition});
        `;
      }
      
      const { error } = await supabase.rpc('execute_sql', { sql });
      
      if (error) throw error;
      console.log(`Created policy: ${policy.name}`);
    }
    
    console.log('Table RLS policies setup completed!');
  } catch (err) {
    console.error('Error setting up table RLS policies:', err);
    throw err;
  }
}

/**
 * Create RLS policies for storage
 */
async function setupStorageRLS() {
  console.log('Setting up storage RLS policies...');
  
  try {
    // Define storage policies
    const storagePolicies = [      {
        name: "Hotel Admin Read Policy",
        bucket: "hotel_documents",
        operation: "SELECT",
        definition: `
          (storage.foldername(name))[1] = 'hotel-' || (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid() LIMIT 1
          )
        `
      },
      {
        name: "Hotel Admin Insert Policy",
        bucket: "hotel_documents",
        operation: "INSERT",
        definition: `
          (storage.foldername(name))[1] = 'hotel-' || (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid() LIMIT 1
          )
        `
      },      {
        name: "Hotel Admin Delete Policy",
        bucket: "hotel_documents",
        operation: "DELETE",
        definition: `
          (storage.foldername(name))[1] = 'hotel-' || (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid() LIMIT 1
          )
        `
      }
    ];
    
    // Create or update each policy
    for (const policy of storagePolicies) {
      try {
        // First try to get existing policies
        const { data: policies, error: listError } = await supabase.rpc('execute_sql', {
          sql: `
            SELECT policy FROM storage.policies 
            WHERE name = '${policy.name}' AND bucket_id = '${policy.bucket}'
            LIMIT 1;
          `
        });
        
        if (listError) throw listError;
        
        // If policy exists, update it
        if (policies && policies.length > 0) {
          // Note: There's no direct API to update storage policies, so we need to drop and recreate
          const { error: dropError } = await supabase.rpc('storage.policy_drop', {
            policy_name: policy.name
          });
          
          if (dropError && !dropError.message.includes('does not exist')) throw dropError;
        }
        
        // Create policy
        const { error: createError } = await supabase.rpc('storage.policy_create', {
          policy_name: policy.name,
          bucket_name: policy.bucket,
          definition: policy.definition,
          operations: [policy.operation]
        });
        
        if (createError) throw createError;
        console.log(`Created storage policy: ${policy.name}`);
      } catch (err) {
        console.error(`Error with policy ${policy.name}:`, err);
        // Continue with other policies
      }
    }
    
    console.log('Storage RLS policies setup completed!');
  } catch (err) {
    console.error('Error setting up storage RLS policies:', err);
    throw err;
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('Starting Supabase setup...');
  
  try {
    // Make sure we can connect to Supabase
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    if (error) {
      throw new Error(`Could not connect to Supabase: ${error.message}`);
    }
    
    // Run setup tasks
    await createTables();
    await setupStorageBucket();
    await setupTableRLS();
    await setupStorageRLS();
    
    console.log('✅ Supabase setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

// Run the setup
main();
