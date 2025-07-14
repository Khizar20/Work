// Supabase Connection Diagnostic Script
// Run this in browser console to diagnose connection issues

async function diagnoseSupabaseConnection() {
  console.log('🔧 SUPABASE CONNECTION DIAGNOSTIC');
  console.log('=================================');
  
  try {
    // Test 1: Check if environment variables are loaded
    console.log('\n1. 🔑 CHECKING ENVIRONMENT VARIABLES...');
    
    const supabaseUrl = process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND';
    const supabaseKey = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_FOUND';
    
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl?.substring(0, 30) + '...' || 'undefined');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey?.substring(0, 20) + '...' || 'undefined');
    
    if (supabaseUrl === 'NOT_FOUND' || supabaseKey === 'NOT_FOUND') {
      console.log('❌ Environment variables not properly loaded');
      console.log('💡 Solution: Check your .env.local file exists and contains:');
      console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
      console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
      return { status: 'env_error', supabaseUrl, supabaseKey };
    }
    
    // Test 2: Check Supabase client initialization
    console.log('\n2. 🏗️ CHECKING SUPABASE CLIENT...');
    
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase client not found on window object');
      console.log('💡 This might be normal - checking for module import...');
    }
    
    // Test 3: Try to make a simple connection test
    console.log('\n3. 🌐 TESTING CONNECTION...');
    
    try {
      // Try to access the Supabase URL directly
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      console.log('Connection test response status:', response.status);
      console.log('Connection test response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ Basic connection to Supabase successful');
      } else {
        console.log('❌ Connection failed with status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message);
      console.log('💡 This might indicate network issues or CORS problems');
    }
    
    // Test 4: Check browser network connectivity
    console.log('\n4. 🌍 CHECKING NETWORK...');
    
    try {
      const testResponse = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
      console.log('✅ Basic internet connectivity working');
    } catch (networkError) {
      console.log('❌ Network connectivity issue:', networkError.message);
    }
    
    // Test 5: Check for CORS issues
    console.log('\n5. 🔒 CHECKING CORS...');
    console.log('Open DevTools → Network tab and look for:');
    console.log('- Failed requests to supabase.co domain');
    console.log('- CORS error messages');
    console.log('- OPTIONS preflight requests failing');
    
    // Test 6: Auth state analysis
    console.log('\n6. 🔐 ANALYZING AUTH STATE...');
    
    // Check for auth-related errors in console
    const authErrors = [
      'AuthRetryableFetchError',
      'Failed to fetch',
      'Auth session missing',
      'Invalid API key'
    ];
    
    console.log('Common auth errors to look for:');
    authErrors.forEach(error => console.log(`  - ${error}`));
    
    // Test 7: Local storage check
    console.log('\n7. 💾 CHECKING LOCAL STORAGE...');
    
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    );
    
    console.log('Auth-related localStorage keys:', authKeys);
    
    if (authKeys.length === 0) {
      console.log('⚠️  No auth data in localStorage - user likely not logged in');
    } else {
      console.log('✅ Auth data found in localStorage');
    }
    
    return {
      status: 'diagnosis_complete',
      supabaseUrl,
      hasAuthData: authKeys.length > 0
    };
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    return { status: 'error', error: error.message };
  }
}

// Function to create .env.local template
function createEnvTemplate() {
  console.log('\n📝 .ENV.LOCAL TEMPLATE');
  console.log('======================');
  console.log('Create a file named .env.local in your project root with:');
  console.log('');
  console.log('# Supabase Configuration');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.log('');
  console.log('💡 Get these values from your Supabase dashboard:');
  console.log('   1. Go to Settings → API');
  console.log('   2. Copy the Project URL and anon public key');
  console.log('   3. Save the file and restart your dev server');
}

// Function to test auth specifically
async function testAuth() {
  console.log('\n🔐 AUTH-SPECIFIC TEST');
  console.log('====================');
  
  try {
    // Check if we can access the auth module
    if (typeof window !== 'undefined' && window.supabase) {
      const { data, error } = await window.supabase.auth.getSession();
      console.log('Auth session data:', data);
      console.log('Auth session error:', error);
    } else {
      console.log('⚠️  Cannot access supabase auth from window object');
      console.log('💡 This is normal - auth is handled internally by the app');
    }
    
    // Check for auth cookies/tokens
    const cookies = document.cookie;
    const hasAuthCookies = cookies.includes('auth') || cookies.includes('supabase');
    console.log('Has auth cookies:', hasAuthCookies);
    
  } catch (authError) {
    console.error('Auth test error:', authError);
  }
}

// Export functions
window.diagnoseSupabaseConnection = diagnoseSupabaseConnection;
window.createEnvTemplate = createEnvTemplate;
window.testAuth = testAuth;

// Auto-run diagnosis
console.log('🔧 Supabase Connection Diagnostic Script Loaded');
console.log('📝 Run diagnoseSupabaseConnection() to start diagnosis');
console.log('📋 Run createEnvTemplate() to see .env.local template');
console.log('🔐 Run testAuth() to test auth specifically');

// Auto-run the diagnosis
diagnoseSupabaseConnection();
