// Test script to verify the user profile service fixes
// Run this in the browser console on localhost:3000/dashboard

console.log('🧪 Testing User Profile Service...');

async function testProfileService() {
  try {
    console.log('📡 Testing userProfileService...');
    
    // Test connection
    console.log('🔍 Testing connection...');
    
    // Since userProfileService is imported in dashboard components, we can access it
    // by importing the module directly
    const { userProfileService } = await import('./utils/user-profile-service.js');
    
    const connectionResult = await userProfileService.checkConnection();
    console.log('Connection result:', connectionResult);
    
    // Test profile fetch
    console.log('👤 Testing profile fetch...');
    const profileResult = await userProfileService.getUserProfile();
    console.log('Profile result:', profileResult);
    
    if (profileResult?.data) {
      console.log('✅ Profile data found:');
      console.log('- Name:', profileResult.data.name);
      console.log('- Email:', profileResult.data.user_email);
      console.log('- Hotel Name:', profileResult.data.hotel_name);
      console.log('- Admin Role:', profileResult.data.admin_role);
      console.log('- Hotel ID:', profileResult.data.hotel_id);
    } else {
      console.log('❌ No profile data:', profileResult?.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testProfileService();
