// Test the fixed endpoint with the actual document data
async function testFixedEndpoint() {
  console.log('🔧 Testing FIXED Botpress endpoint...\n');
  console.log('📄 Expected document: "Hotel grand newwest"');
  console.log('🆔 Document ID: 26dd134c-7d00-4a73-903b-af507b3cbeb1');
  console.log('🏨 Hotel ID: 8a1e6805-9253-4dd5-8893-0de3d7815555\n');
  
  const apiUrl = 'http://localhost:3000/api/botpress-search-fixed';
  
  const testCases = [
    { query: "", description: "Get all documents (should find Hotel grand newwest)" },
    { query: "hotel", description: "Search for 'hotel'" },
    { query: "grand", description: "Search for 'grand'" },
    { query: "newwest", description: "Search for 'newwest'" },
    { query: "information", description: "Search for 'information' (description)" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.description}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          limit: 10
        })
      });
      
      if (!response.ok) {
        console.log(`❌ API Error (${response.status}):`, await response.text());
        continue;
      }
      
      const result = await response.json();
      console.log(`📊 Results: ${result.count} found`);
      console.log(`📝 Message: ${result.message}`);
      
      if (result.debug) {
        console.log(`🔍 Debug info:`, result.debug);
      }
      
      if (result.results && result.results.length > 0) {
        console.log('🎉 SUCCESS! Found documents:');
        result.results.forEach((doc, i) => {
          console.log(`   ${i + 1}. "${doc.title}"`);
          console.log(`      Content: "${doc.content}"`);
          console.log(`      Type: ${doc.type}`);
          console.log(`      ID: ${doc.id}`);
        });
        
        // Check if we found our expected document
        const foundExpected = result.results.find(doc => doc.title === "Hotel grand newwest");
        if (foundExpected) {
          console.log('✅ FOUND EXPECTED DOCUMENT: "Hotel grand newwest"!');
        }
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error in ${testCase.description}:`, error.message);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('If we found the "Hotel grand newwest" document, the endpoint is working!');
  console.log('If not, there might be RLS (Row Level Security) policies blocking access.');
}

// Run the test
testFixedEndpoint(); 