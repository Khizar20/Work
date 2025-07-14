require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanupDocuments() {
  try {
    console.log('🧹 Starting document cleanup and fix...');
    
    // Step 1: Get all documents from database
    console.log('\n📋 Step 1: Getting all documents...');
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (docsError) {
      console.error('❌ Error getting documents:', docsError);
      return;
    }
    
    console.log(`Found ${documents.length} documents in database`);
    
    // Step 2: Get all actual files in storage
    console.log('\n📁 Step 2: Getting all files in storage...');
    const { data: files, error: filesError } = await supabase.storage
      .from('hotel_documents')
      .list('hotel-8a1e6805-9253-4dd5-8893-0de3d7815555');
    
    if (filesError) {
      console.error('❌ Error getting files:', filesError);
      return;
    }
    
    console.log(`Found ${files.length} files in storage:`, files.map(f => f.name));
    
    // Step 3: Process each document
    console.log('\n🔧 Step 3: Processing documents...');
    
    for (const doc of documents) {
      console.log(`\n📄 Processing: ${doc.title} (ID: ${doc.id})`);
      console.log(`   Current URL: ${doc.file_url}`);
      
      // Check if this document has a corresponding file in storage
      let matchingFile = null;
      
      // Try to find matching file by title/name patterns
      const titleSlug = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const fileSlug = fileName.replace(/[^a-z0-9]/g, '');
        
        // Check various matching patterns
        if (fileName.includes(titleSlug) || 
            fileSlug.includes(titleSlug) ||
            titleSlug.includes(fileSlug) ||
            doc.title.toLowerCase() === 'tester') {
          matchingFile = file;
          break;
        }
      }
      
      if (matchingFile) {
        // Update the document with the correct file path
        const correctPath = `hotel-8a1e6805-9253-4dd5-8893-0de3d7815555/${matchingFile.name}`;
        console.log(`   ✅ Found matching file: ${matchingFile.name}`);
        console.log(`   🔧 Updating to: ${correctPath}`);
        
        const { error: updateError } = await supabase
          .from('documents')
          .update({ file_url: correctPath })
          .eq('id', doc.id);
        
        if (updateError) {
          console.error(`   ❌ Update failed:`, updateError);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      } else if (doc.file_url.includes('your-storage-url.com')) {
        // This is a placeholder document with no real file
        console.log(`   ❌ No matching file found (placeholder document)`);
        console.log(`   🗑️ Marking for deletion...`);
        
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id);
        
        if (deleteError) {
          console.error(`   ❌ Delete failed:`, deleteError);
        } else {
          console.log(`   ✅ Deleted successfully`);
        }
      } else {
        console.log(`   ⚠️ Has real path but no matching file found`);
      }
    }
    
    // Step 4: Show final state
    console.log('\n📊 Step 4: Final state...');
    const { data: finalDocs } = await supabase
      .from('documents')
      .select('id, title, file_url, file_type')
      .order('created_at', { ascending: false });
    
    console.log(`\n✅ Final document count: ${finalDocs?.length || 0}`);
    finalDocs?.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Path: ${doc.file_url}`);
    });
    
    console.log('\n🎉 Document cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

cleanupDocuments();
