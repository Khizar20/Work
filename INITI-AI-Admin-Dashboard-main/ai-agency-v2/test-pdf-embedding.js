const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPDFEmbedding() {
  console.log('🧪 Testing PDF Embedding Generation...');
  
  try {
    // Dynamic imports for ES modules
    const { readPdfText } = await import('pdf-text-reader');
    const { pipeline } = await import('@xenova/transformers');
    
    // 1. Find the uploaded document
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (docError) {
      console.error('❌ Error fetching documents:', docError);
      return;
    }
    
    if (!documents || documents.length === 0) {
      console.log('❌ No documents found in database');
      return;
    }
    
    const document = documents[0];
    console.log('📄 Processing document:', document.title);
    console.log('📁 File URL:', document.file_url);
    console.log('🆔 Document ID:', document.id);
    
    // 2. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('hotel_documents')
      .download(document.file_url);
    
    if (downloadError) {
      console.error('❌ Error downloading file:', downloadError);
      return;
    }
    
    console.log('✅ Downloaded file, size:', fileData.size);
    
    // 3. Write file to temporary location
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join(os.tmpdir(), `pdf-test-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log('💾 Wrote temp file:', tempFilePath);
    
    // 4. Extract text from PDF
    console.log('📖 Extracting text from PDF...');
    const text = await readPdfText({ url: tempFilePath });
    
    console.log('✅ Extracted text length:', text.length);
    console.log('📝 Text preview:', text.substring(0, 200) + '...');
    
    // 5. Generate embedding
    console.log('🧠 Generating embedding...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingTensor = await extractor(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(embeddingTensor.data);
    
    console.log('✅ Generated embedding, dimensions:', embedding.length);
    console.log('🔢 Embedding preview:', embedding.slice(0, 5));
    
    // 6. Store embedding in database
    console.log('💾 Storing embedding in database...');
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        embedding: embedding,
        processed: true
      })
      .eq('id', document.id);
    
    if (updateError) {
      console.error('❌ Error updating document with embedding:', updateError);
    } else {
      console.log('✅ Successfully stored embedding in database!');
    }
    
    // 7. Verify the embedding was stored
    const { data: updatedDoc, error: verifyError } = await supabase
      .from('documents')
      .select('id, title, processed, embedding')
      .eq('id', document.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
    } else {
      console.log('✅ Verification result:');
      console.log('   - Document ID:', updatedDoc.id);
      console.log('   - Title:', updatedDoc.title);
      console.log('   - Processed:', updatedDoc.processed);
      console.log('   - Has embedding:', updatedDoc.embedding ? 'Yes' : 'No');
      if (updatedDoc.embedding) {
        console.log('   - Embedding dimensions:', updatedDoc.embedding.length);
      }
    }
    
    // 8. Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log('🧹 Cleaned up temp file');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPDFEmbedding().then(() => {
  console.log('🏁 Test complete');
}).catch(console.error); 