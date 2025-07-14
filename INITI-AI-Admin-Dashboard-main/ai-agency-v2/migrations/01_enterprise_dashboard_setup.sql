-- =====================================================
-- ENTERPRISE DASHBOARD DATABASE SETUP
-- Run these scripts in your Supabase SQL Editor
-- =====================================================

-- 1. Enable RLS (Row Level Security) on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table when a new user is created
  INSERT INTO public.profiles (user_id, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create function to handle hotel admin creation
CREATE OR REPLACE FUNCTION public.create_default_hotel_admin(user_id UUID)
RETURNS UUID AS $$
DECLARE
  default_hotel_id UUID;
  admin_id UUID;
BEGIN
  -- Get or create a default hotel
  SELECT id INTO default_hotel_id FROM public.hotels WHERE slug = 'default-hotel' LIMIT 1;
  
  IF default_hotel_id IS NULL THEN
    INSERT INTO public.hotels (
      name, 
      slug, 
      address, 
      city, 
      country, 
      description, 
      email,
      timezone,
      is_active
    ) VALUES (
      'Default Hotel',
      'default-hotel',
      '123 Main Street',
      'Default City',
      'United States',
      'Default hotel for new administrators',
      'admin@defaulthotel.com',
      'UTC',
      true
    ) RETURNING id INTO default_hotel_id;
  END IF;
  
  -- Create hotel admin record
  INSERT INTO public.hotel_admins (
    user_id,
    hotel_id,
    role,
    fullname,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    default_hotel_id,
    'admin',
    COALESCE(
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_id),
      (SELECT email FROM auth.users WHERE id = user_id)
    ),
    NOW(),
    NOW()
  ) RETURNING id INTO admin_id;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update the user registration handler to create hotel admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin',
    NOW(),
    NOW()
  );
  
  -- Create hotel admin record
  SELECT public.create_default_hotel_admin(NEW.id) INTO admin_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. RLS Policies for hotel_admins table
DROP POLICY IF EXISTS "Hotel admins can view their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can view their own record" ON public.hotel_admins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hotel admins can update their own record" ON public.hotel_admins;
CREATE POLICY "Hotel admins can update their own record" ON public.hotel_admins
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create view for complete user profile with hotel info
CREATE OR REPLACE VIEW public.user_profile_view AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.name,
  p.phone,
  p.location,
  p.department,
  p.timezone,
  p.role as profile_role,
  p.skills,
  p.avatar_url,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at,
  ha.id as admin_id,
  ha.hotel_id,
  ha.role as admin_role,
  ha.fullname as admin_fullname,
  ha.created_at as admin_created_at,
  h.name as hotel_name,
  h.slug as hotel_slug,
  h.address as hotel_address,
  h.city as hotel_city,
  h.region as hotel_region,
  h.country as hotel_country,
  h.phone as hotel_phone,
  h.email as hotel_email,
  h.website as hotel_website,
  h.timezone as hotel_timezone,
  h.is_active as hotel_active,
  au.email as user_email,
  au.created_at as user_created_at,
  au.last_sign_in_at as last_login
FROM public.profiles p
LEFT JOIN public.hotel_admins ha ON p.user_id = ha.user_id
LEFT JOIN public.hotels h ON ha.hotel_id = h.id
LEFT JOIN auth.users au ON p.user_id = au.id;

-- 9. Grant necessary permissions
GRANT SELECT ON public.user_profile_view TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.hotel_admins TO authenticated;
GRANT SELECT ON public.hotels TO authenticated;

-- 10. Create function to get complete user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  name TEXT,
  phone TEXT,
  location TEXT,
  department TEXT,
  timezone TEXT,
  profile_role TEXT,
  skills TEXT[],
  avatar_url TEXT,
  profile_created_at TIMESTAMPTZ,
  profile_updated_at TIMESTAMPTZ,
  admin_id UUID,
  hotel_id UUID,
  admin_role TEXT,
  admin_fullname TEXT,
  admin_created_at TIMESTAMPTZ,
  hotel_name TEXT,
  hotel_slug TEXT,
  hotel_address TEXT,
  hotel_city TEXT,
  hotel_region TEXT,
  hotel_country TEXT,
  hotel_phone TEXT,
  hotel_email TEXT,
  hotel_website TEXT,
  hotel_timezone TEXT,
  hotel_active BOOLEAN,
  user_email TEXT,
  user_created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ
) AS $$
BEGIN
  -- Security check
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT * FROM public.user_profile_view 
  WHERE user_profile_view.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
