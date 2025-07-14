/**
 * Test Search Functionality with Your Actual Data
 * Uses your specific hotel_id and document_id from the database
 */

async function testSearchWithYourData() {
  const apiUrl = 'http://localhost:3000/api/search-documents';
  const hotelId = '8a1e6805-9253-4dd5-8893-0de3d7815555';
  const documentId = '26dd134c-7d00-4a73-903b-af507b3cbeb1';
  
  console.log('🧪 Testing Search with Your Actual Data\n');
  console.log('Hotel ID:', hotelId);
  console.log('Document ID:', documentId);
  console.log('Document Title: Hotel grand newwest');
  console.log('File Type: PDF\n');
  
  // Test 1: General search across all hotel documents
  console.log('📋 Test 1: Search for "hotel information" across all documents');
  try {
    const response1 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'hotel information grand newwest',
        hotel_id: hotelId,
        limit: 5,
        match_threshold: 0.1
      })
    });
    
    const result1 = await response1.json();
    console.log('✅ General search results:', {
      success: result1.success,
      count: result1.count,
      search_type: result1.search_type,
      documents: result1.results?.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity?.toFixed(3),
        excerpt: doc.content_excerpt?.substring(0, 100) + '...'
      }))
    });
  } catch (error) {
    console.error('❌ General search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Search within the specific document
  console.log('📋 Test 2: Search within specific document "Hotel grand newwest"');
  try {
    const response2 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'newwest facilities amenities services',
        hotel_id: hotelId,
        document_id: documentId,
        limit: 3,
        match_threshold: 0.05
      })
    });
    
    const result2 = await response2.json();
    console.log('✅ Specific document search results:', {
      success: result2.success,
      count: result2.count,
      search_type: result2.search_type,
      target_document: result2.document_id,
      documents: result2.results?.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity?.toFixed(3),
        file_type: doc.file_type
      }))
    });
  } catch (error) {
    console.error('❌ Specific document search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Search with very low threshold to ensure we get results
  console.log('📋 Test 3: Search with very low threshold for broad results');
  try {
    const response3 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'hotel grand',
        hotel_id: hotelId,
        limit: 5,
        match_threshold: 0.01  // Very low threshold
      })
    });
    
    const result3 = await response3.json();
    console.log('✅ Low threshold search results:', {
      success: result3.success,
      count: result3.count,
      search_type: result3.search_type,
      threshold: 0.01,
      documents: result3.results?.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity?.toFixed(3),
        description: doc.description
      }))
    });
  } catch (error) {
    console.error('❌ Low threshold search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Test multiple documents array (using your document ID)
  console.log('📋 Test 4: Search within multiple documents array');
  try {
    const response4 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'hotel services information',
        hotel_id: hotelId,
        document_ids: [documentId],  // Array with your document ID
        limit: 3,
        match_threshold: 0.1
      })
    });
    
    const result4 = await response4.json();
    console.log('✅ Multiple documents search results:', {
      success: result4.success,
      count: result4.count,
      search_type: result4.search_type,
      target_documents: result4.document_ids,
      documents: result4.results?.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity?.toFixed(3)
      }))
    });
  } catch (error) {
    console.error('❌ Multiple documents search failed:', error.message);
  }
  
  console.log('\n🏁 Testing completed with your actual data!');
}

// Test the database connection and document structure
async function checkDocumentStructure() {
  console.log('🔍 Checking your document structure...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/documents?limit=1');
    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      console.log('📄 Sample document structure:');
      console.log({
        id: doc.id,
        hotel_id: doc.hotel_id,
        title: doc.title,
        file_type: doc.file_type,
        processed: doc.processed,
        has_embedding: !!doc.embedding,
        created_at: doc.created_at
      });
      
      console.log('\n✅ Document structure looks good for search!');
      return true;
    } else {
      console.log('⚠️ No documents found in API response');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check document structure:', error.message);
    return false;
  }
}

// Run comprehensive test
async function runCompleteTest() {
  console.log('🚀 Starting Complete Search Test\n');
  
  const structureOk = await checkDocumentStructure();
  
  if (structureOk) {
    console.log('\n' + '='.repeat(60) + '\n');
    await testSearchWithYourData();
  } else {
    console.log('\n❌ Cannot proceed with search tests due to document structure issues');
  }
}

// Usage instructions
function printInstructions() {
  console.log('\n📚 How to run these tests:');
  console.log('\n1. In browser console:');
  console.log('   fetch("/test-search-with-your-data.js").then(r => r.text()).then(eval);');
  console.log('   runCompleteTest();');
  
  console.log('\n2. Individual tests:');
  console.log('   checkDocumentStructure();');
  console.log('   testSearchWithYourData();');
  
  console.log('\n3. Your data details:');
  console.log('   Hotel ID: 8a1e6805-9253-4dd5-8893-0de3d7815555');
  console.log('   Document ID: 26dd134c-7d00-4a73-903b-af507b3cbeb1');
  console.log('   Document Title: Hotel grand newwest');
}

// Export functions for different environments
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSearchWithYourData = testSearchWithYourData;
  window.checkDocumentStructure = checkDocumentStructure;
  window.runCompleteTest = runCompleteTest;
  window.printInstructions = printInstructions;
  
  console.log('\n🔧 Functions available:');
  console.log('- runCompleteTest()');
  console.log('- testSearchWithYourData()');
  console.log('- checkDocumentStructure()');
  console.log('- printInstructions()');
} else {
  // Node.js environment
  module.exports = {
    testSearchWithYourData,
    checkDocumentStructure,
    runCompleteTest,
    printInstructions
  };
}

// Auto-run if this is the main module
if (typeof window === 'undefined' && require.main === module) {
  runCompleteTest().then(() => {
    printInstructions();
  });
} 