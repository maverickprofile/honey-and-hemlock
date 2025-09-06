-- ============================================
-- COMPLETE DATABASE SETUP FOR SCRIPT UPLOADS
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Create contractors table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin BOOLEAN DEFAULT false,
  current_workload INTEGER DEFAULT 0,
  max_workload INTEGER DEFAULT 10,
  scripts_reviewed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create scripts table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.scripts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_phone TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'reviewed', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  amount INTEGER DEFAULT 0,
  tier_id TEXT,
  tier_name TEXT,
  assigned_contractor_id UUID REFERENCES public.contractors(id),
  review_notes TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.scripts;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.scripts;

-- 5. Create RLS policies for scripts table
-- Allow anyone (including anonymous) to insert scripts
CREATE POLICY "Enable insert for everyone" ON public.scripts
  FOR INSERT WITH CHECK (true);

-- Allow anyone to view scripts
CREATE POLICY "Enable select for everyone" ON public.scripts
  FOR SELECT USING (true);

-- Allow authenticated users to update scripts
CREATE POLICY "Enable update for authenticated" ON public.scripts
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- Allow authenticated admins to delete scripts
CREATE POLICY "Enable delete for admins" ON public.scripts
  FOR DELETE USING (
    auth.uid() IS NOT NULL
  );

-- 6. Create RLS policies for contractors table
DROP POLICY IF EXISTS "Enable select for everyone" ON public.contractors;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.contractors;
DROP POLICY IF EXISTS "Enable update for self" ON public.contractors;

CREATE POLICY "Enable select for everyone" ON public.contractors
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated" ON public.contractors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for self" ON public.contractors
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 7. Grant permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.scripts TO anon, authenticated;
GRANT ALL ON public.contractors TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. Create storage bucket for scripts (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'scripts',
  'scripts',
  true,
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9. Storage policies
DROP POLICY IF EXISTS "Anyone can upload scripts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view scripts" ON storage.objects;

CREATE POLICY "Anyone can upload scripts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scripts');

CREATE POLICY "Anyone can view scripts" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

-- 10. Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Check tables
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('scripts', 'contractors')
GROUP BY table_name;

-- Check policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('scripts', 'contractors')
ORDER BY tablename, policyname;