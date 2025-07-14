const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rrkqxfnvvxwgfxfnrcyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya3F4Zm52dnh3Z2Z4Zm5yY3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMjU2NiwiZXhwIjoyMDUwMTA4NTY2fQ.T8f3z3Z8kFJZc0q8u8G7H1TYZ4fqFo4VQ2NvE8VeGjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStorageBucket() {
  try {
    console.log('🔍 Checking storage bucket...');

    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('📦 Existing buckets:', buckets.map(b => b.name));
    
    const bucketExists = buckets.some(bucket => bucket.name === 'hotel_documents');
    
    if (!bucketExists) {
      console.log('🏗️ Creating hotel_documents bucket...');
      const { data, error } = await supabase.storage.createBucket('hotel_documents', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }
      
      console.log('✅ Bucket created successfully:', data);
    } else {
      console.log('✅ Bucket already exists');
    }

    // Test bucket access
    console.log('🧪 Testing bucket access...');
    const { data: files, error: listFilesError } = await supabase.storage
      .from('hotel_documents')
      .list();
    
    if (listFilesError) {
      console.error('❌ Error accessing bucket:', listFilesError);
    } else {
      console.log('✅ Bucket accessible, files:', files?.length || 0);
    }

  } catch (err) {
    console.error('Caught error:', err);
  }
}

fixStorageBucket();
