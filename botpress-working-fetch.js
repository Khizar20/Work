// BOTPRESS WORKING ACTION - Standard fetch only
// Copy this into your "Debugging Hotel Document Search and Retrieval Action" node

// Get workflow variables
const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
const user_query = workflow.user_query || "default query";

try {
  console.log('🔍 Searching documents for hotel:', hotel_id);
  console.log('📝 User query:', user_query);
  
  // Use standard fetch API
  const response = await fetch('http://localhost:3000/api/botpress-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: user_query,
      hotel_id: hotel_id,
      limit: 3
    })
  });
  
  console.log('✅ Fetch response received');
  console.log('📊 Response status:', response.status);
  console.log('📊 Response ok:', response.ok);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ JSON parsed successfully');
  console.log('📊 Response data:', JSON.stringify(data, null, 2));
  
  if (data && data.success && data.results && data.results.length > 0) {
    // Store search results in workflow variables
    workflow.search_results = data.results;
    workflow.documents_found = true;
    workflow.document_count = data.count || data.results.length;
    
    // Create formatted context from document results
    const context = data.results.map((doc) => 
      `📄 ${doc.title}: ${doc.content}`
    ).join('\n\n');
    
    workflow.search_context = context;
    console.log('✅ Context created, length:', context.length);
    console.log('📄 Documents found:', data.results.length);
    
  } else {
    // No documents found
    workflow.search_results = [];
    workflow.documents_found = false;
    workflow.document_count = 0;
    workflow.search_context = 'No relevant hotel documents found for this query.';
    console.log('❌ No documents found for query:', user_query);
    console.log('❌ Data received:', JSON.stringify(data, null, 2));
  }
  
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
  
  console.error('❌ Document search error:', errorMessage);
  console.error('❌ Error stack:', errorStack);
  
  // Set error state in workflow variables
  workflow.search_results = [];
  workflow.documents_found = false;
  workflow.document_count = 0;
  workflow.search_context = 'Unable to search hotel documents at this time. Please try again later.';
} 