import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  'https://fxxzotnhkahdrehvkwhb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE'
);

export async function GET(request: NextRequest) {
  try {
    const hotel_id = "8a1e6805-9253-4dd5-8893-0de3d7815555";
    
    console.log('🍽️ Fetching room service for hotel:', hotel_id);
    
    const { data: items, error } = await supabase
      .from('room_service_items')
      .select('*')
      .eq('hotel_id', hotel_id)
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        data: [],
        count: 0
      });
    }
    
    console.log('✅ Found', items?.length || 0, 'items');
    
    // Return in format Botpress expects (wrapped in object)
    return NextResponse.json({
      success: true,
      data: items || [],
      count: items?.length || 0,
      message: `Found ${items?.length || 0} room service items`
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch room service items',
      data: [],
      count: 0
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hotel_id } = await request.json();
    const finalHotelId = hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
    
    console.log('🍽️ POST: Fetching room service for hotel:', finalHotelId);
    
    const { data: items, error } = await supabase
      .from('room_service_items')
      .select('*')
      .eq('hotel_id', finalHotelId)
      .eq('available', true)
      .order('name');
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        data: [],
        count: 0
      });
    }
    
    console.log('✅ POST: Found', items?.length || 0, 'items');
    
    return NextResponse.json({
      success: true,
      data: items || [],
      count: items?.length || 0,
      message: `Found ${items?.length || 0} room service items`
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch room service items',
      data: [],
      count: 0
    });
  }
} 