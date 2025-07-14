/**
 * This file contains functions to set up Row Level Security (RLS) policies
 * for Supabase tables and storage. This should be executed once when setting up
 * your Supabase project.
 * 
 * Note: These functions require admin privileges and should be executed
 * server-side or in a secure environment, not in the client browser.
 */

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Important: use service role key, not anon key
);

/**
 * Set up storage RLS policies for hotel_documents bucket
 */
export async function setupStorageRLS() {
  // First, make sure the bucket exists and has RLS enabled
  const { data: bucketData, error: bucketError } = await supabaseAdmin
    .storage
    .getBucket('hotel_documents');
  
  if (bucketError) {
    // Bucket doesn't exist, create it
    const { data, error } = await supabaseAdmin
      .storage
      .createBucket('hotel_documents', {
        public: false, // Private bucket
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        fileSizeLimit: 10485760, // 10MB
      });
    
    if (error) {
      console.error('Error creating bucket:', error);
      throw error;
    }
  }
    // Enable RLS on the bucket
  const { error: updateError } = await supabaseAdmin
    .storage
    .updateBucket('hotel_documents', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      fileSizeLimit: 10485760, // 10MB
    });
  
  if (updateError) {
    console.error('Error updating bucket:', updateError);
    throw updateError;
  }
  
  // Create RLS policies for the bucket
    // 1. Allow hotel admins to read any file in their hotel directory
  await supabaseAdmin.rpc('create_storage_policy', {
    name: 'Hotel Admin Read Policy',
    bucket_id: 'hotel_documents',
    definition: `
      (storage.foldername(name))[1] = 'hotel-' || (
        SELECT hotel_id FROM hotel_admins 
        WHERE user_id = auth.uid() LIMIT 1
      )
    `,
    operation: 'SELECT',
    role: 'authenticated'
  });
  
  // 2. Allow hotel admins to upload to their hotel directory
  await supabaseAdmin.rpc('create_storage_policy', {
    name: 'Hotel Admin Insert Policy',
    bucket_id: 'hotel_documents',
    definition: `
      (storage.foldername(name))[1] = 'hotel-' || (
        SELECT hotel_id FROM hotel_admins 
        WHERE user_id = auth.uid() LIMIT 1
      )
    `,
    operation: 'INSERT',
    role: 'authenticated'
  });
    // 3. Allow hotel admins to delete any file in their hotel directory
  await supabaseAdmin.rpc('create_storage_policy', {
    name: 'Hotel Admin Delete Policy',
    bucket_id: 'hotel_documents',
    definition: `
      (storage.foldername(name))[1] = 'hotel-' || (
        SELECT hotel_id FROM hotel_admins 
        WHERE user_id = auth.uid() LIMIT 1
      )
    `,
    operation: 'DELETE',
    role: 'authenticated'
  });
  
  return {
    success: true,
    message: 'Hotel document storage RLS policies set up successfully'
  };
}

/**
 * Set up database RLS policies for the documents table
 */
export async function setupDocumentsTableRLS() {
  // Execute SQL to set up RLS policies
  const { error: enableRLSError } = await supabaseAdmin.rpc('execute_sql', {
    sql: `
      -- Enable RLS on the documents table
      ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
      
      -- Create policy to allow hotel admins to read documents for their hotel
      CREATE POLICY "Hotel Admins can view their hotel documents" 
      ON documents
      FOR SELECT 
      USING (
        hotel_id IN (
          SELECT hotel_id FROM hotel_admins 
          WHERE user_id = auth.uid()
        )
      );
      
      -- Create policy to allow hotel admins to create documents for their hotel
      CREATE POLICY "Hotel Admins can create documents for their hotel" 
      ON documents
      FOR INSERT 
      WITH CHECK (
        hotel_id IN (
          SELECT hotel_id FROM hotel_admins 
          WHERE user_id = auth.uid()
        )
      );
      
      -- Create policy to allow hotel admins to update their hotel documents
      CREATE POLICY "Hotel Admins can update their hotel documents" 
      ON documents
      FOR UPDATE 
      USING (
        hotel_id IN (
          SELECT hotel_id FROM hotel_admins 
          WHERE user_id = auth.uid()
        )
      );
      
      -- Create policy to allow hotel admins to delete their hotel documents
      CREATE POLICY "Hotel Admins can delete their hotel documents" 
      ON documents
      FOR DELETE 
      USING (
        hotel_id IN (
          SELECT hotel_id FROM hotel_admins 
          WHERE user_id = auth.uid()
        )
      );
    `
  });
  
  if (enableRLSError) {
    console.error('Error setting up documents table RLS:', enableRLSError);
    throw enableRLSError;
  }
  
  return {
    success: true,
    message: 'Documents table RLS policies set up successfully'
  };
}
