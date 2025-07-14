/**
 * Test script to verify the new QR code functionality
 * Run this in the browser console on the hotel-management page
 */

async function testQRCodeFunctionality() {
  console.log('🧪 Testing QR Code Functionality...');
  console.log('=====================================');
  
  // Test 1: Check if QR codes are generated with the new format
  console.log('\n1. Testing QR Code Generation Format...');
  
  // Wait for the page to load and QR codes to be generated
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if QR codes are in the expected format
  const qrCodeElements = document.querySelectorAll('[data-testid="qr-code"], svg');
  console.log(`Found ${qrCodeElements.length} QR code elements`);
  
  // Test 2: Check if chat URLs are in the correct format
  console.log('\n2. Testing Chat URL Format...');
    const urlPattern = /^https:\/\/initi-ai-client-side-site-tla9-dvm948wll\.vercel\.app\/chat\?hotel_id=(.+)&room_number=(.+)&session_id=([0-9a-f-]{36})$/;
  
  // Look for URLs in the page content
  const pageText = document.body.innerText;
  const urlMatches = pageText.match(/https:\/\/initi-ai-client-side-site-tla9-dvm948wll\.vercel\.app\/chat\?[^\s]+/g);
  
  if (urlMatches) {
    console.log(`Found ${urlMatches.length} chat URLs:`);
    urlMatches.forEach((url, index) => {
      const match = url.match(urlPattern);
      if (match) {
        console.log(`✅ URL ${index + 1}: Valid format`);
        console.log(`   Hotel ID: ${match[1]}`);
        console.log(`   Room Number: ${match[2]}`);
        console.log(`   Session ID: ${match[3]}`);
      } else {
        console.log(`❌ URL ${index + 1}: Invalid format - ${url}`);
      }
    });
  } else {
    console.log('❌ No chat URLs found in page content');
  }
  
  // Test 3: Check for hotel_id retrieval
  console.log('\n3. Testing Hotel ID Retrieval...');
  
  // Look for hotel ID error messages or success indicators
  const errorMessages = document.querySelectorAll('.text-red-400, .text-red-500');
  const successIndicators = document.querySelectorAll('.text-green-400, .text-green-500');
  
  if (errorMessages.length > 0) {
    console.log('⚠️ Found error messages:');
    errorMessages.forEach(el => console.log(`   - ${el.textContent.trim()}`));
  }
  
  if (successIndicators.length > 0) {
    console.log('✅ Found success indicators:');
    successIndicators.forEach(el => console.log(`   - ${el.textContent.trim()}`));
  }
  
  // Test 4: Check QR Code tab functionality
  console.log('\n4. Testing QR Code Tab...');
  
  const qrCodeTab = document.querySelector('[value="qrcodes"]');
  if (qrCodeTab) {
    console.log('✅ QR Code tab found');
    
    // Click the QR Code tab
    qrCodeTab.click();
    
    // Wait for tab content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for QR code displays
    const qrCodeDisplays = document.querySelectorAll('svg[viewBox], .react-qr-code');
    console.log(`✅ Found ${qrCodeDisplays.length} QR code displays in tab`);
    
    // Check for print buttons
    const printButtons = document.querySelectorAll('button');
    const qrPrintButtons = Array.from(printButtons).filter(btn => 
      btn.textContent.includes('Print QR') || btn.textContent.includes('QR Code')
    );
    console.log(`✅ Found ${qrPrintButtons.length} QR code print buttons`);
    
  } else {
    console.log('❌ QR Code tab not found');
  }
  
  // Test 5: Check for dependencies
  console.log('\n5. Testing Dependencies...');
  
  console.log(`✅ UUID available: ${typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function'}`);
  console.log(`✅ React QR Code loaded: ${typeof React !== 'undefined'}`);
  
  console.log('\n🎉 QR Code functionality test completed!');
  console.log('=====================================');
  
  // Return summary
  return {
    qrCodeElements: qrCodeElements.length,
    chatUrls: urlMatches ? urlMatches.length : 0,
    validUrls: urlMatches ? urlMatches.filter(url => urlPattern.test(url)).length : 0,
    errorMessages: errorMessages.length,
    successIndicators: successIndicators.length,
    qrCodeTab: !!qrCodeTab,
    dependencies: {
      uuid: typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function',
      react: typeof React !== 'undefined'
    }
  };
}

// Auto-run the test if this script is executed
if (typeof window !== 'undefined') {
  console.log('🚀 Starting QR Code functionality test in 3 seconds...');
  setTimeout(testQRCodeFunctionality, 3000);
} else {
  console.log('💡 Run this script in the browser console on the hotel-management page');
}

// Export for manual testing
window.testQRCodeFunctionality = testQRCodeFunctionality;
