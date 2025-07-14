// Quick fix script for hotel admin assignment
// Paste this into your browser console after logging into the application

async function fixHotelAdminAssignment() {
  console.log('🔧 Starting Hotel Admin Assignment Fix...');
  console.log('=====================================');
  
  try {
    // Step 1: Check current status
    console.log('1. Checking current hotel admin status...');
    const statusResponse = await fetch('/api/fix-hotel-admin', {
      method: 'GET'
    });
    
    const status = await statusResponse.json();
    console.log('📊 Current Status:', status);
    
    if (status.hasHotelAdmin) {
      console.log('✅ You already have hotel admin access!');
      console.log('🏨 Hotel:', status.hotel?.name);
      console.log('🔑 Role:', status.hotelAdmin?.role);
      
      // Test upload after confirming admin access
      console.log('\n2. Testing upload functionality...');
      await testUpload();
      return;
    }
    
    console.log('❌ No hotel admin access found. Fixing...');
    
    // Step 2: Fix the hotel admin assignment
    console.log('\n2. Creating hotel admin assignment...');
    const fixResponse = await fetch('/api/fix-hotel-admin', {
      method: 'POST'
    });
    
    const result = await fixResponse.json();
    console.log('📊 Fix Result:', result);
    
    if (result.success) {
      console.log('🎉 SUCCESS: Hotel admin access created!');
      console.log('👤 User:', result.user.email);
      console.log('🏨 Hotel:', result.hotel.name);
      console.log('🔑 Admin ID:', result.hotelAdmin.id);
      
      // Step 3: Test upload functionality
      console.log('\n3. Testing upload functionality...');
      await testUpload();
    } else {
      console.error('❌ FAILED to fix hotel admin:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

async function testUpload() {
  try {
    // Create a simple test file
    const testFile = new File(['Test content for upload'], 'test-upload.txt', {
      type: 'text/plain'
    });
    
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('title', 'Test Upload After Fix');
    formData.append('description', 'Testing upload functionality after hotel admin fix');
    
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('📤 Upload Test Result:', uploadResult);
    
    if (uploadResponse.ok && uploadResult.success) {
      console.log('🎉 UPLOAD SUCCESS: Document uploaded successfully!');
      console.log('📄 Document ID:', uploadResult.documentId);
    } else {
      console.error('❌ Upload failed:', uploadResult.error);
      
      if (uploadResponse.status === 403) {
        console.log('💡 403 Error usually means hotel admin is still not set up properly');
      } else if (uploadResponse.status === 401) {
        console.log('💡 401 Error means authentication issue - try refreshing the page');
      }
    }
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
  }
}

// Export functions to window for manual use
window.fixHotelAdminAssignment = fixHotelAdminAssignment;
window.testUpload = testUpload;

console.log('🚀 Hotel Admin Fix Tools Loaded!');
console.log('📋 Available commands:');
console.log('   fixHotelAdminAssignment() - Fix hotel admin assignment and test upload');
console.log('   testUpload() - Test upload functionality only');
console.log('');
console.log('🔧 To fix the hotel admin issue, run:');
console.log('   fixHotelAdminAssignment()');
