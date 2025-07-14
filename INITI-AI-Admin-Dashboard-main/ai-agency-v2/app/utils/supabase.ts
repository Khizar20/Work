import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { PostgrestError } from '@supabase/supabase-js';
import { processSupabaseError, processStorageError } from './error-handling';

// Create a client for use in browser components
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Typed data fetching helpers
export async function getRooms() {
  try {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}

export async function getBookings() {
  try {
    // @ts-ignore - Table 'bookings' might not be in the type definitions
    const { data, error } = await supabase
      // @ts-ignore - Table 'bookings' might not be in the type definitions
      .from('bookings')
      .select('*, rooms(*)');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}

export async function getStaff() {
  try {
    // @ts-ignore - Table 'staff' might not be in the type definitions
    const { data, error } = await supabase.from('staff').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Type definition for user profile
export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  timezone?: string;
  skills?: string[];
  avatarUrl?: string;
  hotel: any | null;
  lastLogin: string | null;
  createdAt: string;
}

// User profile data
export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    // Get user from auth
    const { data: authData, error: userError } = await supabase.auth.getUser(userId);
    
    if (userError) throw userError;
    
    if (!authData.user) {
      throw new Error('User not found');
    }
    
    const user = authData.user;
    
    // Get user's profile data from the profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') { // Not found is acceptable
      console.warn('Error fetching user profile:', profileError);
    }
    
    // Get user's hotel admin info
    const { data: hotelAdmin, error: adminError } = await supabase
      .from('hotel_admins')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (adminError && adminError.code !== 'PGRST116') { // Not found is acceptable
      console.warn('Error fetching hotel admin:', adminError);
    }
    
    // Get hotel info if available
    let hotel = null;
    if (hotelAdmin) {
      const hotelId = hotelAdmin.hotel_id; 
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();
        
      if (!hotelError) {
        hotel = hotelData;
      } else {
        console.warn('Error fetching hotel:', hotelError);
      }
    }
    
    const profile: UserProfile = {
      id: user.id,
      name: user.user_metadata?.full_name || userProfile?.name || (user.email ? user.email.split('@')[0] : 'Unknown'),
      email: user.email || null,
      role: hotelAdmin?.role || userProfile?.role || 'User',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      department: userProfile?.department || '',
      timezone: userProfile?.timezone || '',
      skills: userProfile?.skills || [],
      hotel: hotel,
      lastLogin: user.last_sign_in_at || null,
      createdAt: user.created_at,
      avatarUrl: userProfile?.avatar_url || undefined,
    };

    return { data: profile, error: null };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Type definition for profile update data
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: ProfileUpdateData): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    // First check if the profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // Prepare data for Supabase
    const supabaseData = {
      name: profileData.name,
      phone: profileData.phone,
      location: profileData.location,
      department: profileData.department,
      timezone: profileData.timezone,
      skills: profileData.skills,
      avatar_url: profileData.avatarUrl,
      role: profileData.role,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update(supabaseData)
        .eq('user_id', userId)
        .select('*')
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('profiles')
        .insert({ 
          ...supabaseData, 
          created_at: new Date().toISOString() 
        })
        .select('*')
        .single();
    }
    
    if (result.error) throw result.error;
    
    // Update user metadata if name has changed
    if (profileData.name) {
      await supabase.auth.updateUser({
        data: { full_name: profileData.name }
      });
    }
    
    // Get the complete updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating profile:", error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File): Promise<{ data: string | null; error: string | null }> {
  try {
    // Get file extension
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/profile-image.${fileExt}`;
    
    // Upload the file to Supabase storage
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw error;
    
    // Get the public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    // Update the profile with the new avatar URL
    if (data?.publicUrl) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', userId);
        
      if (updateError) {
        console.warn('Failed to update profile with new avatar URL:', updateError);
      }
    }
    
    return { data: data?.publicUrl || null, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { data: null, error: processStorageError(error) };
  }
}

// Dashboard metrics type - Updated for chatbot focus
export interface DashboardMetrics {
  totalRooms: number;
  activeRoomChatSessions: number;
  chatSessionsToday: number;
  serviceRequestsFromBot: number;
}

// Dashboard metrics
export async function getDashboardMetrics(): Promise<{ data: DashboardMetrics | null; error: string | null }> {
  try {
    console.log('🤖 Fetching chatbot-focused dashboard metrics...');    // Try to use the database function first, fall back to mock data if not available
    try {
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_room_chatbot_metrics');
      
      if (metricsError) {
        console.warn('Database function not available, using mock data:', metricsError.message);
        throw metricsError;
      }
      
      if (metricsData && metricsData.length > 0) {
        const metrics: DashboardMetrics = {
          totalRooms: metricsData[0].total_rooms || 0,
          activeRoomChatSessions: metricsData[0].active_room_chat_sessions || 0,
          chatSessionsToday: metricsData[0].chat_sessions_today || 0,
          serviceRequestsFromBot: metricsData[0].service_requests_from_bot || 0,
        };
        
        console.log('✅ Real chatbot dashboard metrics loaded:', metrics);
        return { data: metrics, error: null };
      }
    } catch (dbError) {
      console.warn('Database function failed, falling back to mock data');
    }
    
    // Fallback to mock data during transition period
    const metrics: DashboardMetrics = {
      totalRooms: 45,
      activeRoomChatSessions: 12,
      chatSessionsToday: 28,
      serviceRequestsFromBot: 8,
    };

    console.log('✅ Chatbot dashboard metrics loaded (mock):', metrics);
    return { data: metrics, error: null };
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    return { data: null, error: 'Database table not found' };
  }
}

// Chatbot metrics type
export interface ChatbotMetrics {
  totalSessionsToday: number;
  uniqueUsersToday: number;
  avgResponseTime: number;
  satisfactionRate: number;
  userRetention: number;
}

// Chatbot metrics
export async function getChatbotMetrics(timeRange = 'today'): Promise<{ data: ChatbotMetrics | null; error: string | null }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    let startDate;
    
    // Calculate date range based on timeRange parameter
    switch (timeRange) {
      case 'week':
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        startDate = lastWeek.toISOString().split('T')[0];
        break;
      case 'month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = lastMonth.toISOString().split('T')[0];
        break;
      default:
        startDate = today;
    }

    // In a real implementation, these would be actual database queries
    // For now, returning mock data
    const metrics: ChatbotMetrics = {
      totalSessionsToday: 247,
      uniqueUsersToday: 153,
      avgResponseTime: 1.8, // seconds
      satisfactionRate: 87, // percentage
      userRetention: 74, // percentage
    };
      return { data: metrics, error: null };
    
    /* Example of actual implementation for future reference:
    const [
      totalSessions,
      uniqueUsers,
      avgResponseTime,
      satisfactionData,
      retentionData
    ] = await Promise.all([
      supabase.from('chatbot_sessions').select('count').gte('created_at', startDate).single(),
      supabase.from('chatbot_sessions').select('user_id', { count: 'exact', head: true }).gte('created_at', startDate),
      supabase.from('chatbot_messages').select('response_time').gte('created_at', startDate),
      supabase.from('chatbot_feedback').select('rating').gte('created_at', startDate),
      supabase.from('chatbot_users').select('count').eq('returning_user', true).gte('last_session', startDate).single(),
    ]);
    
    // Check for errors in any of the queries
    for (const query of [totalSessions, uniqueUsers, avgResponseTime, satisfactionData, retentionData]) {
      if (query.error) {
        throw query.error;
      }
    }
    
    // Calculate average response time
    const responseTimeSum = avgResponseTime?.data?.reduce((acc, curr) => acc + curr.response_time, 0) || 0;
    const responseTimeCount = avgResponseTime?.data?.length || 1;
    
    // Calculate satisfaction rate
    const satisfactionSum = satisfactionData?.data?.reduce((acc, curr) => acc + curr.rating, 0) || 0;
    const satisfactionCount = satisfactionData?.data?.length || 1;
    
    return {
      data: {
        totalSessionsToday: totalSessions?.data?.count || 0,
        uniqueUsersToday: uniqueUsers?.count || 0,
        avgResponseTime: Number((responseTimeSum / responseTimeCount).toFixed(1)),
        satisfactionRate: Math.round((satisfactionSum / (satisfactionCount * 5)) * 100),
        userRetention: retentionData?.data?.count || 0,
      },
      error: null
    };
    */  } catch (error) {
    console.error('Error fetching chatbot metrics:', error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Get hotel ID for a user
export async function getUserHotelId(userId: string): Promise<{ data: string | null; error: string | null }> {
  try {
    // Get user's hotel admin info
    const { data: hotelAdmin, error: adminError } = await supabase
      .from('hotel_admins')
      .select('hotel_id')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows match
      
    if (adminError) {
      throw adminError;
    }
    
    if (!hotelAdmin) {
      // User is not a hotel admin
      return { data: null, error: null };
    }
    
    return { data: hotelAdmin.hotel_id, error: null };
  } catch (error) {
    console.error("Error getting user hotel ID:", error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Get hotel base URL for QR code generation
export async function getHotelBaseUrl(hotelId: string): Promise<{ data: string | null; error: string | null }> {
  try {
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();
      
    if (hotelError) {
      throw hotelError;
    }
    
    // Return base URL or fallback to production URL
    // Note: base_url column may not exist yet - add it via SQL script
    const baseUrl = (hotel as any)?.base_url || 'https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app';
    return { data: baseUrl, error: null };
  } catch (error) {
    console.error("Error getting hotel base URL:", error);
    // Return fallback URL on error
    return { 
      data: 'https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app', 
      error: processSupabaseError(error) 
    };
  }
}

// Get rooms with QR codes for a hotel
export async function getHotelRooms(hotelId: string): Promise<{ data: Room[] | null; error: string | null }> {
  try {
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('room_number');
      
    if (roomsError) {
      throw roomsError;
    }
    
    // Transform database format to component format
    const transformedRooms: Room[] = (rooms || []).map(room => ({
      id: room.id,
      number: room.room_number,
      type: room.room_type || 'Standard',
      capacity: room.capacity || 2,
      price: room.base_price || 99.99, // Use base_price instead of price_per_night
      status: room.status as 'available' | 'occupied' | 'cleaning' | 'maintenance',
      notes: room.description || undefined, // Use description as notes
      qr_code_url: (room as any).qr_code_url || undefined, // These columns may not exist yet
      qr_session_id: (room as any).qr_session_id || undefined
    }));
    
    return { data: transformedRooms, error: null };
  } catch (error) {
    console.error("Error getting hotel rooms:", error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Regenerate QR codes for all rooms in a hotel
export async function regenerateHotelQRCodes(hotelId: string): Promise<{ data: number | null; error: string | null }> {
  try {
    // For now, since the RPC function may not exist, we'll simulate regeneration
    // by returning the count of rooms for this hotel
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('hotel_id', hotelId);
      
    if (roomsError) {
      throw roomsError;
    }
    
    const roomCount = rooms?.length || 0;
    console.log(`Would regenerate QR codes for ${roomCount} rooms`);
    
    // TODO: Implement actual QR code regeneration when database function is available
    // const { data, error } = await supabase
    //   .rpc('regenerate_hotel_qr_codes', { p_hotel_id: hotelId });
    
    return { data: roomCount, error: null };
  } catch (error) {
    console.error("Error regenerating QR codes:", error);
    return { data: null, error: processSupabaseError(error) };
  }
}

// Update hotel base URL
export async function updateHotelBaseUrl(hotelId: string, baseUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('hotels')
      .update({ base_url: baseUrl, updated_at: new Date().toISOString() })
      .eq('id', hotelId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating hotel base URL:", error);
    return { success: false, error: processSupabaseError(error) };
  }
}

// Extended Room interface for QR code support
interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  notes?: string;
  qr_code_url?: string;
  qr_session_id?: string;
}