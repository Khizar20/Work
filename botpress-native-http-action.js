// BOTPRESS NATIVE HTTP ACTION - No axios dependency required
// Copy this into your "Debugging Hotel Document Search and Retrieval Action" node

// Get workflow variables with proper fallbacks
const hotel_id = workflow.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
const user_query = workflow.user_query || "default query";

try {
  console.log('🔍 Searching documents for hotel:', hotel_id);
  console.log('📝 User query:', user_query);
  
  // Use Botpress native HTTP client instead of axios
  const response = await bp.http.post('http://localhost:3000/api/botpress-search', {
    query: user_query,
    hotel_id: hotel_id,
    limit: 3
  });
  
  console.log('✅ HTTP Response received');
  console.log('📊 Response data:', JSON.stringify(response, null, 2));
  
  // Extract data from response
  const data = response.data || response;
  
  if (data && data.success && data.results && data.results.length > 0) {
    // Store search results in workflow variables
    workflow.search_results = data.results;
    workflow.documents_found = true;
    workflow.document_count = data.count || data.results.length;
    
    // Create formatted context from document results
    const context = data.results.map((doc: any) => 
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
  }
  
} catch (error: unknown) {
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