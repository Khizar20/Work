-- QR Code and Base URL Database Schema Update
-- This script adds QR code generation support to the existing database schema

-- Step 1: Add base_url column to hotels table
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS base_url text DEFAULT 'https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app';

-- Step 2: Add QR code related columns to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS qr_code_url text,
ADD COLUMN IF NOT EXISTS qr_session_id uuid DEFAULT gen_random_uuid();

-- Step 3: Create function to generate QR code URL
CREATE OR REPLACE FUNCTION generate_room_qr_code(
    p_hotel_id uuid, 
    p_room_number text, 
    p_session_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_url text;
    v_session_id uuid;
BEGIN
    -- Get hotel base URL
    SELECT base_url INTO v_base_url 
    FROM public.hotels 
    WHERE id = p_hotel_id;
    
    -- Use provided session_id or generate new one
    v_session_id := COALESCE(p_session_id, gen_random_uuid());
    
    -- Return formatted QR code URL
    RETURN v_base_url || '/chat?hotel_id=' || p_hotel_id || '&room_number=' || p_room_number || '&session_id=' || v_session_id;
END;
$$;

-- Step 4: Create trigger function to auto-generate QR codes for new rooms
CREATE OR REPLACE FUNCTION auto_generate_room_qr_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate QR session ID if not provided
    IF NEW.qr_session_id IS NULL THEN
        NEW.qr_session_id := gen_random_uuid();
    END IF;
    
    -- Generate QR code URL
    NEW.qr_code_url := generate_room_qr_code(NEW.hotel_id, NEW.room_number, NEW.qr_session_id);
    
    RETURN NEW;
END;
$$;

-- Step 5: Create trigger for automatic QR code generation
DROP TRIGGER IF EXISTS trigger_auto_generate_qr_code ON public.rooms;
CREATE TRIGGER trigger_auto_generate_qr_code
    BEFORE INSERT OR UPDATE OF hotel_id, room_number, qr_session_id
    ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_room_qr_code();

-- Step 6: Update existing rooms with QR codes
UPDATE public.rooms 
SET 
    qr_session_id = gen_random_uuid(),
    qr_code_url = generate_room_qr_code(hotel_id, room_number, gen_random_uuid())
WHERE qr_code_url IS NULL;

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_qr_session_id ON public.rooms(qr_session_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id_room_number ON public.rooms(hotel_id, room_number);

-- Step 8: Create function to regenerate QR codes for a hotel (useful for URL changes)
CREATE OR REPLACE FUNCTION regenerate_hotel_qr_codes(p_hotel_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count integer;
BEGIN
    -- Update all rooms for the hotel with new QR codes
    UPDATE public.rooms 
    SET 
        qr_session_id = gen_random_uuid(),
        qr_code_url = generate_room_qr_code(hotel_id, room_number, gen_random_uuid())
    WHERE hotel_id = p_hotel_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- Step 9: Create view for easy QR code data retrieval
CREATE OR REPLACE VIEW room_qr_codes AS
SELECT 
    r.id as room_id,
    r.hotel_id,
    r.room_number,
    r.room_type,
    r.floor_number,
    r.capacity,
    r.base_price,
    r.status,
    r.qr_code_url,
    r.qr_session_id,
    h.name as hotel_name,
    h.base_url as hotel_base_url,
    h.slug as hotel_slug
FROM public.rooms r
JOIN public.hotels h ON r.hotel_id = h.id
WHERE r.is_active = true AND h.is_active = true;

-- Step 10: Grant necessary permissions
GRANT SELECT ON room_qr_codes TO authenticated;
GRANT EXECUTE ON FUNCTION generate_room_qr_code(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION regenerate_hotel_qr_codes(uuid) TO authenticated;

-- Step 11: Insert sample data (if needed for testing)
-- This will only run if there are no existing hotels

DO $$
BEGIN
    -- Check if we need to create sample data
    IF NOT EXISTS (SELECT 1 FROM public.hotels LIMIT 1) THEN
        -- Insert sample hotel
        INSERT INTO public.hotels (name, slug, address, city, country, description, email, base_url)
        VALUES (
            'INITI AI Default Hotel',
            'initi-ai-default',
            '123 Tech Street',
            'San Francisco',
            'USA',
            'Default hotel for INITI AI system',
            'admin@initi-ai.com',
            'https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app'
        );
        
        -- Insert sample rooms (will auto-generate QR codes via trigger)
        INSERT INTO public.rooms (hotel_id, room_number, room_type, floor_number, capacity, base_price)
        SELECT 
            h.id,
            '10' || generate_series(1, 5)::text,
            'Standard',
            1,
            2,
            99.99
        FROM public.hotels h 
        WHERE h.slug = 'initi-ai-default';
        
        INSERT INTO public.rooms (hotel_id, room_number, room_type, floor_number, capacity, base_price)
        SELECT 
            h.id,
            '20' || generate_series(1, 3)::text,
            'Deluxe',
            2,
            3,
            149.99
        FROM public.hotels h 
        WHERE h.slug = 'initi-ai-default';
        
        INSERT INTO public.rooms (hotel_id, room_number, room_type, floor_number, capacity, base_price)
        SELECT 
            h.id,
            '30' || generate_series(1, 2)::text,
            'Suite',
            3,
            4,
            249.99
        FROM public.hotels h 
        WHERE h.slug = 'initi-ai-default';
        
        RAISE NOTICE 'Sample hotel and rooms created with QR codes';
    ELSE
        RAISE NOTICE 'Hotels already exist, skipping sample data creation';
    END IF;
END
$$;

-- Step 12: Verification queries (uncomment to test)
/*
-- Verify the setup
SELECT 'Hotels with base_url' as check_type, count(*) as count 
FROM public.hotels 
WHERE base_url IS NOT NULL;

SELECT 'Rooms with QR codes' as check_type, count(*) as count 
FROM public.rooms 
WHERE qr_code_url IS NOT NULL;

-- Sample QR code data
SELECT 
    hotel_name,
    room_number,
    room_type,
    qr_code_url,
    qr_session_id
FROM room_qr_codes 
LIMIT 5;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ QR Code database setup completed successfully!';
    RAISE NOTICE '📱 Rooms table now has qr_code_url and qr_session_id columns';
    RAISE NOTICE '🏨 Hotels table now has base_url column';
    RAISE NOTICE '🔧 Automatic QR code generation triggers are active';
    RAISE NOTICE '📊 Use room_qr_codes view for easy data access';
END
$$;
