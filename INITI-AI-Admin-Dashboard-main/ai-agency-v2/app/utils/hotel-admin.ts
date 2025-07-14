import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { processSupabaseError } from './error-handling';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type HotelAdmin = {
  id: string;
  hotel_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'support';
  created_at: string;
  updated_at: string;
};

export type Hotel = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  description: string;
  website?: string;
  phone?: string;
  email: string;
  is_active: boolean;
  timezone: string;
  vector_doc_count: number;
  trained_at?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Gets the current hotel admin based on the user session
 * @param user - The authenticated user
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export const getHotelAdmin = async (
  user: User | null, 
  supabaseClient?: SupabaseClient<Database>
): Promise<HotelAdmin | null> => {
  try {
    if (!user) {
      console.log('❌ No user provided to getHotelAdmin');
      return null;
    }
    
    // Use provided client or default to browser client
    const client = supabaseClient || supabase;
    
    console.log('🔍 Looking for hotel admin for user:', user.id);
    
    // Query the hotel_admins table
    const { data: hotelAdmin, error } = await client
      .from('hotel_admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Database error in getHotelAdmin:', error);
      const errorMessage = processSupabaseError(error);
      console.error('Processed error:', errorMessage);
      return null;
    }
    
    if (!hotelAdmin) {
      console.error('❌ No hotel admin record found for user:', user.id);
      console.log('💡 User should have a record in hotel_admins table');
      return null;
    }
    
    console.log('✅ Found hotel admin:', {
      id: hotelAdmin.id,
      user_id: hotelAdmin.user_id,
      hotel_id: hotelAdmin.hotel_id,
      role: hotelAdmin.role
    });
    
    return hotelAdmin as unknown as HotelAdmin;
  } catch (error) {
    console.error('❌ Unexpected error in getHotelAdmin:', error);
    const errorMessage = processSupabaseError(error);
    console.error('Processed error:', errorMessage);
    return null;
  }
};

/**
 * Gets the hotel associated with a hotel admin
 * @param hotelAdmin - The hotel admin record
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export const getHotelByAdmin = async (
  hotelAdmin: HotelAdmin | null,
  supabaseClient?: SupabaseClient<Database>
): Promise<Hotel | null> => {
  try {
    if (!hotelAdmin) return null;
    
    // Use provided client or default to browser client
    const client = supabaseClient || supabase;
    
    const { data: hotel, error } = await client
      .from('hotels')
      .select('*')
      .eq('id', hotelAdmin.hotel_id)
      .maybeSingle();
      
    if (error) {
      const errorMessage = processSupabaseError(error);
      console.error('Error fetching hotel:', errorMessage);
      return null;
    }
    
    if (!hotel) {
      console.error('No hotel found with ID:', hotelAdmin.hotel_id);
      return null;
    }
    
    return hotel as unknown as Hotel;
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Unexpected error in getHotelByAdmin:', errorMessage);    return null;
  }
};

/**
 * Gets the hotel for the current user
 * @param user - The authenticated user
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export const getCurrentUserHotel = async (
  user: User | null,
  supabaseClient?: SupabaseClient<Database>
): Promise<Hotel | null> => {
  try {
    if (!user) return null;
    
    const hotelAdmin = await getHotelAdmin(user, supabaseClient);
    if (!hotelAdmin) {
      console.error('No hotel admin record found for current user:', user.id);
      return null;
    }
    
    return getHotelByAdmin(hotelAdmin, supabaseClient);
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Unexpected error in getCurrentUserHotel:', errorMessage);
    return null;
  }
};

/**
 * Gets the hotel ID for the current user
 */
/**
 * Gets the hotel ID for the current user
 * @param user - The authenticated user
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export const getCurrentUserHotelId = async (
  user: User | null,
  supabaseClient?: SupabaseClient<Database>
): Promise<string | null> => {
  try {
    if (!user) return null;
    
    const hotelAdmin = await getHotelAdmin(user, supabaseClient);
    if (!hotelAdmin) {
      console.error('No hotel admin record found for getting hotel ID for user:', user.id);
      return null;
    }
    
    return hotelAdmin.hotel_id;
  } catch (error) {
    const errorMessage = processSupabaseError(error);
    console.error('Unexpected error in getCurrentUserHotelId:', errorMessage);
    return null;
  }
};

/**
 * Gets all users that are associated with a hotel
 * @param hotelId - The hotel ID
 * @param supabaseClient - Optional Supabase client (for server-side usage)
 */
export async function getUsersByHotelId(
  hotelId: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    // Use provided client or default to browser client
    const client = supabaseClient || supabase;
    
    // First get all hotel_admins for the hotel
    const { data: hotelAdmins, error: adminError } = await client
      .from('hotel_admins')
      .select('user_id, role')
      .eq('hotel_id', hotelId);
      
    if (adminError) {
      throw adminError;
    }
    
    if (!hotelAdmins || hotelAdmins.length === 0) {
      return { data: [], error: null };
    }
    
    // Get user ids
    const userIds = hotelAdmins.map(admin => admin.user_id);
    
    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);
      
    if (profilesError) {
      throw profilesError;
    }
    
    // Combine data
    const users = hotelAdmins.map(admin => {
      const profile = profiles?.find(p => p.user_id === admin.user_id) || {};
      return {
        ...profile,
        role: admin.role
      };
    });
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching users by hotel ID:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}
