// Database Integration Verification Script
// Run this in the browser console on the hotel-management page

async function verifyDatabaseIntegration() {
  console.log('🔍 VERIFYING DATABASE INTEGRATION');
  console.log('=====================================');
  
  try {
    // Test 1: Check if we're using real database data vs mock data
    console.log('\n1. 🗄️ CHECKING DATA SOURCE...');
    
    // Look for mock data indicators
    const mockRoomNumbers = ['101', '102', '103', '201', '202', '301', '302'];
    const displayedRooms = Array.from(document.querySelectorAll('[data-room-number], td:first-child'))
      .map(el => el.textContent?.trim())
      .filter(Boolean);
    
    console.log('Displayed room numbers:', displayedRooms);
    
    const usingMockData = mockRoomNumbers.every(room => displayedRooms.includes(room));
    if (usingMockData && displayedRooms.length === mockRoomNumbers.length) {
      console.log('⚠️  APPEARS TO BE USING MOCK DATA');
      console.log('   - Room numbers match hardcoded mock data exactly');
    } else {
      console.log('✅ APPEARS TO BE USING DATABASE DATA');
      console.log('   - Room numbers differ from mock data pattern');
    }
    
    // Test 2: Check console logs for database calls
    console.log('\n2. 📡 CHECKING DATABASE CALL LOGS...');
    console.log('Look for these log messages in console:');
    console.log('   - "Successfully fetched hotel rooms: X"');
    console.log('   - "Using existing QR code for room X"');
    console.log('   - "Generated new QR code for room X"');
    
    // Test 3: Check QR code URLs for database patterns
    console.log('\n3. 🔗 ANALYZING QR CODE URLS...');
    
    // Try to find QR code URLs in the page
    const qrCodeElements = document.querySelectorAll('[data-qr-url], .qr-code');
    console.log(`Found ${qrCodeElements.length} QR code elements`);
    
    // Test 4: Check hotel ID and base URL
    console.log('\n4. 🏨 CHECKING HOTEL CONFIGURATION...');
    
    // Look for hotel ID display
    const hotelIdElement = document.querySelector('[data-hotel-id]');
    if (hotelIdElement) {
      console.log('Hotel ID found:', hotelIdElement.textContent);
    }
    
    // Look for base URL display
    const baseUrlElement = document.querySelector('[data-base-url]');
    if (baseUrlElement) {
      console.log('Base URL found:', baseUrlElement.textContent);
    }
    
    // Test 5: Check for database error messages
    console.log('\n5. ❌ CHECKING FOR DATABASE ERRORS...');
    const errorMessages = Array.from(document.querySelectorAll('.text-red-400, .text-red-500'))
      .map(el => el.textContent?.trim())
      .filter(msg => msg?.toLowerCase().includes('database') || msg?.toLowerCase().includes('hotel'));
    
    if (errorMessages.length > 0) {
      console.log('⚠️  Database-related errors found:');
      errorMessages.forEach(msg => console.log(`   - ${msg}`));
    } else {
      console.log('✅ No database error messages found');
    }
    
    // Test 6: Manual database verification
    console.log('\n6. 🧪 MANUAL DATABASE TEST...');
    console.log('To manually verify database integration:');
    console.log('1. Open DevTools Network tab');
    console.log('2. Refresh the page');
    console.log('3. Look for API calls to Supabase (should contain "supabase" in URL)');
    console.log('4. Check if there are POST/GET requests to your Supabase instance');
    
    console.log('\n7. 🎯 QUICK VERIFICATION CHECKLIST:');
    console.log('✓ Are room numbers different from [101,102,103,201,202,301,302]?');
    console.log('✓ Do you see "Successfully fetched hotel rooms" in console?');
    console.log('✓ Are there Supabase API calls in Network tab?');
    console.log('✓ Does the QR Management panel show a real Hotel ID?');
    console.log('✓ Is the base URL showing the correct domain?');
    
    return {
      likelyUsingMockData: usingMockData,
      roomCount: displayedRooms.length,
      roomNumbers: displayedRooms,
      errorCount: errorMessages.length
    };
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return null;
  }
}

// Function to test specific database functions
async function testDatabaseFunctions() {
  console.log('\n🧪 TESTING DATABASE FUNCTIONS');
  console.log('==============================');
  
  try {
    // This requires access to the React context/functions
    console.log('To test database functions manually:');
    console.log('1. Open React DevTools');
    console.log('2. Find the HotelManagement component');
    console.log('3. Look for these state values:');
    console.log('   - hotelId (should be a UUID, not null)');
    console.log('   - baseUrl (should be from database)');
    console.log('   - loading (should be false after load)');
    console.log('   - hotelIdError (should be null if working)');
    
    // Check if we can access window functions
    if (typeof window !== 'undefined') {
      console.log('\n4. Available test functions:');
      console.log('   - testQRCodeDatabaseIntegration() (if loaded)');
      console.log('   - validateQRCodeUrl(url) (if loaded)');
    }
    
  } catch (error) {
    console.error('Error testing database functions:', error);
  }
}

// Check for real vs mock room data patterns
function analyzeRoomDataPattern() {
  console.log('\n📊 ROOM DATA PATTERN ANALYSIS');
  console.log('=============================');
  
  const roomRows = Array.from(document.querySelectorAll('tr')).slice(1); // Skip header
  const roomData = roomRows.map(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    return {
      number: cells[0]?.textContent?.trim(),
      type: cells[1]?.textContent?.trim(),
      capacity: cells[2]?.textContent?.trim(),
      price: cells[3]?.textContent?.trim(),
      status: cells[4]?.textContent?.trim()
    };
  }).filter(room => room.number);
  
  console.log('Room data found:', roomData);
  
  // Check for mock data patterns
  const mockPatterns = {
    prices: ['$99.99', '$149.99', '$249.99'],
    types: ['Standard', 'Deluxe', 'Suite'],
    capacities: ['2', '3', '4']
  };
  
  const pricesMatch = roomData.every(room => mockPatterns.prices.includes(room.price));
  const typesMatch = roomData.every(room => mockPatterns.types.includes(room.type));
  
  if (pricesMatch && typesMatch) {
    console.log('⚠️  Data patterns match mock data exactly');
    console.log('   This suggests you might still be using mock data');
  } else {
    console.log('✅ Data patterns differ from mock data');
    console.log('   This suggests you are using database data');
  }
  
  return { roomData, likelyMockData: pricesMatch && typesMatch };
}

// Export functions
window.verifyDatabaseIntegration = verifyDatabaseIntegration;
window.testDatabaseFunctions = testDatabaseFunctions;
window.analyzeRoomDataPattern = analyzeRoomDataPattern;

console.log('🔍 Database Integration Verification Script Loaded');
console.log('📝 Run verifyDatabaseIntegration() to start verification');
console.log('🧪 Run testDatabaseFunctions() for detailed testing');
console.log('📊 Run analyzeRoomDataPattern() to analyze room data patterns');
