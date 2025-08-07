-- Add check_in and check_out fields to guests table
-- Run this SQL in your Supabase SQL editor

-- Add check_in and check_out timestamp fields
ALTER TABLE public.guests 
ADD COLUMN check_in timestamptz,
ADD COLUMN check_out timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN public.guests.check_in IS 'Check-in date and time for the guest';
COMMENT ON COLUMN public.guests.check_out IS 'Check-out date and time for the guest';

-- Create index for better query performance on check-in/check-out dates
CREATE INDEX IF NOT EXISTS idx_guests_check_dates ON public.guests(check_in, check_out);

-- Update RLS policies to include new fields
-- The existing RLS policies should automatically apply to new columns
-- But let's verify the policy is working correctly

-- Test the new fields
SELECT 
    id,
    first_name,
    last_name,
    room_number,
    check_in,
    check_out,
    created_at
FROM public.guests 
LIMIT 5;

-- Optional: Add a constraint to ensure check_out is after check_in
-- ALTER TABLE public.guests 
-- ADD CONSTRAINT check_out_after_check_in 
-- CHECK (check_out IS NULL OR check_in IS NULL OR check_out > check_in); 