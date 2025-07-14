// Test script to verify the hotel admin lookup is working
// Run this after the fixes to confirm the issue is resolved

async function testHotelAdminLookup() {
  console.log('🔍 Testing Hotel Admin Lookup...');
  console.log('================================');
  
  try {
    // First, let's test the test-connection endpoint
    console.log('1. Testing authentication and hotel admin lookup...');
    const testResponse = await fetch('/api/test-connection');
    const testResult = await testResponse.json();
    
    console.log('📊 Test Connection Result:', testResult);
    
    if (testResult.authenticated) {
      console.log('✅ User is authenticated');
      console.log('👤 User ID:', testResult.user?.id);
      console.log('📧 Email:', testResult.user?.email);
      
      if (testResult.userHasHotel) {
        console.log('✅ User has hotel admin access!');
        console.log('🏨 Hotel:', testResult.hotel?.name);
        console.log('🔑 Role:', testResult.hotelAdmin?.role);
        
        // Now test the upload endpoint
        console.log('\n2. Testing upload endpoint...');
        await testUploadEndpoint();
      } else {
        console.log('❌ User does not have hotel admin access');
        console.log('💡 The user exists but is not linked to any hotel');
        console.log('🔧 This means the hotel_admins table is missing the record');
      }
    } else {
      console.log('❌ User is not authenticated');
      console.log('💡 Please log in first');
    }
    
  } catch (error) {
    console.error('❌ Error testing hotel admin lookup:', error);
  }
}

async function testUploadEndpoint() {
  try {
    // Create a simple test file
    const testContent = `Test Upload Document
Created: ${new Date().toISOString()}
User ID: 5fd160bb-f8c0-4910-bdea-a058503ff33f
Purpose: Testing hotel admin lookup fix`;
    
    const testFile = new File([testContent], 'test-hotel-admin-fix.txt', {
      type: 'text/plain'
    });
    
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('title', 'Hotel Admin Fix Test Document');
    formData.append('description', 'Testing upload after fixing hotel admin lookup');
    
    console.log('📤 Attempting upload...');
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    
    console.log('📊 Upload Response:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      result: uploadResult
    });
    
    if (uploadResponse.status === 200 && uploadResult.success) {
      console.log('🎉 SUCCESS! Upload worked perfectly!');
      console.log('📄 Document ID:', uploadResult.documentId);
      console.log('✅ Hotel admin lookup is working correctly');
    } else if (uploadResponse.status === 403) {
      console.log('❌ 403 Forbidden - Hotel admin lookup still failing');
      console.log('🔍 Details:', uploadResult.details);
      console.log('💡 The user ID exists in hotel_admins table but lookup is failing');
    } else if (uploadResponse.status === 401) {
      console.log('❌ 401 Unauthorized - Authentication issue');
      console.log('💡 Try refreshing the page and logging in again');
    } else {
      console.log('❌ Upload failed with status:', uploadResponse.status);
      console.log('📝 Error:', uploadResult.error);
    }
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
  }
}

// Database debugging function
async function debugDatabaseLookup() {
  console.log('🔍 Database Lookup Debug...');
  console.log('===========================');
  
  try {
    // Test with the actual user ID from the error
    const userId = '5fd160bb-f8c0-4910-bdea-a058503ff33f';
    console.log('🔍 Looking for user ID:', userId);
    
    // This will help us understand what's happening in the database
    const debugResponse = await fetch('/api/debug-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (debugResponse.ok) {
      const debugResult = await debugResponse.json();
      console.log('📊 Debug Result:', debugResult);
    } else {
      console.log('❌ Debug endpoint not available or failed');
    }
    
  } catch (error) {
    console.error('❌ Debug lookup error:', error);
  }
}

// Make functions available globally
window.testHotelAdminLookup = testHotelAdminLookup;
window.testUploadEndpoint = testUploadEndpoint;
window.debugDatabaseLookup = debugDatabaseLookup;

console.log('🔧 Hotel Admin Lookup Test Tools Loaded!');
console.log('📋 Available commands:');
console.log('   testHotelAdminLookup() - Full test of auth and hotel admin lookup');
console.log('   testUploadEndpoint() - Test upload functionality only');
console.log('   debugDatabaseLookup() - Debug database lookup issues');
console.log('');
console.log('🚀 To test the fix, run:');
console.log('   testHotelAdminLookup()');
