import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/route';

/**
 * API endpoint to fix hotel admin assignment for the current user
 * This will create the necessary database records to make document upload work
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current authenticated user (secure method)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔧 Fixing hotel admin assignment for user:', user.id, user.email);
    
    // Step 1: Check if user already has hotel admin record
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('hotel_admins')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', adminCheckError);
      return NextResponse.json(
        { error: 'Database error checking existing admin' },
        { status: 500 }
      );
    }
    
    if (existingAdmin) {
      console.log('✅ User already has hotel admin record:', existingAdmin);
      return NextResponse.json({
        success: true,
        message: 'User already has hotel admin access',
        hotelAdmin: existingAdmin
      });
    }
    
    // Step 2: Get or create default hotel
    let defaultHotel;
    const { data: existingHotel, error: hotelCheckError } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', 'initi-ai-default')
      .single();
    
    if (hotelCheckError && hotelCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking existing hotel:', hotelCheckError);
      return NextResponse.json(
        { error: 'Database error checking hotels' },
        { status: 500 }
      );
    }
    
    if (existingHotel) {
      defaultHotel = existingHotel;
      console.log('✅ Found existing default hotel:', defaultHotel.id);
    } else {
      // Create default hotel
      console.log('🏨 Creating default hotel...');
      const { data: newHotel, error: createHotelError } = await supabase
        .from('hotels')
        .insert({
          name: 'INITI AI Default Hotel',
          slug: 'initi-ai-default',
          address: '123 Default Street',
          city: 'Default City',
          state: 'CA',
          zip_code: '12345',
          country: 'USA',
          phone: '+1-555-0123',
          email: 'contact@initi-ai-default.com',
          website: 'https://initi-ai-default.com',
          description: 'Default hotel for INITI AI Admin Dashboard',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createHotelError) {
        console.error('❌ Error creating default hotel:', createHotelError);
        return NextResponse.json(
          { error: 'Failed to create default hotel' },
          { status: 500 }
        );
      }
      
      defaultHotel = newHotel;
      console.log('✅ Created default hotel:', defaultHotel.id);
    }
    
    // Step 3: Create profile record if it doesn't exist
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking existing profile:', profileCheckError);
    }
    
    if (!existingProfile) {
      console.log('👤 Creating user profile...');
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
        // Continue anyway, profile is not strictly required for hotel admin
      } else {
        console.log('✅ Created user profile');
      }
    }
    
    // Step 4: Create hotel admin record
    console.log('🔑 Creating hotel admin record...');
    const { data: newAdmin, error: createAdminError } = await supabase
      .from('hotel_admins')
      .insert({
        user_id: user.id,
        hotel_id: defaultHotel.id,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createAdminError) {
      console.error('❌ Error creating hotel admin:', createAdminError);
      return NextResponse.json(
        { error: 'Failed to create hotel admin record: ' + createAdminError.message },
        { status: 500 }
      );
    }
    
    console.log('🎉 Successfully created hotel admin record:', newAdmin);
    
    return NextResponse.json({
      success: true,
      message: 'Hotel admin access successfully configured',
      user: {
        id: user.id,
        email: user.email
      },
      hotel: {
        id: defaultHotel.id,
        name: defaultHotel.name,
        slug: defaultHotel.slug
      },
      hotelAdmin: newAdmin
    });
    
  } catch (error) {
    console.error('❌ Error in /api/fix-hotel-admin:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current authenticated user (secure method)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check current hotel admin status
    const { data: hotelAdmin, error: adminError } = await supabase
      .from('hotel_admins')
      .select(`
        *,
        hotels (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error checking hotel admin status:', adminError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      hasHotelAdmin: !!hotelAdmin,
      hotelAdmin: hotelAdmin || null,
      hotel: hotelAdmin?.hotels || null
    });
    
  } catch (error) {
    console.error('❌ Error checking hotel admin status:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
