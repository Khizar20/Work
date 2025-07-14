// BOTPRESS DEBUG ACTION - Fixed TypeScript errors
// Copy this code into your "Search and Retrieve Hotel Documents" action

try {
  console.log('🔧 DEBUG: Action started');
  
  // Test if basic variables work
  console.log('🔧 DEBUG: Testing workflow variables...');
  console.log('🔧 DEBUG: workflow object exists:', typeof workflow !== 'undefined');
  
  // Set basic variables with error handling
  const hotel_id = (workflow && workflow.hotel_id) ? workflow.hotel_id : "8a1e6805-9253-4dd5-8893-0de3d7815555";
  const user_query = (workflow && workflow.user_query) ? workflow.user_query : "test query";
  
  console.log('🔧 DEBUG: hotel_id =', hotel_id);
  console.log('🔧 DEBUG: user_query =', user_query);
  
  // Test if axios is available
  console.log('🔧 DEBUG: Testing axios...');
  
  try {
    const axios = require('axios');
    console.log('🔧 DEBUG: axios loaded successfully');
    
    // Test the API call
    console.log('🔧 DEBUG: Making API call...');
    
    const response = await axios.post('http://localhost:3000/api/botpress-search', {
      query: user_query,
      hotel_id: hotel_id,
      limit: 3
    });
    
    console.log('🔧 DEBUG: API call successful');
    console.log('🔧 DEBUG: Response status:', response.status);
    console.log('🔧 DEBUG: Response data:', JSON.stringify(response.data, null, 2));
    
    // Set workflow variables
    if (workflow) {
      workflow.documents_found = true;
      workflow.search_context = 'Debug test successful';
      console.log('🔧 DEBUG: Workflow variables set successfully');
    }
    
  } catch (axiosError: unknown) {
    const errorMessage = axiosError instanceof Error ? axiosError.message : String(axiosError);
    console.error('🔧 DEBUG: Axios error:', errorMessage);
    
    if (workflow) {
      workflow.documents_found = false;
      workflow.search_context = 'Axios error: ' + errorMessage;
    }
  }
  
} catch (mainError: unknown) {
  const errorMessage = mainError instanceof Error ? mainError.message : String(mainError);
  const errorStack = mainError instanceof Error ? mainError.stack : 'No stack trace available';
  
  console.error('🔧 DEBUG: Main error:', errorMessage);
  console.error('🔧 DEBUG: Error stack:', errorStack);
  
  // Try to set error state
  try {
    if (workflow) {
      workflow.documents_found = false;
      workflow.search_context = 'Main error: ' + errorMessage;
    }
  } catch (workflowError: unknown) {
    const workflowErrorMessage = workflowError instanceof Error ? workflowError.message : String(workflowError);
    console.error('🔧 DEBUG: Cannot access workflow:', workflowErrorMessage);
  }
} 