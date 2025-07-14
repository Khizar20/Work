import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/route';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('🔧 Manual profile creation for user:', user.id, user.email);

    // Get default hotel
    const { data: defaultHotel } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', 'initi-ai-default')
      .single();

    if (!defaultHotel) {
      return NextResponse.json(
        { error: 'Default hotel not found. Please run SQL setup script first.' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profileId = existingProfile?.id;

    // Create profile if not exists
    if (!existingProfile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email || 'User',
          role: 'admin'
        })
        .select('id')
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        return NextResponse.json(
          { error: 'Failed to create profile', details: profileError },
          { status: 500 }
        );
      }

      profileId = newProfile.id;
      console.log('✅ Profile created:', profileId);
    }

    // Check if hotel admin exists
    const { data: existingHotelAdmin } = await supabase
      .from('hotel_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Create hotel admin if not exists
    if (!existingHotelAdmin) {
      const { error: hotelAdminError } = await supabase
        .from('hotel_admins')
        .insert({
          user_id: user.id,
          hotel_id: defaultHotel.id,
          role: 'admin',
          fullname: user.user_metadata?.full_name || user.email || 'User'
        });

      if (hotelAdminError) {
        console.error('❌ Hotel admin creation failed:', hotelAdminError);
        return NextResponse.json(
          { error: 'Failed to create hotel admin', details: hotelAdminError },
          { status: 500 }
        );
      }

      console.log('✅ Hotel admin created');
    }

    return NextResponse.json({
      success: true,
      message: 'Profile and hotel admin created successfully',
      profileExists: !!existingProfile,
      hotelAdminExists: !!existingHotelAdmin
    });

  } catch (error) {
    console.error('💥 Manual profile creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
