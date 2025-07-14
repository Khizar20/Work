import { createClient } from '@/app/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Test the exact same query as the profile service
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        hotel_admins (
          id,
          hotel_id,
          role,
          fullname,
          created_at,
          hotels (
            id,
            name,
            slug,
            address,
            city,
            region,
            country,
            phone,
            email,
            website,
            timezone,
            is_active
          )
        )
      `)
      .eq('user_id', user.id)
      .single();

    // Also test individual table queries
    const { data: profiles } = await supabase.from('profiles').select('*').eq('user_id', user.id);
    const { data: hotelAdmins } = await supabase.from('hotel_admins').select('*').eq('user_id', user.id);
    const { data: hotels } = await supabase.from('hotels').select('*');

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      profileData,
      profileError,
      individual_queries: {
        profiles,
        hotelAdmins,
        hotels: hotels?.slice(0, 3) // Just first 3 hotels
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
  }
}
