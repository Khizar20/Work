// Enhanced user profile service for enterprise dashboard - FIXED VERSION
import { createClient } from './supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  // Profile info
  profile_id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  location?: string | null;
  department?: string | null;
  timezone?: string | null;
  profile_role: string;
  skills?: string[] | null;
  avatar_url?: string | null;
  profile_created_at: string;
  profile_updated_at: string;
  
  // Hotel admin info
  admin_id?: string | null;
  hotel_id?: string | null;
  admin_role?: string | null;
  admin_fullname?: string | null;
  admin_created_at?: string | null;
  
  // Hotel info
  hotel_name?: string | null;
  hotel_slug?: string | null;
  hotel_address?: string | null;
  hotel_city?: string | null;
  hotel_region?: string | null;
  hotel_country?: string | null;
  hotel_phone?: string | null;
  hotel_email?: string | null;
  hotel_website?: string | null;
  hotel_timezone?: string | null;
  hotel_active?: boolean | null;
  
  // User auth info
  user_email: string;
  user_created_at: string;
  last_login?: string | null;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  location?: string;
  department?: string;
  timezone?: string;
  skills?: string[];
  avatar_url?: string;
}

export interface HotelAdminUpdateData {
  fullname?: string;
  role?: 'admin' | 'manager' | 'support';
}

class UserProfileService {
  private supabase = createClient();

  /**
   * Get complete user profile with hotel information - FIXED VERSION
   */
  async getUserProfile(): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User authentication error:', userError);
        return { data: null, error: userError.message };
      }
      
      if (!user) {
        console.error('❌ No user found');
        return { data: null, error: 'User not authenticated' };
      }

      console.log('🔑 Fetching profile for user:', user.id);

      // Step 1: Get profile data
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        // If profile doesn't exist, return error so we know to create it
        if (profileError.code === 'PGRST116') {
          return { data: null, error: 'Profile not found in database' };
        }
        return { data: null, error: profileError.message };
      }

      if (!profileData) {
        console.error('❌ No profile data found');
        return { data: null, error: 'Profile not found' };
      }

      console.log('✅ Profile data found:', profileData);      // Step 2: Get hotel admin data separately
      const { data: hotelAdminData, error: hotelAdminError } = await this.supabase
        .from('hotel_admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (hotelAdminError && hotelAdminError.code !== 'PGRST116') {
        console.error('⚠️ Hotel admin error:', hotelAdminError);
      }

      console.log('🏨 Hotel admin data:', hotelAdminData);

      // Step 3: Get hotel data if hotel admin exists
      let hotelData = null;
      if (hotelAdminData?.hotel_id) {
        const { data: hotel, error: hotelError } = await this.supabase
          .from('hotels')
          .select('*')
          .eq('id', hotelAdminData.hotel_id)
          .single();

        if (hotelError) {
          console.error('⚠️ Hotel error:', hotelError);
        } else {
          hotelData = hotel;
          console.log('✅ Hotel data found:', hotelData);
        }
      }

      // Step 4: Combine all data into UserProfile format
      const userProfile: UserProfile = {
        profile_id: profileData.id,
        user_id: profileData.user_id || user.id,
        name: profileData.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone: profileData.phone || null,
        location: profileData.location || null,
        department: profileData.department || null,
        timezone: profileData.timezone || null,
        profile_role: profileData.role || 'user',
        skills: profileData.skills || null,
        avatar_url: profileData.avatar_url || null,
        profile_created_at: profileData.created_at,
        profile_updated_at: profileData.updated_at,
        user_email: user.email || '',
        user_created_at: user.created_at,
        last_login: user.last_sign_in_at || null,
        
        // Hotel admin information
        admin_id: hotelAdminData?.id || null,
        hotel_id: hotelAdminData?.hotel_id || null,
        admin_role: hotelAdminData?.role || null,
        admin_fullname: (hotelAdminData as any)?.fullname || null,
        admin_created_at: hotelAdminData?.created_at || null,
        
        // Hotel information
        hotel_name: hotelData?.name || null,
        hotel_slug: hotelData?.slug || null,
        hotel_address: hotelData?.address || null,
        hotel_city: hotelData?.city || null,
        hotel_region: hotelData?.region || null,
        hotel_country: hotelData?.country || null,
        hotel_phone: hotelData?.phone || null,
        hotel_email: hotelData?.email || null,
        hotel_website: hotelData?.website || null,
        hotel_timezone: hotelData?.timezone || null,
        hotel_active: hotelData?.is_active || null
      };

      console.log('✅ Final User Profile:', {
        profile_id: userProfile.profile_id,
        name: userProfile.name,
        hotel_name: userProfile.hotel_name,
        admin_role: userProfile.admin_role
      });

      return { data: userProfile, error: null };
    } catch (error) {
      console.error('💥 Unexpected error fetching user profile:', error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Update user profile information
   */
  async updateProfile(updates: ProfileUpdateData): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update hotel admin information
   */
  async updateHotelAdmin(updates: HotelAdminUpdateData): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await this.supabase
        .from('hotel_admins')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating hotel admin:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating hotel admin:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check database connection and user setup - ENHANCED VERSION
   */
  async checkConnection(): Promise<{ 
    success: boolean; 
    error?: string; 
    user?: User;
    profile?: UserProfile;
  }> {
    try {
      console.log('🔍 Starting connection check...');

      // Step 1: Check user authentication
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Authentication failed:', userError);
        return { 
          success: false, 
          error: `Authentication error: ${userError.message}` 
        };
      }

      if (!user) {
        console.error('❌ No authenticated user');
        return { 
          success: false, 
          error: 'User not authenticated' 
        };
      }

      console.log('✅ User authenticated:', user.email);

      // Step 2: Test database connection
      try {
        const { error: dbError } = await this.supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (dbError) {
          console.error('❌ Database connection failed:', dbError);
          return { 
            success: false, 
            error: `Database connection failed: ${dbError.message}`,
            user
          };
        }
        console.log('✅ Database connection successful');
      } catch (error) {
        console.error('❌ Database connection error:', error);
        return {
          success: false,
          error: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          user
        };
      }

      // Step 3: Get user profile
      const { data: profile, error: profileError } = await this.getUserProfile();
      
      if (profileError) {
        console.warn('⚠️ Profile issue:', profileError);
        return { 
          success: true, // Still successful connection, just missing profile
          error: `Profile issue: ${profileError}`,
          user 
        };
      }

      console.log('✅ Profile loaded successfully');

      return { 
        success: true, 
        user,
        profile: profile || undefined
      };
    } catch (error) {
      console.error('💥 Connection check failed:', error);
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Initialize user profile after registration
   */
  async initializeNewUser(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if profile already exists
      const { data: existingProfile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        return { success: true, error: null }; // Already initialized
      }

      // Create profile (this should be done by the trigger, but just in case)
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email || 'New User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { success: false, error: profileError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error initializing new user:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

// Export the service
export const userProfileService = new UserProfileService();
