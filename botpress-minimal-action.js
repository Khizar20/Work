// BOTPRESS MINIMAL ACTION - Fixed TypeScript errors
// Use this if the debug version also fails

try {
  console.log('🧪 MINIMAL TEST: Starting...');
  
  // Test basic workflow access
  if (typeof workflow === 'undefined') {
    console.error('🧪 MINIMAL TEST: workflow is undefined!');
    throw new Error('workflow object not available');
  }
  
  console.log('🧪 MINIMAL TEST: workflow object exists');
  
  // Test getting variables
  const hotel_id = workflow.hotel_id || "default-hotel-id";
  const user_query = workflow.user_query || "default-query";
  
  console.log('🧪 MINIMAL TEST: hotel_id =', hotel_id);
  console.log('🧪 MINIMAL TEST: user_query =', user_query);
  
  // Test setting variables
  workflow.documents_found = true;
  workflow.search_context = 'Minimal test successful - no API call made';
  workflow.document_count = 1;
  workflow.search_results = [{ title: 'Test Document', content: 'This is a test' }];
  
  console.log('🧪 MINIMAL TEST: Variables set successfully');
  console.log('🧪 MINIMAL TEST: documents_found =', workflow.documents_found);
  
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
  
  console.error('🧪 MINIMAL TEST: Error:', errorMessage);
  console.error('🧪 MINIMAL TEST: Stack:', errorStack);
  
  // Last resort - try to set basic error state
  try {
    workflow.documents_found = false;
    workflow.search_context = 'Error: ' + errorMessage;
  } catch (finalError: unknown) {
    const finalErrorMessage = finalError instanceof Error ? finalError.message : String(finalError);
    console.error('🧪 MINIMAL TEST: Cannot set workflow variables:', finalErrorMessage);
  }
} 