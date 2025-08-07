-- Enhanced Guests Table Schema
-- This SQL will add comprehensive guest information fields to the existing guests table

-- First, let's check if the guests table exists and see its current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add new columns to enhance guest information (only add if they don't exist)
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS room_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_room_number ON guests(room_number);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_guests_updated_at ON guests;
CREATE TRIGGER trigger_update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_guests_updated_at();

-- Add RLS (Row Level Security) policies for guests table
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Policy for hotel admins to view guests from their hotel
CREATE POLICY "Hotel admins can view guests from their hotel" ON guests
    FOR SELECT USING (
        hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for hotel admins to insert guests for their hotel
CREATE POLICY "Hotel admins can insert guests for their hotel" ON guests
    FOR INSERT WITH CHECK (
        hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for hotel admins to update guests from their hotel
CREATE POLICY "Hotel admins can update guests from their hotel" ON guests
    FOR UPDATE USING (
        hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for hotel admins to delete guests from their hotel
CREATE POLICY "Hotel admins can delete guests from their hotel" ON guests
    FOR DELETE USING (
        hotel_id IN (
            SELECT hotel_id FROM hotel_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create a view for guest details with hotel information
CREATE OR REPLACE VIEW guest_details AS
SELECT 
    g.id,
    g.hotel_id,
    g.hotel_name,
    g.name,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.nationality,
    g.address,
    g.city,
    g.state,
    g.country,
    g.room_number,
    g.created_at,
    g.updated_at
FROM guests g;

-- Grant permissions
GRANT SELECT ON guest_details TO authenticated;

-- Create a function to get guest statistics
CREATE OR REPLACE FUNCTION get_guest_statistics(target_hotel_id UUID DEFAULT NULL)
RETURNS TABLE(
    total_guests BIGINT,
    active_guests BIGINT,
    guests_with_email BIGINT,
    guests_with_phone BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_guests,
        COUNT(*) as active_guests, -- All guests are considered active
        COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') as guests_with_email,
        COUNT(*) FILTER (WHERE phone IS NOT NULL AND phone != '') as guests_with_phone
    FROM guests 
    WHERE (target_hotel_id IS NULL OR hotel_id = target_hotel_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_guest_statistics TO authenticated;

-- Verify the enhanced table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'guests' 
AND table_schema = 'public'
ORDER BY ordinal_position; 