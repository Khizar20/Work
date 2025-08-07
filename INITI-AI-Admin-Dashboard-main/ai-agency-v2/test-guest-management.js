// Test script for Guest Management API
// Run this after applying the SQL schema and setting up the API endpoints

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGuestManagement() {
  console.log('🧪 Testing Guest Management System...\n');

  try {
    // 1. Test creating a new guest
    console.log('1. Testing guest creation...');
    const newGuest = {
      hotel_id: '8a1e6805-9253-4dd5-8893-0de3d7815555', // Replace with actual hotel ID
      hotel_name: 'VillaLaSala',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      nationality: 'American',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      room_number: '101'
    };

    const { data: createdGuest, error: createError } = await supabase
      .from('guests')
      .insert(newGuest)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating guest:', createError);
    } else {
      console.log('✅ Guest created successfully:', createdGuest.id);
    }

    // 2. Test fetching guests
    console.log('\n2. Testing guest retrieval...');
    const { data: guests, error: fetchError } = await supabase
      .from('guests')
      .select('*')
      .eq('hotel_id', '8a1e6805-9253-4dd5-8893-0de3d7815555')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching guests:', fetchError);
    } else {
      console.log('✅ Guests fetched successfully:', guests.length, 'guests found');
      guests.forEach(guest => {
        console.log(`   - ${guest.first_name} ${guest.last_name} (${guest.email || 'No email'})`);
      });
    }

    // 3. Test updating a guest
    if (createdGuest) {
      console.log('\n3. Testing guest update...');
      const updateData = {
        phone: '+1-555-9999',
        room_number: '102'
      };

      const { data: updatedGuest, error: updateError } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', createdGuest.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating guest:', updateError);
      } else {
        console.log('✅ Guest updated successfully');
      }
    }

    // 4. Test guest statistics
    console.log('\n4. Testing guest statistics...');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_guest_statistics', { target_hotel_id: '8a1e6805-9253-4dd5-8893-0de3d7815555' });

    if (statsError) {
      console.error('❌ Error fetching statistics:', statsError);
    } else {
      console.log('✅ Guest statistics:', stats[0]);
    }

    // 5. Test guest details view
    console.log('\n5. Testing guest details view...');
    const { data: guestDetails, error: viewError } = await supabase
      .from('guest_details')
      .select('*')
      .limit(3);

    if (viewError) {
      console.error('❌ Error fetching guest details:', viewError);
    } else {
      console.log('✅ Guest details view working:', guestDetails.length, 'records');
    }

    // 6. Clean up test data
    if (createdGuest) {
      console.log('\n6. Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('guests')
        .delete()
        .eq('id', createdGuest.id);

      if (deleteError) {
        console.error('❌ Error deleting test guest:', deleteError);
      } else {
        console.log('✅ Test guest deleted successfully');
      }
    }

    console.log('\n🎉 Guest Management System Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGuestManagement(); 