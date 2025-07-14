// Test script to debug document upload issues
// Run this in browser console while logged in to the dashboard

async function testDocumentUpload() {
  console.log('🔍 Testing document upload flow...');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('\n📝 Step 1: Checking authentication...');
    const authResponse = await fetch('/api/debug-profile', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!authResponse.ok) {
      console.error('❌ Authentication failed:', authResponse.status);
      return;
    }
    
    const authData = await authResponse.json();
    console.log('✅ Authentication successful:', authData);
    
    // Test 2: Create a simple test file
    console.log('\n📝 Step 2: Creating test file...');
    const testFileContent = 'This is a test document for upload';
    const testFile = new File([testFileContent], 'test-document.txt', {
      type: 'text/plain'
    });
    console.log('✅ Test file created:', testFile.name, testFile.size, 'bytes');
    
    // Test 3: Prepare form data
    console.log('\n📝 Step 3: Preparing upload data...');
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('title', 'Test Document Upload');
    formData.append('description', 'This is a test document to verify upload functionality');
    
    // Test 4: Attempt upload
    console.log('\n📝 Step 4: Attempting upload...');
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
    const uploadData = await uploadResponse.json();
    console.log('📊 Upload response data:', uploadData);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      return uploadData;
    } else {
      console.error('❌ Upload failed:', uploadData);
      
      // Additional debugging for authorization errors
      if (uploadResponse.status === 401) {
        console.log('\n🔍 401 Unauthorized - Checking session...');
        // Try to get session info
        try {
          const sessionCheck = await fetch('/api/debug-profile');
          const sessionData = await sessionCheck.json();
          console.log('Session data:', sessionData);
        } catch (e) {
          console.log('Could not check session:', e);
        }
      }
      
      if (uploadResponse.status === 403) {
        console.log('\n🔍 403 Forbidden - User not hotel admin');
        console.log('This means the user is authenticated but not associated with a hotel');
        console.log('Run the hotel assignment SQL script to fix this');
      }
      
      return null;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return null;
  }
}

// Also test basic Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // This should work if Supabase is configured correctly
    const response = await fetch('/api/test-connection');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Supabase connection successful:', data);
    } else {
      console.error('❌ Supabase connection failed:', data);
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
  }
}

// Run both tests
console.log('🚀 Starting document upload debugging...');
testSupabaseConnection().then(() => {
  return testDocumentUpload();
}).then((result) => {
  if (result) {
    console.log('\n🎉 All tests completed successfully!');
  } else {
    console.log('\n💥 Tests completed with errors. Check the logs above.');
  }
});
