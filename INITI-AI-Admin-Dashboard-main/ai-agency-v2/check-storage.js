require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Checking storage bucket configuration...');

async function checkStorageConfig() {
  try {
    // Check bucket details
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const hotelDocsBucket = buckets.find(b => b.name === 'hotel_documents');
    if (!hotelDocsBucket) {
      console.error('❌ hotel_documents bucket not found');
      return;
    }
    
    console.log('📦 Bucket details:', {
      name: hotelDocsBucket.name,
      public: hotelDocsBucket.public,
      file_size_limit: hotelDocsBucket.file_size_limit,
      allowed_mime_types: hotelDocsBucket.allowed_mime_types
    });
    
    // List actual files in storage
    console.log('\n📁 Listing files in storage...');
    const { data: files, error: filesError } = await supabase.storage
      .from('hotel_documents')
      .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log('Files found:', files?.length || 0);
      files?.forEach(file => {
        console.log('  -', file.name, file.metadata?.size, 'bytes');
      });
    }
    
    // Try to list hotel-specific folders
    console.log('\n🏨 Checking hotel-specific folders...');
    const { data: folders, error: foldersError } = await supabase.storage
      .from('hotel_documents')
      .list('hotel-8a1e6805-9253-4dd5-8893-0de3d7815555', { limit: 10 });
    
    if (foldersError) {
      console.log('❌ hotel- prefix folder not found:', foldersError.message);
    } else {
      console.log('✅ hotel- prefix folder found with', folders?.length || 0, 'files');
      folders?.forEach(file => {
        console.log('  -', file.name);
      });
    }
    
    // Try alternative folder structure
    const { data: folders2, error: foldersError2 } = await supabase.storage
      .from('hotel_documents')
      .list('8a1e6805-9253-4dd5-8893-0de3d7815555', { limit: 10 });
    
    if (foldersError2) {
      console.log('❌ Direct hotel ID folder not found:', foldersError2.message);
    } else {
      console.log('✅ Direct hotel ID folder found with', folders2?.length || 0, 'files');
      folders2?.forEach(file => {
        console.log('  -', file.name);
      });
    }
    
    // Check database records
    console.log('\n💾 Checking database records...');
    const { data: dbDocs, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .limit(5);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
    } else {
      console.log('Documents in database:', dbDocs?.length || 0);
      dbDocs?.forEach(doc => {
        console.log('  -', doc.title, 'Path:', doc.file_path);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStorageConfig();
