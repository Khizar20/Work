const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Environment Check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEmbeddingProcess() {
  console.log('\n🧪 Starting Embedding Debug Process...\n');
  
  try {
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful');
    
    // 2. Find the specific document (using the ID you provided)
    console.log('\n2️⃣ Finding specific document...');
    const documentId = 'd2f9b63e-fa72-483b-bf11-80c7e63158b8'; // Your document ID
    
    let documents;
    let docError;
    
    // First try to find the specific document
    const { data: specificDoc, error: specificError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId);
    
    if (specificError) {
      console.log('⚠️ Could not find specific document, trying all documents...');
      // Try to get any documents
      const { data: allDocs, error: allError } = await supabase
        .from('documents')
        .select('*')
        .limit(5);
      
      documents = allDocs;
      docError = allError;
    } else {
      documents = specificDoc;
      docError = specificError;
    }
    
    if (docError) {
      console.error('❌ Error fetching documents:', docError);
      return;
    }
    
    if (!documents || documents.length === 0) {
      console.log('❌ No documents found in database');
      return;
    }
    
    const document = documents[0];
    console.log('✅ Found document:');
    console.log('   - ID:', document.id);
    console.log('   - Title:', document.title);
    console.log('   - File Type:', document.file_type);
    console.log('   - File URL:', document.file_url);
    console.log('   - Processed:', document.processed);
    console.log('   - Has Embedding:', document.embedding ? 'Yes' : 'No');
    
    // 3. Test file download from Supabase Storage
    console.log('\n3️⃣ Testing file download...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('hotel_documents')
      .download(document.file_url);
    
    if (downloadError) {
      console.error('❌ Error downloading file:', downloadError);
      console.log('💡 This might be the issue - file not accessible for processing');
      return;
    }
    
    console.log('✅ File downloaded successfully');
    console.log('   - File size:', fileData.size, 'bytes');
    console.log('   - File type:', fileData.type);
    
    // 4. Test embedding generation with dummy data
    console.log('\n4️⃣ Testing embedding generation...');
    try {
      // Import transformers dynamically
      const { pipeline } = await import('@xenova/transformers');
      
      // Test with simple text first
      const testText = "This is a test document for the hotel management system.";
      console.log('📝 Generating embedding for test text...');
      
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const embeddingTensor = await extractor(testText, { pooling: 'mean', normalize: true });
      const embedding = Array.from(embeddingTensor.data);
      
      console.log('✅ Embedding generated successfully');
      console.log('   - Dimensions:', embedding.length);
      console.log('   - Sample values:', embedding.slice(0, 5));
      
      // 5. Test storing embedding in database
      console.log('\n5️⃣ Testing database storage...');
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          embedding: embedding,
          processed: true,
          description: document.description + ' [DEBUG: Embedding added manually]'
        })
        .eq('id', document.id);
      
      if (updateError) {
        console.error('❌ Error storing embedding:', updateError);
      } else {
        console.log('✅ Embedding stored successfully!');
        
        // Verify storage
        const { data: verifyDoc, error: verifyError } = await supabase
          .from('documents')
          .select('id, title, processed, embedding')
          .eq('id', document.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Error verifying storage:', verifyError);
        } else {
          console.log('✅ Verification successful:');
          console.log('   - Processed:', verifyDoc.processed);
          console.log('   - Has Embedding:', verifyDoc.embedding ? 'Yes' : 'No');
          if (verifyDoc.embedding) {
            console.log('   - Embedding Dimensions:', verifyDoc.embedding.length);
          }
        }
      }
      
    } catch (embeddingError) {
      console.error('❌ Embedding generation failed:', embeddingError);
      console.log('💡 This is likely the root cause of the issue');
    }
    
  } catch (error) {
    console.error('❌ Debug process failed:', error);
  }
}

console.log('🚀 Starting Debug Process...');
debugEmbeddingProcess().then(() => {
  console.log('\n🏁 Debug process complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. If file download failed: Check Supabase Storage bucket permissions');
  console.log('2. If embedding generation failed: There may be a dependency issue');
  console.log('3. If database storage failed: Check the embedding column type');
  console.log('4. If everything worked: The issue is in the upload process timing');
}).catch(console.error); 