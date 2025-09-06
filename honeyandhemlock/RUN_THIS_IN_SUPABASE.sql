-- ============================================
-- COMPLETE MIGRATION FOR FREE TIER & TEST JUDGE
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Add tier columns to scripts table
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS tier_id text,
ADD COLUMN IF NOT EXISTS tier_name text;

-- Allow free scripts (amount = 0)
ALTER TABLE public.scripts ALTER COLUMN amount DROP NOT NULL;

-- 2. Create authentication function for contractors
CREATE OR REPLACE FUNCTION public.authenticate_contractor(contractor_email TEXT, contractor_password TEXT)
RETURNS TABLE(id UUID, email TEXT, name TEXT, status contractor_status) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.email, c.name, c.status
  FROM public.contractors c
  WHERE c.email = contractor_email
  AND c.password_hash = crypt(contractor_password, c.password_hash)
  AND c.status = 'approved';
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.authenticate_contractor(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_contractor(TEXT, TEXT) TO authenticated;

-- 3. Create storage bucket for scripts if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'scripts',
  'scripts',
  true, -- Make it public so we can generate public URLs
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Create RLS policies for scripts bucket
DROP POLICY IF EXISTS "Anyone can upload scripts" ON storage.objects;
CREATE POLICY "Anyone can upload scripts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scripts');

DROP POLICY IF EXISTS "Anyone can view scripts" ON storage.objects;
CREATE POLICY "Anyone can view scripts" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

DROP POLICY IF EXISTS "Admins can delete scripts" ON storage.objects;
CREATE POLICY "Admins can delete scripts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'scripts' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update scripts" ON storage.objects;
CREATE POLICY "Admins can update scripts" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'scripts' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 5. Install pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 6. Create Test Judge account
-- Password 'test' hashed with bcrypt
INSERT INTO public.contractors (
  id,
  name,
  email,
  password_hash,
  status,
  is_admin,
  current_workload,
  max_workload,
  scripts_reviewed,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Judge',
  'test',
  crypt('test', gen_salt('bf')), -- This creates a bcrypt hash
  'approved',
  false,
  0,
  10,
  0,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  password_hash = EXCLUDED.password_hash;

-- 7. Create a test script entry (optional - for testing)
INSERT INTO public.scripts (
  title,
  author_name,
  author_email,
  author_phone,
  file_url,
  file_name,
  status,
  payment_status,
  amount,
  tier_id,
  tier_name,
  submitted_at,
  created_at,
  updated_at
) VALUES (
  'The Last Signal - Test Script',
  'Test Author',
  'testauthor@example.com',
  '+1234567890',
  '/test-thriller-script.txt',
  'test-thriller-script.txt',
  'pending',
  'paid',
  0,
  'free',
  'Free Upload',
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- 8. Grant necessary permissions for scripts table
GRANT SELECT ON public.scripts TO anon;
GRANT SELECT ON public.scripts TO authenticated;

-- 9. Grant necessary permissions for contractors table  
GRANT SELECT ON public.contractors TO anon;
GRANT SELECT ON public.contractors TO authenticated;

-- 10. Verify the script by checking the tables
SELECT 'Scripts in database:' as info;
SELECT id, title, author_name, tier_name, amount, status FROM public.scripts ORDER BY created_at DESC LIMIT 5;

SELECT 'Contractors in database:' as info;
SELECT id, name, email, status FROM public.contractors WHERE email = 'test';

-- If everything worked, you should see:
-- 1. At least one script with tier_name = 'Free Upload'
-- 2. A contractor with email = 'test' and status = 'approved'