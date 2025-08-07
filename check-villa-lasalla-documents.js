// Check documents for VillaLaSalla hotel
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqfqfzaqeprxtxkihprp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnFmemFxZXByeHR4a2locHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTU5MDIsImV4cCI6MjA0NjM5MTkwMn0.xJNHo0z2iqVH2yk9k1QXJGo-bOZiA8y2YaBfxYJ1jT4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVillaLaSallaDocuments() {
  console.log('🔍 Checking documents for VillaLaSalla...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  try {
    // Check all documents for this hotel
    console.log('1️⃣ Checking all documents for hotel ID:', hotelId);
    const { data: allDocs, error: allError } = await supabase
      .from('documents')
      .select('id, title, hotel_id, file_type, created_at, embedding')
      .eq('hotel_id', hotelId);
    
    if (allError) {
      console.error('❌ Error checking documents:', allError);
      return;
    }
    
    console.log(`📊 Found ${allDocs?.length || 0} documents for VillaLaSalla`);
    
    if (allDocs && allDocs.length > 0) {
      allDocs.forEach((doc, index) => {
        console.log(`\n📄 Document ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Title: ${doc.title}`);
        console.log(`   Type: ${doc.file_type}`);
        console.log(`   Created: ${doc.created_at}`);
        console.log(`   Has Embedding: ${doc.embedding ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('❌ No documents found for VillaLaSalla!');
    }
    
    // Check all hotels in the database
    console.log('\n2️⃣ Checking all hotels in database...');
    const { data: hotels, error: hotelError } = await supabase
      .from('documents')
      .select('hotel_id')
      .not('hotel_id', 'is', null);
    
    if (hotelError) {
      console.error('❌ Error checking hotels:', hotelError);
      return;
    }
    
    const uniqueHotels = [...new Set(hotels.map(h => h.hotel_id))];
    console.log(`🏨 Found ${uniqueHotels.length} unique hotels in database:`);
    uniqueHotels.forEach((hotelId, index) => {
      console.log(`   ${index + 1}. ${hotelId}`);
    });
    
    // Check document count per hotel
    console.log('\n3️⃣ Document count per hotel...');
    for (const hId of uniqueHotels) {
      const { data: hotelDocs, error: countError } = await supabase
        .from('documents')
        .select('id, title')
        .eq('hotel_id', hId);
      
      if (!countError) {
        console.log(`   ${hId}: ${hotelDocs.length} documents`);
        if (hotelDocs.length > 0) {
          hotelDocs.forEach(doc => {
            console.log(`     - ${doc.title}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkVillaLaSallaDocuments(); 