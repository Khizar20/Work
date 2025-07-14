-- =====================================================
-- AUTO USER ASSIGNMENT SETUP
-- Creates relationships and triggers for automatic user assignment
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. First, ensure all tables have proper foreign key relationships
-- (Most are already in place based on your schema, but let's verify)

-- Ensure profiles table has proper foreign key to auth.users
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure hotel_admins table has proper foreign keys
ALTER TABLE public.hotel_admins 
DROP CONSTRAINT IF EXISTS fk_user_id;

ALTER TABLE public.hotel_admins 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create or ensure default hotel exists
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
  'INITI AI Default Hotel',
  'initi-ai-default',
  '123 Admin Plaza',
  'Marbella',
  'Andalusia',
  'Spain',
  'Default hotel assignment for new admin users',
  'admin@initi-ai.com',
  '+34-952-000-000',
  'Europe/Madrid',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.hotels WHERE slug = 'initi-ai-default'
);

-- 3. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  default_hotel_id UUID;
  user_display_name TEXT;
BEGIN
  -- Get the default hotel ID
  SELECT id INTO default_hotel_id 
  FROM public.hotels 
  WHERE slug = 'initi-ai-default' 
  LIMIT 1;

  -- Determine user display name
  SELECT COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  ) INTO user_display_name;

  -- 1. Create profile record
  INSERT INTO public.profiles (
    user_id,
    name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_display_name,
    'admin',
    NOW(),
    NOW()
  );

  -- 2. Create hotel_admins record
  INSERT INTO public.hotel_admins (
    user_id,
    hotel_id,
    role,
    fullname,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    default_hotel_id,
    'admin',
    user_display_name,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for automatic user assignment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_signup();

-- 5. Handle existing users without profiles or hotel_admins
-- Create profiles for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
  default_hotel_id UUID;
  user_display_name TEXT;
BEGIN
  -- Get default hotel ID
  SELECT id INTO default_hotel_id 
  FROM public.hotels 
  WHERE slug = 'initi-ai-default' 
  LIMIT 1;

  -- Process users without profiles
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Determine display name
    SELECT COALESCE(
      user_record.raw_user_meta_data->>'full_name',
      user_record.raw_user_meta_data->>'name',
      SPLIT_PART(user_record.email, '@', 1),
      'User'
    ) INTO user_display_name;

    -- Create profile
    INSERT INTO public.profiles (
      user_id, name, role, created_at, updated_at
    ) VALUES (
      user_record.id, user_display_name, 'admin', user_record.created_at, NOW()
    );

    RAISE NOTICE 'Created profile for existing user: % (ID: %)', user_display_name, user_record.id;
  END LOOP;

  -- Process users without hotel_admins
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at,
           p.name as profile_name
    FROM auth.users u
    JOIN public.profiles p ON u.id = p.user_id
    LEFT JOIN public.hotel_admins ha ON u.id = ha.user_id
    WHERE ha.user_id IS NULL
  LOOP
    -- Use profile name or determine from user data
    SELECT COALESCE(
      user_record.profile_name,
      user_record.raw_user_meta_data->>'full_name',
      user_record.raw_user_meta_data->>'name',
      SPLIT_PART(user_record.email, '@', 1),
      'User'
    ) INTO user_display_name;

    -- Create hotel admin
    INSERT INTO public.hotel_admins (
      user_id, hotel_id, role, fullname, created_at, updated_at
    ) VALUES (
      user_record.id, default_hotel_id, 'admin', user_display_name, user_record.created_at, NOW()
    );

    RAISE NOTICE 'Created hotel admin for existing user: % (ID: %)', user_display_name, user_record.id;
  END LOOP;
END $$;

-- 6. Enable Row Level Security and create policies
-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on hotel_admins if not already enabled
ALTER TABLE public.hotel_admins ENABLE ROW LEVEL SECURITY;

-- Hotel admins policies
DROP POLICY IF EXISTS "Hotel admins can view their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can view their own record" ON public.hotel_admins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hotel admins can update their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can update their own record" ON public.hotel_admins
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hotel admins can insert their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can insert their own record" ON public.hotel_admins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Create a function to manually assign user to hotel (for admin use)
CREATE OR REPLACE FUNCTION public.assign_user_to_hotel(
  target_user_id UUID,
  target_hotel_id UUID,
  admin_role TEXT DEFAULT 'admin'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Get user's name from profile or auth.users
  SELECT COALESCE(
    p.name,
    au.raw_user_meta_data->>'full_name',
    au.email,
    'User'
  ) INTO user_name
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  WHERE au.id = target_user_id;

  -- Update or insert hotel_admins record
  INSERT INTO public.hotel_admins (
    user_id, hotel_id, role, fullname, created_at, updated_at
  ) VALUES (
    target_user_id, target_hotel_id, admin_role, user_name, NOW(), NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    hotel_id = EXCLUDED.hotel_id,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in assign_user_to_hotel: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_admins_user_id ON public.hotel_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_admins_hotel_id ON public.hotel_admins(hotel_id);

-- 9. Final verification
SELECT 'Setup complete! Verification results:' as status;

SELECT 'User counts:' as check_type;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.hotel_admins) as total_hotel_admins;

SELECT 'Missing assignments:' as check_type;
SELECT 
  (SELECT COUNT(*) FROM auth.users u 
   LEFT JOIN public.profiles p ON u.id = p.user_id 
   WHERE p.user_id IS NULL) as users_without_profile,
  (SELECT COUNT(*) FROM auth.users u 
   LEFT JOIN public.hotel_admins ha ON u.id = ha.user_id 
   WHERE ha.user_id IS NULL) as users_without_hotel_admin;

SELECT 'Sample user assignments:' as check_type;
SELECT 
  u.email,
  p.name as profile_name,
  ha.role as admin_role,
  h.name as hotel_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.hotel_admins ha ON u.id = ha.user_id
LEFT JOIN public.hotels h ON ha.hotel_id = h.id
ORDER BY u.created_at DESC
LIMIT 5;
