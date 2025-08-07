// Fix existing document by extracting and storing PDF content
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const supabaseUrl = 'https://aqfqfzaqeprxtxkihprp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExistingDocument() {
  console.log('🔧 Fixing existing document content...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const documentId = "a32f233a-b291-4b2c-9379-4d21a1bb7cad";
  
  try {
    // 1. Get the document info
    console.log('1️⃣ Getting document info...');
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      console.error('❌ Error getting document:', docError);
      return;
    }
    
    console.log('📄 Document found:', document.title);
    console.log('📁 File URL:', document.file_url);
    
    // 2. Download the PDF file
    console.log('\n2️⃣ Downloading PDF file...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('hotel_documents')
      .download(document.file_url);
    
    if (downloadError) {
      console.error('❌ Error downloading file:', downloadError);
      return;
    }
    
    console.log('✅ PDF downloaded, size:', fileData.size);
    
    // 3. Write to temporary file
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join(os.tmpdir(), `fix-pdf-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);
    console.log('💾 Temporary file created:', tempFilePath);
    
    // 4. Extract text from PDF using PDFParser
    console.log('\n3️⃣ Extracting text from PDF...');
    const PDFParser = require('pdf2json');
    
    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Extract text from PDF data
          const textContent = pdfData.Pages?.map((page) => 
            page.Texts?.map((text) => 
              decodeURIComponent(text.R?.[0]?.T || '')
            ).join(' ')
          ).join(' ') || '';
          
          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.loadPDF(tempFilePath);
    });
    
    console.log('✅ Text extracted, length:', text.length);
    console.log('📝 Text preview:', text.substring(0, 200) + '...');
    
    // 5. Store the content in database
    console.log('\n4️⃣ Storing content in database...');
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        content: text
      })
      .eq('id', documentId);
    
    if (updateError) {
      console.error('❌ Error updating document with content:', updateError);
    } else {
      console.log('✅ Content stored successfully!');
    }
    
    // 6. Clean up temporary file
    fs.unlinkSync(tempFilePath);
    console.log('🧹 Temporary file cleaned up');
    
    // 7. Verify the update
    console.log('\n5️⃣ Verifying the update...');
    const { data: updatedDoc, error: verifyError } = await supabase
      .from('documents')
      .select('id, title, content')
      .eq('id', documentId)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
    } else {
      console.log('✅ Verification successful!');
      console.log('📄 Document ID:', updatedDoc.id);
      console.log('📝 Title:', updatedDoc.title);
      console.log('📊 Content length:', updatedDoc.content?.length || 0);
      console.log('📖 Content preview:', updatedDoc.content?.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixExistingDocument(); 