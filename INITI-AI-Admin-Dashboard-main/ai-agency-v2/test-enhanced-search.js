/**
 * Test Enhanced Search Functionality
 * Tests the updated search_documents functions that can use both hotel_id and id columns
 */

async function testEnhancedSearch() {
  const apiUrl = 'http://localhost:3000/api/search-documents';
  const hotelId = '8a1e6805-9253-4dd5-8893-0de3d7815555';
  
  console.log('🧪 Testing Enhanced Document Search Functionality\n');
  
  // Test 1: General search (all documents in hotel)
  console.log('📋 Test 1: General search across all hotel documents');
  try {
    const response1 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'hotel amenities and facilities',
        hotel_id: hotelId,
        limit: 3
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
        similarity: doc.similarity
      }))
    });
  } catch (error) {
    console.error('❌ General search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Search within specific document ID
  console.log('📋 Test 2: Search within specific document ID');
  try {
    // First get a document ID from the general search or database
    const docsResponse = await fetch('http://localhost:3000/api/documents?limit=1');
    const docsData = await docsResponse.json();
    
    if (docsData.documents && docsData.documents.length > 0) {
      const documentId = docsData.documents[0].id;
      console.log('🎯 Targeting document:', documentId);
      
      const response2 = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'service information',
          hotel_id: hotelId,
          document_id: documentId,
          limit: 2
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
          similarity: doc.similarity
        }))
      });
    } else {
      console.log('⚠️ No documents found to test specific document search');
    }
  } catch (error) {
    console.error('❌ Specific document search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Search within multiple document IDs
  console.log('📋 Test 3: Search within multiple document IDs');
  try {
    // Get multiple document IDs
    const docsResponse = await fetch('http://localhost:3000/api/documents?limit=3');
    const docsData = await docsResponse.json();
    
    if (docsData.documents && docsData.documents.length > 1) {
      const documentIds = docsData.documents.slice(0, 2).map(doc => doc.id);
      console.log('🎯 Targeting documents:', documentIds);
      
      const response3 = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'policies and procedures',
          hotel_id: hotelId,
          document_ids: documentIds,
          limit: 3
        })
      });
      
      const result3 = await response3.json();
      console.log('✅ Multiple documents search results:', {
        success: result3.success,
        count: result3.count,
        search_type: result3.search_type,
        target_documents: result3.document_ids,
        documents: result3.results?.map(doc => ({
          id: doc.id,
          title: doc.title,
          similarity: doc.similarity
        }))
      });
    } else {
      console.log('⚠️ Not enough documents found to test multiple document search');
    }
  } catch (error) {
    console.error('❌ Multiple documents search failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Test with custom threshold
  console.log('📋 Test 4: Search with custom similarity threshold');
  try {
    const response4 = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'restaurant menu dining',
        hotel_id: hotelId,
        match_threshold: 0.05, // Very low threshold for more results
        limit: 5
      })
    });
    
    const result4 = await response4.json();
    console.log('✅ Custom threshold search results:', {
      success: result4.success,
      count: result4.count,
      search_type: result4.search_type,
      threshold_used: 0.05,
      documents: result4.results?.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity?.toFixed(3)
      }))
    });
  } catch (error) {
    console.error('❌ Custom threshold search failed:', error.message);
  }
  
  console.log('\n🏁 Enhanced search testing completed!');
}

// Usage examples for different scenarios
function printUsageExamples() {
  console.log('\n📚 Usage Examples for Enhanced Search:');
  console.log('\n1. General search (all hotel documents):');
  console.log(`
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'hotel amenities',
    hotel_id: 'your-hotel-id',
    limit: 5
  })
});`);

  console.log('\n2. Search within specific document:');
  console.log(`
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'room service menu',
    hotel_id: 'your-hotel-id',
    document_id: 'specific-document-id',
    limit: 3
  })
});`);

  console.log('\n3. Search within multiple documents:');
  console.log(`
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'policies and procedures',
    hotel_id: 'your-hotel-id',
    document_ids: ['doc-id-1', 'doc-id-2', 'doc-id-3'],
    limit: 5
  })
});`);

  console.log('\n4. Search with custom similarity threshold:');
  console.log(`
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'spa services',
    hotel_id: 'your-hotel-id',
    match_threshold: 0.2,  // Higher threshold for more precise results
    limit: 3
  })
});`);
}

// If running in browser, expose functions globally
if (typeof window !== 'undefined') {
  window.testEnhancedSearch = testEnhancedSearch;
  window.printUsageExamples = printUsageExamples;
  console.log('\n🔧 Functions available: testEnhancedSearch(), printUsageExamples()');
}

// If running in Node.js, execute directly
if (typeof window === 'undefined' && require.main === module) {
  testEnhancedSearch().then(() => {
    printUsageExamples();
  });
}

module.exports = { testEnhancedSearch, printUsageExamples }; 