// Test script to verify upload functionality after Next.js 15 compatibility fixes
// Run this in browser console after logging into the application

async function testUploadEndpoint() {
  console.log('🧪 Testing Upload Endpoint...');
  
  try {
    // Test 1: Check if upload endpoint responds without cookies error
    console.log('1. Testing basic endpoint response...');
    
    const formData = new FormData();
    
    // Create a simple test file
    const testFile = new File(['Hello World Test Content'], 'test-upload.txt', {
      type: 'text/plain'
    });
    
    formData.append('file', testFile);
    formData.append('title', 'Test Upload Document');
    formData.append('description', 'Testing upload functionality after Next.js 15 fixes');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('📊 Upload Response:', {
      status: response.status,
      statusText: response.statusText,
      body: result
    });
    
    // Test 2: Check if we get proper error messages (not cookie errors)
    if (response.status === 401) {
      console.log('✅ Got 401 Unauthorized - this is expected if not logged in');
      console.log('🔍 Error message:', result.error);
      
      if (result.error.includes('cookies()')) {
        console.error('❌ FAILED: Still getting cookies() error');
        return false;
      } else {
        console.log('✅ SUCCESS: No more cookies() errors!');
      }
    } else if (response.status === 403) {
      console.log('✅ Got 403 Forbidden - this means auth works, just need hotel admin setup');
      console.log('🔍 Error message:', result.error);
    } else if (response.status === 200) {
      console.log('🎉 SUCCESS: Upload worked completely!');
      console.log('📄 Document ID:', result.documentId);
    } else {
      console.log('📝 Other response:', response.status, result);
    }
    
    // Test 3: Check for JSON parse errors
    if (result.error && result.error.includes('Failed to parse cookie string')) {
      console.error('❌ FAILED: Still getting JSON parse errors');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    // Check if it's the old cookies error
    if (error.message.includes('cookies().get')) {
      console.error('❌ CRITICAL: Still getting the cookies().get error');
      return false;
    }
    
    return false;
  }
}

async function testAuthState() {
  console.log('🔐 Testing Auth State...');
  
  try {
    const response = await fetch('/api/test-connection');
    const result = await response.json();
    
    console.log('📊 Auth Test:', {
      status: response.status,
      authenticated: result.authenticated,
      error: result.error
    });
    
    return result.authenticated;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

// Main test function
async function runUploadTests() {
  console.log('🚀 Starting Upload Functionality Tests...');
  console.log('=====================================');
  
  // Test auth first
  const isAuthenticated = await testAuthState();
  console.log('\n');
  
  // Test upload endpoint
  const uploadWorks = await testUploadEndpoint();
  console.log('\n');
  
  // Summary
  console.log('📋 TEST SUMMARY:');
  console.log('================');
  console.log(`🔐 Authentication: ${isAuthenticated ? '✅ Working' : '❌ Not logged in'}`);
  console.log(`📤 Upload Endpoint: ${uploadWorks ? '✅ Fixed' : '❌ Still broken'}`);
  
  if (uploadWorks) {
    console.log('\n🎉 SUCCESS: The Next.js 15 cookies() fix is working!');
    if (!isAuthenticated) {
      console.log('💡 Next step: Log in and ensure you have hotel admin access');
    }
  } else {
    console.log('\n❌ FAILED: Upload endpoint still has issues');
  }
  
  return { isAuthenticated, uploadWorks };
}

// Auto-run the test
console.log('Copy and paste this into your browser console to test:');
console.log('runUploadTests()');

// Export for manual testing
window.runUploadTests = runUploadTests;
