// Quick Database Connection Test
// Run this in your browser console on the hotel-management page

async function quickDatabaseTest() {
  console.log('🚀 QUICK DATABASE CONNECTION TEST');
  console.log('==================================');
  
  try {
    // Check if we're in the right environment
    if (typeof window === 'undefined') {
      console.log('❌ Not in browser environment');
      return;
    }
    
    // Look for evidence of database calls
    console.log('1. 📊 Checking page state...');
    
    // Check if there's a loading state element
    const loadingElements = document.querySelectorAll('[data-loading], .loading, .spinner');
    console.log(`Found ${loadingElements.length} loading indicators`);
    
    // Check for hotel ID display
    const hotelIdText = document.body.textContent;
    const hasHotelId = hotelIdText.includes('Hotel ID:') || hotelIdText.includes('hotel_id');
    console.log('Hotel ID mentioned on page:', hasHotelId);
    
    // Check for error messages that indicate database calls
    const hasDbErrors = hotelIdText.includes('User is not associated with any hotel') || 
                       hotelIdText.includes('Failed to fetch hotel information') ||
                       hotelIdText.includes('Error fetching hotel');
    console.log('Database error messages found:', hasDbErrors);
    
    // Check console logs for database activity
    console.log('\n2. 🔍 Console log indicators:');
    console.log('Look in your console for these messages:');
    console.log('✓ "Successfully fetched hotel rooms: X"');
    console.log('✓ "Using existing QR code for room X"'); 
    console.log('✓ "Generated new QR code for room X"');
    console.log('✓ "QR codes generated from database data: X"');
    console.log('✗ "Error fetching hotel rooms"');
    console.log('✗ "User is not associated with any hotel"');
    
    // Check network tab
    console.log('\n3. 🌐 Network verification:');
    console.log('Open DevTools → Network tab and look for:');
    console.log('✓ POST/GET requests to supabase.co domain');
    console.log('✓ Requests to /rest/v1/rooms or /rest/v1/hotels');
    console.log('✓ Request headers with Authorization: Bearer');
    
    // Check for QR code patterns
    console.log('\n4. 🔗 QR Code URL Analysis:');
    
    // Try to find QR code URLs in various ways
    const qrPatterns = [
      document.body.textContent.match(/https:\/\/initi-ai-client-side-site[^&]*hotel_id=([^&]+)/g),
      document.body.textContent.match(/hotel_id=([a-f0-9-]{36})/g),
      document.body.textContent.match(/session_id=([a-f0-9-]{36})/g)
    ].filter(Boolean);
    
    if (qrPatterns.length > 0) {
      console.log('✅ Found QR code URL patterns in page');
      qrPatterns.forEach((pattern, i) => {
        console.log(`Pattern ${i + 1}:`, pattern.slice(0, 3)); // Show first 3 matches
      });
    } else {
      console.log('❌ No QR code URL patterns found');
    }
    
    // Simple mock data detection
    console.log('\n5. 🎭 Mock Data Detection:');
    const mockIndicators = [
      hotelIdText.includes('MISSING_HOTEL_ID'),
      hotelIdText.includes('Room 101') && hotelIdText.includes('Room 102') && hotelIdText.includes('Room 103'),
      hotelIdText.includes('$99.99') && hotelIdText.includes('$149.99') && hotelIdText.includes('$249.99')
    ];
    
    const likelyMockData = mockIndicators.filter(Boolean).length >= 2;
    console.log('Mock data indicators found:', mockIndicators.filter(Boolean).length);
    console.log('Likely using mock data:', likelyMockData ? '⚠️  YES' : '✅ NO');
    
    // Final assessment
    console.log('\n6. 🎯 FINAL ASSESSMENT:');
    if (hasDbErrors) {
      console.log('🔴 Database integration attempted but failing');
      console.log('   → Check user authentication and hotel assignment');
    } else if (likelyMockData) {
      console.log('🟡 Appears to be using mock data fallback');
      console.log('   → Database may not be connected or user not assigned to hotel');
    } else {
      console.log('🟢 Likely using database data successfully');
      console.log('   → Check network tab to confirm Supabase calls');
    }
    
    return {
      hasHotelId,
      hasDbErrors,
      likelyMockData,
      qrPatternsFound: qrPatterns.length > 0
    };
    
  } catch (error) {
    console.error('❌ Error during quick test:', error);
    return null;
  }
}

// Auto-run the test
quickDatabaseTest();

// Export for manual use
window.quickDatabaseTest = quickDatabaseTest;
