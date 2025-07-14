-- =====================================================
-- SETUP ROOMS TABLE AND CHATBOT RELATIONSHIPS
-- Creates rooms table and establishes proper relationships for chatbot sessions
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create rooms table with proper hotel relationship
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'Standard',
  floor_number INTEGER,
  capacity INTEGER NOT NULL DEFAULT 2,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning', 'out_of_order')),
  amenities TEXT[], -- Array of amenities like ['wifi', 'balcony', 'sea_view', 'minibar']
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_cleaned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique room numbers per hotel
  CONSTRAINT unique_room_number_per_hotel UNIQUE(hotel_id, room_number)
);

-- 2. Add room_id column to chatbot_sessions table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chatbot_sessions' 
    AND column_name = 'room_id'
  ) THEN
    ALTER TABLE public.chatbot_sessions 
    ADD COLUMN room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL;
    
    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_room_id ON public.chatbot_sessions(room_id);
  END IF;
END $$;

-- 3. Add source column to room_service_orders to track if it came from chatbot
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'room_service_orders' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.room_service_orders 
    ADD COLUMN source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'chatbot', 'phone', 'app'));
  END IF;
END $$;

-- 4. Create RLS policies for rooms table
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Hotel admins can view rooms for their hotel
DROP POLICY IF EXISTS "Hotel admins can view their hotel rooms" ON public.rooms;
CREATE POLICY "Hotel admins can view their hotel rooms" ON public.rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hotel_admins ha
      WHERE ha.user_id = auth.uid() 
      AND ha.hotel_id = rooms.hotel_id
    )
  );

-- Hotel admins can insert rooms for their hotel
DROP POLICY IF EXISTS "Hotel admins can insert rooms for their hotel" ON public.rooms;
CREATE POLICY "Hotel admins can insert rooms for their hotel" ON public.rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hotel_admins ha
      WHERE ha.user_id = auth.uid() 
      AND ha.hotel_id = rooms.hotel_id
    )
  );

-- Hotel admins can update rooms for their hotel
DROP POLICY IF EXISTS "Hotel admins can update their hotel rooms" ON public.rooms;
CREATE POLICY "Hotel admins can update their hotel rooms" ON public.rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.hotel_admins ha
      WHERE ha.user_id = auth.uid() 
      AND ha.hotel_id = rooms.hotel_id
    )
  );

-- Hotel admins can delete rooms for their hotel
DROP POLICY IF EXISTS "Hotel admins can delete their hotel rooms" ON public.rooms;
CREATE POLICY "Hotel admins can delete their hotel rooms" ON public.rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.hotel_admins ha
      WHERE ha.user_id = auth.uid() 
      AND ha.hotel_id = rooms.hotel_id
    )
  );

-- 5. Update chatbot_sessions RLS policies to include room access
DROP POLICY IF EXISTS "Hotel admins can view chatbot sessions for their hotel" ON public.chatbot_sessions;
CREATE POLICY "Hotel admins can view chatbot sessions for their hotel" ON public.chatbot_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hotel_admins ha
      WHERE ha.user_id = auth.uid() 
      AND ha.hotel_id = chatbot_sessions.hotel_id
    )
  );

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_hotel_room ON public.chatbot_sessions(hotel_id, room_id);

-- 7. Create a function to get room-based chatbot metrics
CREATE OR REPLACE FUNCTION public.get_room_chatbot_metrics(target_hotel_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_rooms BIGINT,
  active_room_chat_sessions BIGINT,
  chat_sessions_today BIGINT,
  service_requests_from_bot BIGINT
) AS $$
DECLARE
  user_hotel_id UUID;
BEGIN
  -- Get user's hotel ID if not provided
  IF target_hotel_id IS NULL THEN
    SELECT ha.hotel_id INTO user_hotel_id
    FROM public.hotel_admins ha
    WHERE ha.user_id = auth.uid()
    LIMIT 1;
  ELSE
    user_hotel_id := target_hotel_id;
  END IF;

  -- Security check - ensure user has access to this hotel
  IF NOT EXISTS (
    SELECT 1 FROM public.hotel_admins ha
    WHERE ha.user_id = auth.uid() 
    AND ha.hotel_id = user_hotel_id
  ) THEN
    RAISE EXCEPTION 'Access denied to hotel metrics';
  END IF;

  RETURN QUERY
  SELECT 
    -- Total rooms for the hotel
    (SELECT COUNT(*) FROM public.rooms r WHERE r.hotel_id = user_hotel_id AND r.is_active = true),
    
    -- Active chat sessions (not ended)
    (SELECT COUNT(*) FROM public.chatbot_sessions cs 
     WHERE cs.hotel_id = user_hotel_id 
     AND cs.ended_at IS NULL),
    
    -- Chat sessions started today
    (SELECT COUNT(*) FROM public.chatbot_sessions cs 
     WHERE cs.hotel_id = user_hotel_id 
     AND cs.started_at >= CURRENT_DATE),
    
    -- Service requests from chatbot today
    (SELECT COUNT(*) FROM public.room_service_orders rso 
     WHERE rso.hotel_id = user_hotel_id 
     AND rso.source = 'chatbot' 
     AND rso.created_at >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_room_chatbot_metrics(UUID) TO authenticated;

-- 8. Insert sample rooms for existing hotels (if any exist)
DO $$
DECLARE
  hotel_record RECORD;
  room_types TEXT[] := ARRAY['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];
  room_type TEXT;
  floor_num INTEGER;
  room_num TEXT;
BEGIN
  -- For each existing hotel, create some sample rooms
  FOR hotel_record IN 
    SELECT id, name FROM public.hotels 
    WHERE is_active = true
    LIMIT 5 -- Limit to prevent too many inserts
  LOOP
    -- Create 10-15 sample rooms per hotel
    FOR i IN 1..12 LOOP
      -- Determine floor (1-3) and room type
      floor_num := ((i - 1) / 4) + 1;
      room_type := room_types[((i - 1) % 5) + 1];
      room_num := LPAD((floor_num * 100 + (i % 4) + 1)::TEXT, 3, '0');
      
      -- Insert room if it doesn't exist
      INSERT INTO public.rooms (
        hotel_id,
        room_number,
        room_type,
        floor_number,
        capacity,
        base_price,
        status,
        amenities,
        description,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        hotel_record.id,
        room_num,
        room_type,
        floor_num,
        CASE 
          WHEN room_type = 'Standard' THEN 2
          WHEN room_type = 'Deluxe' THEN 2
          WHEN room_type = 'Suite' THEN 4
          WHEN room_type = 'Executive' THEN 3
          ELSE 6
        END,
        CASE 
          WHEN room_type = 'Standard' THEN 99.99
          WHEN room_type = 'Deluxe' THEN 149.99
          WHEN room_type = 'Suite' THEN 249.99
          WHEN room_type = 'Executive' THEN 199.99
          ELSE 499.99
        END,
        CASE (i % 4)
          WHEN 0 THEN 'occupied'
          WHEN 1 THEN 'available'
          WHEN 2 THEN 'cleaning'
          ELSE 'available'
        END,
        CASE 
          WHEN room_type IN ('Suite', 'Presidential') THEN ARRAY['wifi', 'balcony', 'minibar', 'room_service']
          WHEN room_type = 'Executive' THEN ARRAY['wifi', 'work_desk', 'minibar']
          ELSE ARRAY['wifi', 'tv']
        END,
        'Sample ' || room_type || ' room for ' || hotel_record.name,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (hotel_id, room_number) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Created sample rooms for hotel: %', hotel_record.name;
  END LOOP;
END $$;

-- 9. Verification queries
SELECT 'Setup complete! Verification results:' as status;

SELECT 'Rooms created:' as check_type;
SELECT 
  h.name as hotel_name,
  COUNT(r.id) as room_count,
  COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms,
  COUNT(CASE WHEN r.status = 'occupied' THEN 1 END) as occupied_rooms
FROM public.hotels h
LEFT JOIN public.rooms r ON h.id = r.hotel_id
WHERE h.is_active = true
GROUP BY h.id, h.name
ORDER BY h.name;

SELECT 'Sample room details:' as check_type;
SELECT 
  h.name as hotel_name,
  r.room_number,
  r.room_type,
  r.floor_number,
  r.capacity,
  r.base_price,
  r.status,
  r.amenities
FROM public.hotels h
JOIN public.rooms r ON h.id = r.hotel_id
WHERE h.is_active = true
ORDER BY h.name, r.room_number
LIMIT 10;
