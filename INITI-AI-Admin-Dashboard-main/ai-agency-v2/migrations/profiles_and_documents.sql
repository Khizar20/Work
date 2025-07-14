-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  location TEXT,
  department TEXT,
  timezone TEXT,
  role TEXT,
  skills TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY read_own_profile ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own profile
CREATE POLICY update_own_profile ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own profile
CREATE POLICY insert_own_profile ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add missing columns to documents table if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'documents'::regclass AND attname = 'metadata') THEN
    ALTER TABLE documents ADD COLUMN metadata JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'documents'::regclass AND attname = 'vector_id') THEN
    ALTER TABLE documents ADD COLUMN vector_id TEXT;
  END IF;
END $$;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel_documents', 'hotel_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Avatars are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create RLS policies for hotel_documents bucket
CREATE POLICY "Hotel admins can upload documents."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hotel_documents' AND 
    EXISTS (
      SELECT 1 FROM hotel_admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hotel admins can update their hotel's documents."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hotel_documents' AND
    EXISTS (
      SELECT 1 FROM hotel_admins ha
      JOIN hotels h ON ha.hotel_id = h.id
      WHERE ha.user_id = auth.uid() AND (storage.foldername(name))[1] = h.id::text
    )
  );

CREATE POLICY "Hotel admins can read their hotel's documents."
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'hotel_documents' AND
    EXISTS (
      SELECT 1 FROM hotel_admins ha
      JOIN hotels h ON ha.hotel_id = h.id
      WHERE ha.user_id = auth.uid() AND (storage.foldername(name))[1] = h.id::text
    )
  );

-- Create a function to update updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create a trigger for documents
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
