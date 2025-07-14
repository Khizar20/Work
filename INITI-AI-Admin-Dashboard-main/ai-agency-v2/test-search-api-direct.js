/**
 * Direct API Test for Enhanced Search Functionality
 * This provides curl commands and browser testing for your actual data
 */

// Your actual data from the database
const YOUR_DATA = {
  hotelId: '8a1e6805-9253-4dd5-8893-0de3d7815555',
  documentId: '26dd134c-7d00-4a73-903b-af507b3cbeb1',
  documentTitle: 'Hotel grand newwest',
  fileType: 'pdf'
};

console.log('🧪 Enhanced Search API Testing Guide\n');
console.log('Your Data:');
console.log('- Hotel ID:', YOUR_DATA.hotelId);
console.log('- Document ID:', YOUR_DATA.documentId);
console.log('- Document Title:', YOUR_DATA.documentTitle);
console.log('- File Type:', YOUR_DATA.fileType);

console.log('\n' + '='.repeat(70));
console.log('📋 CURL COMMANDS FOR TESTING');
console.log('='.repeat(70));

console.log('\n1️⃣ Test General Search (All Hotel Documents):');
console.log(`
curl -X POST http://localhost:3000/api/search-documents \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "hotel information grand newwest",
    "hotel_id": "${YOUR_DATA.hotelId}",
    "limit": 5,
    "match_threshold": 0.1
  }'`);

console.log('\n2️⃣ Test Specific Document Search (Using both hotel_id and id):');
console.log(`
curl -X POST http://localhost:3000/api/search-documents \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "newwest facilities amenities services",
    "hotel_id": "${YOUR_DATA.hotelId}",
    "document_id": "${YOUR_DATA.documentId}",
    "limit": 3,
    "match_threshold": 0.05
  }'`);

console.log('\n3️⃣ Test Multiple Documents Search:');
console.log(`
curl -X POST http://localhost:3000/api/search-documents \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "hotel services information",
    "hotel_id": "${YOUR_DATA.hotelId}",
    "document_ids": ["${YOUR_DATA.documentId}"],
    "limit": 3,
    "match_threshold": 0.1
  }'`);

console.log('\n4️⃣ Test with Very Low Threshold (Should return results):');
console.log(`
curl -X POST http://localhost:3000/api/search-documents \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "hotel",
    "hotel_id": "${YOUR_DATA.hotelId}",
    "limit": 5,
    "match_threshold": 0.01
  }'`);

console.log('\n' + '='.repeat(70));
console.log('🌐 BROWSER TESTING (Recommended)');
console.log('='.repeat(70));

console.log('\n1. Open your browser and go to: http://localhost:3000');
console.log('2. Open Developer Console (F12)');
console.log('3. Copy and paste these commands one by one:\n');

// Browser test functions
const browserTestCode = `
// Test 1: General search
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'hotel information grand newwest',
    hotel_id: '${YOUR_DATA.hotelId}',
    limit: 5,
    match_threshold: 0.1
  })
}).then(r => r.json()).then(data => {
  console.log('✅ General Search Results:', data);
  console.log('Count:', data.count);
  console.log('Search Type:', data.search_type);
  if (data.results) {
    data.results.forEach(doc => {
      console.log(\`- \${doc.title} (similarity: \${doc.similarity?.toFixed(3)})\`);
    });
  }
});

// Test 2: Specific document search (uses both hotel_id and id)
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'newwest facilities amenities services',
    hotel_id: '${YOUR_DATA.hotelId}',
    document_id: '${YOUR_DATA.documentId}',
    limit: 3,
    match_threshold: 0.05
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Specific Document Search Results:', data);
  console.log('Count:', data.count);
  console.log('Search Type:', data.search_type);
  console.log('Target Document:', data.document_id);
  if (data.results) {
    data.results.forEach(doc => {
      console.log(\`- \${doc.title} (similarity: \${doc.similarity?.toFixed(3)})\`);
    });
  }
});

// Test 3: Multiple documents search
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'hotel services information',
    hotel_id: '${YOUR_DATA.hotelId}',
    document_ids: ['${YOUR_DATA.documentId}'],
    limit: 3,
    match_threshold: 0.1
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Multiple Documents Search Results:', data);
  console.log('Count:', data.count);
  console.log('Search Type:', data.search_type);
  console.log('Target Documents:', data.document_ids);
  if (data.results) {
    data.results.forEach(doc => {
      console.log(\`- \${doc.title} (similarity: \${doc.similarity?.toFixed(3)})\`);
    });
  }
});

// Test 4: Low threshold search (should definitely return results)
fetch('/api/search-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'hotel',
    hotel_id: '${YOUR_DATA.hotelId}',
    limit: 5,
    match_threshold: 0.01
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Low Threshold Search Results:', data);
  console.log('Count:', data.count);
  console.log('Search Type:', data.search_type);
  if (data.results) {
    data.results.forEach(doc => {
      console.log(\`- \${doc.title} (similarity: \${doc.similarity?.toFixed(3)})\`);
    });
  }
});
`;

console.log(browserTestCode);

console.log('\n' + '='.repeat(70));
console.log('🔍 WHAT TO EXPECT');
console.log('='.repeat(70));

console.log('\n✅ Success Response Format:');
console.log(`{
  "success": true,
  "query": "your search query",
  "hotel_id": "${YOUR_DATA.hotelId}",
  "document_id": "${YOUR_DATA.documentId}" (if specific document search),
  "results": [
    {
      "id": "${YOUR_DATA.documentId}",
      "title": "${YOUR_DATA.documentTitle}",
      "description": "information",
      "file_type": "${YOUR_DATA.fileType}",
      "similarity": 0.123,
      "content_excerpt": "Preview of document content..."
    }
  ],
  "count": 1,
  "search_type": "single_document" | "multiple_documents" | "all_documents"
}`);

console.log('\n❌ If you get errors:');
console.log('- Make sure your development server is running: npm run dev');
console.log('- Make sure you\'re logged in to the application');
console.log('- Check that the document has embeddings processed');
console.log('- Try lowering the match_threshold to 0.01');

console.log('\n🎯 Key Features Being Tested:');
console.log('✅ hotel_id filtering (security - only your hotel documents)');
console.log('✅ id column filtering (precision - specific document targeting)');
console.log('✅ Vector similarity search with embeddings');
console.log('✅ Multiple search modes (all docs, single doc, multiple docs)');
console.log('✅ Configurable similarity thresholds');

console.log('\n🚀 Next Steps After Testing:');
console.log('1. If tests work: You can use the API in your Botpress chatbot');
console.log('2. If tests fail: Check the troubleshooting section above');
console.log('3. For production: Update API URLs to your deployed domain');

// Export the test data for reuse
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { YOUR_DATA, browserTestCode };
} 