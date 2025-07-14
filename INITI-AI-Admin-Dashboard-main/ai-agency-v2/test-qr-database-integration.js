// QR Code Database Integration Test Script
// Run this in the browser console after loading the hotel-management page

async function testQRCodeDatabaseIntegration() {
  console.log('🧪 Testing QR Code Database Integration...');
  console.log('==========================================');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('1. Checking authentication...');
    const userElement = document.querySelector('[data-testid="user-info"]');
    if (!userElement) {
      console.log('⚠️  Cannot find user info element - user may not be authenticated');
    } else {
      console.log('✅ User appears to be authenticated');
    }
    
    // Test 2: Check if QR codes are being generated
    console.log('\n2. Checking QR code generation...');
    const qrCodes = document.querySelectorAll('svg[data-testid="qr-code"], .qr-code svg');
    if (qrCodes.length > 0) {
      console.log(`✅ Found ${qrCodes.length} QR codes on the page`);
    } else {
      console.log('⚠️  No QR codes found on the page');
    }
    
    // Test 3: Check QR code management section
    console.log('\n3. Checking QR code management UI...');
    const managementSection = document.querySelector('[data-testid="qr-management"], .qr-management');
    if (managementSection) {
      console.log('✅ QR code management section found');
    } else {
      console.log('⚠️  QR code management section not found');
    }
    
    // Test 4: Check for error states
    console.log('\n4. Checking for error states...');
    const errorElements = document.querySelectorAll('.text-red-400, .text-red-500, [class*="error"]');
    if (errorElements.length > 0) {
      console.log(`⚠️  Found ${errorElements.length} error indicators on the page`);
      errorElements.forEach((el, i) => {
        console.log(`   Error ${i + 1}: ${el.textContent?.trim()}`);
      });
    } else {
      console.log('✅ No error indicators found');
    }
    
    // Test 5: Check console for QR code generation logs
    console.log('\n5. Checking console logs...');
    console.log('💡 Look for logs containing "Generated QR code for room" or "Using existing QR code"');
    
    // Test 6: Test URL format
    console.log('\n6. Testing URL format...');
    const sampleRoom = '101';
    const sampleHotelId = 'test-hotel-id';
    const sampleSessionId = 'test-session-id';
    const expectedUrl = `https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app/chat?hotel_id=${sampleHotelId}&room_number=${sampleRoom}&session_id=${sampleSessionId}`;
    console.log('Expected URL format:', expectedUrl);
    
    // Test 7: Check if room data is loading
    console.log('\n7. Checking room data...');
    const roomElements = document.querySelectorAll('[data-testid="room-card"], .room-card, tr[data-room-id]');
    if (roomElements.length > 0) {
      console.log(`✅ Found ${roomElements.length} room elements`);
    } else {
      console.log('⚠️  No room elements found - may be using mock data or data not loaded');
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('✅ QR Code Database Integration test completed');
    console.log('📊 Check the individual test results above');
    console.log('🔧 If issues found, check:');
    console.log('   - Database connection');
    console.log('   - User authentication');
    console.log('   - Console error logs');
    console.log('   - Network requests in DevTools');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Helper function to test QR code URLs
function validateQRCodeUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    console.log('🔍 QR Code URL Analysis:');
    console.log('  Base URL:', urlObj.origin + urlObj.pathname);
    console.log('  Hotel ID:', params.get('hotel_id') || 'MISSING');
    console.log('  Room Number:', params.get('room_number') || 'MISSING');
    console.log('  Session ID:', params.get('session_id') || 'MISSING');
    
    const isValid = params.get('hotel_id') && params.get('room_number') && params.get('session_id');
    console.log('  Status:', isValid ? '✅ Valid' : '❌ Invalid');
    
    return isValid;
  } catch (error) {
    console.error('❌ Invalid URL format:', error);
    return false;
  }
}

// Export functions for manual testing
window.testQRCodeDatabaseIntegration = testQRCodeDatabaseIntegration;
window.validateQRCodeUrl = validateQRCodeUrl;

console.log('🧪 QR Code Database Integration Test Script Loaded');
console.log('📝 Run testQRCodeDatabaseIntegration() to start testing');
console.log('🔍 Run validateQRCodeUrl(url) to test a specific QR code URL');
