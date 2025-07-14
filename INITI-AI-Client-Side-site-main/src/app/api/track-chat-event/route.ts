// filepath: src/app/api/track-chat-event/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.hotel_id || !eventData.session_id || !eventData.event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: hotel_id, session_id, and event_type' },
        { status: 400 }
      );
    }

    // TODO: In production, store chat events in Supabase
    // For now, just log the chat event tracking
    console.log('💬 Chat event tracked:', {
      hotel_id: eventData.hotel_id,
      session_id: eventData.session_id,
      room_number: eventData.room_number,
      event_type: eventData.event_type,
      message: eventData.message,
      timestamp: new Date().toISOString(),
      user_message: eventData.user_message,
      bot_response: eventData.bot_response
    });

    // TODO: Store in Supabase chat_events table
    /* Example Supabase integration:
    const { data, error } = await supabase
      .from('chat_events')
      .insert({
        hotel_id: eventData.hotel_id,
        session_id: eventData.session_id,
        room_number: eventData.room_number,
        event_type: eventData.event_type,
        message: eventData.message,
        user_message: eventData.user_message,
        bot_response: eventData.bot_response,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to store chat event:', error);
      return NextResponse.json(
        { error: 'Failed to store chat event data' },
        { status: 500 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Chat event tracked successfully',
      event_id: `${eventData.session_id}-${Date.now()}`
    });

  } catch (error) {
    console.error('❌ Chat event tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
