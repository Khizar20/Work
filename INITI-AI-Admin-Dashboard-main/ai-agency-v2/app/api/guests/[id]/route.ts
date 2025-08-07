import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel_id for the current admin
    const { data: adminData, error: adminError } = await supabase
      .from('hotel_admins')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get the specific guest
    const { data: guest, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', params.id)
      .eq('hotel_id', adminData.hotel_id)
      .single();

    if (error || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ guest });

  } catch (error) {
    console.error('Error in GET /api/guests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel_id for the current admin
    const { data: adminData, error: adminError } = await supabase
      .from('hotel_admins')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const body = await request.json();

    // Check if guest exists and belongs to this hotel
    const { data: existingGuest, error: checkError } = await supabase
      .from('guests')
      .select('id, room_number')
      .eq('id', params.id)
      .eq('hotel_id', adminData.hotel_id)
      .single();

    if (checkError || !existingGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'address', 'city', 'state', 'country', 'room_number', 'check_in', 'check_out'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate check-out is after check-in
    if (new Date(body.check_out) <= new Date(body.check_in)) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date' 
      }, { status: 400 });
    }

    // Check if the new room is available (if room number changed)
    if (body.room_number !== existingGuest.room_number) {
      const { data: newRoomData, error: newRoomError } = await supabase
        .from('rooms')
        .select('id, status')
        .eq('hotel_id', adminData.hotel_id)
        .eq('room_number', body.room_number)
        .single();

      if (newRoomError || !newRoomData) {
        return NextResponse.json({ 
          error: 'New room not found' 
        }, { status: 404 });
      }

      if (newRoomData.status !== 'available') {
        return NextResponse.json({ 
          error: 'New room is not available for booking' 
        }, { status: 400 });
      }

      // Update the new room status to occupied
      const { error: updateNewRoomError } = await supabase
        .from('rooms')
        .update({ 
          status: 'occupied',
          updated_at: new Date().toISOString()
        })
        .eq('id', newRoomData.id);

      if (updateNewRoomError) {
        console.error('Error updating new room status:', updateNewRoomError);
      }

      // Update the old room status to available (if it exists)
      if (existingGuest.room_number) {
        const { data: oldRoomData, error: oldRoomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('hotel_id', adminData.hotel_id)
          .eq('room_number', existingGuest.room_number)
          .single();

        if (!oldRoomError && oldRoomData) {
          const { error: updateOldRoomError } = await supabase
            .from('rooms')
            .update({ 
              status: 'available',
              updated_at: new Date().toISOString()
            })
            .eq('id', oldRoomData.id);

          if (updateOldRoomError) {
            console.error('Error updating old room status:', updateOldRoomError);
          }
        }
      }
    }

    // Prepare update data
    const updateData = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      nationality: body.nationality,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      room_number: body.room_number,
      check_in: body.check_in,
      check_out: body.check_out
    };

    const { data: updatedGuest, error: updateError } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', params.id)
      .eq('hotel_id', adminData.hotel_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating guest:', updateError);
      return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Guest updated successfully',
      guest: updatedGuest 
    });

  } catch (error) {
    console.error('Error in PUT /api/guests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hotel_id for the current admin
    const { data: adminData, error: adminError } = await supabase
      .from('hotel_admins')
      .select('hotel_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Check if guest exists and belongs to this hotel
    const { data: existingGuest, error: checkError } = await supabase
      .from('guests')
      .select('id, room_number')
      .eq('id', params.id)
      .eq('hotel_id', adminData.hotel_id)
      .single();

    if (checkError || !existingGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Delete the guest
    const { error: deleteError } = await supabase
      .from('guests')
      .delete()
      .eq('id', params.id)
      .eq('hotel_id', adminData.hotel_id);

    if (deleteError) {
      console.error('Error deleting guest:', deleteError);
      return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
    }

    // Update the room status to available (if guest had a room)
    if (existingGuest.room_number) {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('hotel_id', adminData.hotel_id)
        .eq('room_number', existingGuest.room_number)
        .single();

      if (!roomError && roomData) {
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ 
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', roomData.id);

        if (updateRoomError) {
          console.error('Error updating room status after guest deletion:', updateRoomError);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Guest deleted successfully and room marked as available' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/guests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 