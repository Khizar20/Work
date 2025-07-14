// Fix for Supabase Connection Issues
// This script addresses the "Failed to fetch" and "AuthRetryableFetchError" issues

async function fixSupabaseConnection() {
  console.log('🔧 FIXING SUPABASE CONNECTION ISSUES');
  console.log('====================================');
  
  try {
    // Step 1: Clear any corrupted auth state
    console.log('\n1. 🧹 CLEARING CORRUPTED AUTH STATE...');
    
    // Clear localStorage auth entries
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase.auth.token') || 
      key.includes('sb-') ||
      key.includes('auth')
    );
    
    console.log('Found auth keys to clear:', authKeys);
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });
    
    // Clear auth cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Cleared auth state');
    
    // Step 2: Test connection without auth
    console.log('\n2. 🌐 TESTING BASIC CONNECTION...');
    
    const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      });
      
      console.log('Connection status:', response.status);
      
      if (response.ok || response.status === 406) { // 406 is expected for this endpoint
        console.log('✅ Basic Supabase connection working');
      } else {
        console.log('❌ Connection issue, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
    }
    
    // Step 3: Test a simple query
    console.log('\n3. 📊 TESTING SIMPLE QUERY...');
    
    try {
      const queryResponse = await fetch(`${supabaseUrl}/rest/v1/hotels?select=id,name&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (queryResponse.ok) {
        const data = await queryResponse.json();
        console.log('✅ Simple query successful:', data);
      } else {
        console.log('❌ Query failed with status:', queryResponse.status);
        const errorText = await queryResponse.text();
        console.log('Query error:', errorText);
      }
    } catch (queryError) {
      console.log('❌ Query test failed:', queryError.message);
    }
    
    console.log('\n4. 🔄 NEXT STEPS...');
    console.log('1. Refresh the page to reload auth state');
    console.log('2. Try logging in again if needed');
    console.log('3. Check if the connection issues are resolved');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
    return false;
  }
}

// Function to restart the development server (instructions)
function restartDevServer() {
  console.log('\n🔄 HOW TO RESTART DEV SERVER');
  console.log('============================');
  console.log('1. Go to your terminal/command prompt');
  console.log('2. Press Ctrl+C to stop the current server');
  console.log('3. Run: npm run dev');
  console.log('4. Wait for the server to start');
  console.log('5. Refresh this page');
  console.log('');
  console.log('💡 Restarting helps reload environment variables and clear server-side cache');
}

// Function to check if the issues are resolved
async function checkIfFixed() {
  console.log('\n✅ CHECKING IF ISSUES ARE RESOLVED');
  console.log('==================================');
  
  try {
    // Look for the specific errors in console
    const originalConsoleError = console.error;
    let errorCount = 0;
    
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('Failed to fetch') || message.includes('AuthRetryableFetchError')) {
        errorCount++;
      }
      originalConsoleError.apply(console, args);
    };
    
    // Restore original console.error after a delay
    setTimeout(() => {
      console.error = originalConsoleError;
      if (errorCount === 0) {
        console.log('✅ No auth fetch errors detected in the last 5 seconds');
      } else {
        console.log(`❌ Still seeing ${errorCount} auth fetch errors`);
      }
    }, 5000);
    
    console.log('Monitoring for auth errors for 5 seconds...');
    
  } catch (error) {
    console.error('Error during check:', error);
  }
}

// Export functions
window.fixSupabaseConnection = fixSupabaseConnection;
window.restartDevServer = restartDevServer;
window.checkIfFixed = checkIfFixed;

console.log('🔧 Supabase Connection Fix Script Loaded');
console.log('📝 Run fixSupabaseConnection() to attempt fix');
console.log('🔄 Run restartDevServer() for restart instructions');
console.log('✅ Run checkIfFixed() to monitor for remaining errors');

// Auto-run the fix
fixSupabaseConnection();
