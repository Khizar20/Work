-- =====================================================
-- FIX HOTEL RELATIONSHIP FOR EXISTING USERS
-- Run this in your Supabase SQL Editor to create proper relationships
-- =====================================================

-- 1. First, let's check current state
SELECT 'Current profiles without hotel admin:' as status;
SELECT p.user_id, p.name, p.created_at
FROM profiles p
LEFT JOIN hotel_admins ha ON p.user_id = ha.user_id
WHERE ha.user_id IS NULL;

-- 2. Create a default hotel if it doesn't exist
INSERT INTO public.hotels (
  name, 
  slug, 
  address, 
  city, 
  region,
  country, 
  description, 
  email,
  phone,
  timezone,
  is_active
) 
SELECT 
  'INITI AI Admin Hotel',
  'initi-ai-admin',
  '123 Business District',
  'Marbella',
  'Andalusia',
  'Spain',
  'Main administrative hotel for INITI AI dashboard users',
  'admin@initi-ai.com',
  '+34-952-123-456',
  'Europe/Madrid',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.hotels WHERE slug = 'initi-ai-admin'
);

-- 3. Get the hotel ID for reference
DO $$
DECLARE
    default_hotel_id UUID;
    profile_record RECORD;
    user_name TEXT;
BEGIN
    -- Get the default hotel ID
    SELECT id INTO default_hotel_id 
    FROM public.hotels 
    WHERE slug = 'initi-ai-admin' 
    LIMIT 1;

    -- Create hotel_admins records for all profiles that don't have one
    FOR profile_record IN 
        SELECT p.user_id, p.name, p.created_at
        FROM profiles p
        LEFT JOIN hotel_admins ha ON p.user_id = ha.user_id
        WHERE ha.user_id IS NULL
    LOOP
        -- Get the user's name (fallback to email if name is null)
        SELECT COALESCE(
            profile_record.name,
            au.raw_user_meta_data->>'full_name',
            au.email,
            'Admin User'
        ) INTO user_name
        FROM auth.users au 
        WHERE au.id = profile_record.user_id;

        -- Insert hotel admin record
        INSERT INTO public.hotel_admins (
            user_id,
            hotel_id,
            role,
            fullname,
            created_at,
            updated_at
        ) VALUES (
            profile_record.user_id,
            default_hotel_id,
            'admin',
            user_name,
            profile_record.created_at,
            NOW()
        );

        RAISE NOTICE 'Created hotel admin for user: % (ID: %)', user_name, profile_record.user_id;
    END LOOP;
END $$;

-- 4. Verify the relationships were created
SELECT 'Verification - All profiles with hotel assignments:' as status;
SELECT 
  p.name as profile_name,
  p.user_id,
  ha.role as admin_role,
  ha.fullname as admin_name,
  h.name as hotel_name,
  h.city as hotel_city
FROM profiles p
JOIN hotel_admins ha ON p.user_id = ha.user_id
JOIN hotels h ON ha.hotel_id = h.id
ORDER BY p.created_at;

-- 5. Create a function to automatically assign hotel admin for future users
CREATE OR REPLACE FUNCTION public.ensure_hotel_admin_assignment()
RETURNS TRIGGER AS $$
DECLARE
  default_hotel_id UUID;
  user_full_name TEXT;
BEGIN
  -- Get the default hotel ID
  SELECT id INTO default_hotel_id 
  FROM public.hotels 
  WHERE slug = 'initi-ai-admin' 
  LIMIT 1;

  -- If no default hotel exists, create one
  IF default_hotel_id IS NULL THEN
    INSERT INTO public.hotels (
      name, slug, address, city, region, country, 
      description, email, phone, timezone, is_active
    ) VALUES (
      'INITI AI Admin Hotel', 'initi-ai-admin', '123 Business District',
      'Marbella', 'Andalusia', 'Spain',
      'Main administrative hotel for INITI AI dashboard users',
      'admin@initi-ai.com', '+34-952-123-456', 'Europe/Madrid', true
    ) RETURNING id INTO default_hotel_id;
  END IF;

  -- Get user's full name
  SELECT COALESCE(
    NEW.name,
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.user_id),
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    'Admin User'
  ) INTO user_full_name;

  -- Create hotel admin record
  INSERT INTO public.hotel_admins (
    user_id, hotel_id, role, fullname, created_at, updated_at
  ) VALUES (
    NEW.user_id, default_hotel_id, 'admin', user_full_name, NOW(), NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to auto-assign hotel admin when profile is created
DROP TRIGGER IF EXISTS ensure_hotel_admin_on_profile_creation ON public.profiles;
CREATE TRIGGER ensure_hotel_admin_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.ensure_hotel_admin_assignment();

-- 7. Update RLS policies to ensure proper access
-- Enable RLS on hotel_admins if not already enabled
ALTER TABLE public.hotel_admins ENABLE ROW LEVEL SECURITY;

-- Update hotel_admins policies
DROP POLICY IF EXISTS "Hotel admins can view their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can view their own record" ON public.hotel_admins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hotel admins can update their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can update their own record" ON public.hotel_admins
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Final verification query
SELECT 'Final count verification:' as status;
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM hotel_admins) as total_hotel_admins,
  (SELECT COUNT(*) FROM profiles p WHERE EXISTS (
    SELECT 1 FROM hotel_admins ha WHERE ha.user_id = p.user_id
  )) as profiles_with_hotel_assignment;
