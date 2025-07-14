require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getDocumentDetails() {
  try {
    console.log('📋 Getting document details with IDs...');
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, file_url, file_type')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('\n📄 All documents:');
    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   URL: ${doc.file_url}`);
      console.log(`   Type: ${doc.file_type}`);
      console.log('');
    });
    
    // Find the tester document specifically
    const testerDoc = documents.find(doc => doc.title === 'tester');
    if (testerDoc) {
      console.log('🎯 Tester document found:');
      console.log(`   ID: ${testerDoc.id}`);
      console.log(`   URL: ${testerDoc.file_url}`);
      
      // Test signed URL generation for the actual tester document
      console.log('\n🧪 Testing signed URL for tester document...');
      const { data: signedUrl, error: signedError } = await supabase.storage
        .from('hotel_documents')
        .createSignedUrl(testerDoc.file_url, 3600);
      
      if (signedError) {
        console.error('❌ Signed URL error:', signedError);
      } else {
        console.log('✅ Signed URL generated successfully!');
        console.log('🔗 URL:', signedUrl.signedUrl);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getDocumentDetails();
