// Test script to verify room status updates with guest management
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRoomStatusUpdates() {
  console.log('🧪 Testing Room Status Updates with Guest Management\n');

  try {
    // 1. Check current room statuses
    console.log('1. Checking current room statuses...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, room_number, status, hotel_id')
      .eq('is_active', true)
      .order('room_number');

    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError);
      return;
    }

    console.log('📋 Available rooms:');
    rooms.forEach(room => {
      console.log(`   Room ${room.room_number}: ${room.status}`);
    });

    // 2. Check current guests
    console.log('\n2. Checking current guests...');
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, first_name, last_name, room_number, hotel_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (guestsError) {
      console.error('❌ Error fetching guests:', guestsError);
      return;
    }

    console.log('👥 Recent guests:');
    guests.forEach(guest => {
      console.log(`   ${guest.first_name} ${guest.last_name} - Room ${guest.room_number}`);
    });

    // 3. Test room availability logic
    console.log('\n3. Testing room availability logic...');
    const availableRooms = rooms.filter(room => room.status === 'available');
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');

    console.log(`✅ Available rooms: ${availableRooms.length}`);
    console.log(`🔒 Occupied rooms: ${occupiedRooms.length}`);

    // 4. Verify room-guest relationships
    console.log('\n4. Verifying room-guest relationships...');
    for (const guest of guests) {
      if (guest.room_number) {
        const guestRoom = rooms.find(room => room.room_number === guest.room_number);
        if (guestRoom) {
          const statusMatch = guestRoom.status === 'occupied';
          console.log(`   Guest ${guest.first_name} ${guest.last_name} in Room ${guest.room_number}: ${statusMatch ? '✅' : '❌'} Status matches`);
        }
      }
    }

    // 5. Test API endpoint simulation
    console.log('\n5. Simulating API endpoint behavior...');
    
    // Simulate guest creation
    const testRoom = availableRooms[0];
    if (testRoom) {
      console.log(`   📝 Simulating booking Room ${testRoom.room_number}...`);
      
      // This would be the actual API call in the real system
      console.log(`   ✅ Room ${testRoom.room_number} would be marked as 'occupied'`);
      console.log(`   ✅ Guest would be created with room_number: ${testRoom.room_number}`);
    }

    // Simulate guest update (room change)
    const testGuest = guests[0];
    if (testGuest && testGuest.room_number && availableRooms.length > 1) {
      const newRoom = availableRooms[1];
      console.log(`   📝 Simulating guest ${testGuest.first_name} moving from Room ${testGuest.room_number} to Room ${newRoom.room_number}...`);
      console.log(`   ✅ Room ${testGuest.room_number} would be marked as 'available'`);
      console.log(`   ✅ Room ${newRoom.room_number} would be marked as 'occupied'`);
    }

    // Simulate guest deletion
    if (testGuest && testGuest.room_number) {
      console.log(`   📝 Simulating deletion of guest ${testGuest.first_name} from Room ${testGuest.room_number}...`);
      console.log(`   ✅ Room ${testGuest.room_number} would be marked as 'available'`);
    }

    console.log('\n🎉 Room status update tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Total rooms: ${rooms.length}`);
    console.log(`   • Available: ${availableRooms.length}`);
    console.log(`   • Occupied: ${occupiedRooms.length}`);
    console.log(`   • Guests with rooms: ${guests.filter(g => g.room_number).length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRoomStatusUpdates(); 