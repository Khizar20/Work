const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rrkqxfnvvxwgfxfnrcyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya3F4Zm52dnh3Z2Z4Zm5yY3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMjU2NiwiZXhwIjoyMDUwMTA4NTY2fQ.T8f3z3Z8kFJZc0q8u8G7H1TYZ4fqFo4VQ2NvE8VeGjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugStorageIssue() {
  try {
    console.log('🔍 Debugging storage issue...');

    // Check bucket info
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    
    const hotelDocsBucket = buckets.find(b => b.name === 'hotel_documents');
    console.log('📦 Hotel documents bucket:', hotelDocsBucket);

    // List files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from('hotel_documents')
      .list('');
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
    } else {
      console.log('📄 Root level files/folders:', files);
    }

    // Try to list files in the specific hotel folder
    const hotelId = '8a1e6805-9253-4dd5-8893-0de3d7815555';
    const { data: hotelFiles, error: hotelListError } = await supabase.storage
      .from('hotel_documents')
      .list(`hotel-${hotelId}`);
    
    if (hotelListError) {
      console.error('❌ Error listing hotel files:', hotelListError);
    } else {
      console.log(`📄 Files in hotel-${hotelId}:`, hotelFiles);
    }

    // Try to create a signed URL for the specific file
    const filePath = 'hotel-8a1e6805-9253-4dd5-8893-0de3d7815555/aeda4b40-7416-4a06-88bc-f0d802c4b098.pdf';
    console.log('🔗 Attempting to create signed URL for:', filePath);
    
    const { data: signedUrl, error: signedError } = await supabase.storage
      .from('hotel_documents')
      .createSignedUrl(filePath, 3600);
    
    if (signedError) {
      console.error('❌ Error creating signed URL:', signedError);
    } else {
      console.log('✅ Signed URL created:', signedUrl.signedUrl);
    }

    // Try to get file info
    const { data: fileInfo, error: infoError } = await supabase.storage
      .from('hotel_documents')
      .getPublicUrl(filePath);
    
    if (infoError) {
      console.error('❌ Error getting file info:', infoError);
    } else {
      console.log('📋 File public URL:', fileInfo.publicUrl);
    }

  } catch (err) {
    console.error('💥 Caught error:', err);
  }
}

debugStorageIssue();
