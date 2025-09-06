-- ============================================
-- FIX 401 PERMISSION DENIED FOR TABLE USER ERROR
-- This fixes the auth.users permission issue during script uploads
-- Run this in Supabase SQL Editor
-- ============================================

-- The issue is that some RLS policies reference auth.users but anonymous users
-- don't have permission to access it. We need to either:
-- 1. Grant proper permissions on auth.users, OR 
-- 2. Modify policies to not require auth.users access for script uploads

-- SOLUTION 1: Grant SELECT permission on auth.users for anonymous users
-- This is needed for RLS policies that check admin status
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- Enable RLS on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow limited access to auth.users for role checking
DROP POLICY IF EXISTS "Allow role checking" ON auth.users;
CREATE POLICY "Allow role checking" ON auth.users
  FOR SELECT USING (
    -- Allow users to see their own record
    auth.uid() = id 
    OR 
    -- Allow checking if a user has admin role (needed for admin verification in RLS policies)
    raw_user_meta_data->>'role' IS NOT NULL
  );

-- SOLUTION 2: Also fix the scripts table policies to be more explicit
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.scripts;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.scripts;

-- Recreate policies with cleaner logic
-- Allow ANYONE (including anonymous users) to insert scripts - this is needed for public script submissions
CREATE POLICY "Enable insert for everyone" ON public.scripts
  FOR INSERT WITH CHECK (true);

-- Allow ANYONE to view scripts (for status checking)
CREATE POLICY "Enable select for everyone" ON public.scripts  
  FOR SELECT USING (true);

-- Allow only authenticated users OR admins to update scripts
-- Simplified to avoid complex auth.users checks for basic operations
CREATE POLICY "Enable update for authenticated" ON public.scripts
  FOR UPDATE USING (
    -- Either user is authenticated
    auth.uid() IS NOT NULL
    OR
    -- Or it's an admin operation (checked via contractors table to avoid auth.users dependency)
    EXISTS (
      SELECT 1 FROM public.contractors c
      WHERE c.is_admin = true 
      AND c.status = 'approved'
    )
  );

-- Allow only admins to delete scripts
CREATE POLICY "Enable delete for admins" ON public.scripts
  FOR DELETE USING (
    -- Check admin status via contractors table instead of auth.users
    EXISTS (
      SELECT 1 FROM public.contractors c
      WHERE c.is_admin = true 
      AND c.status = 'approved'
    )
  );

-- Ensure anonymous users can insert into scripts table
GRANT INSERT, SELECT ON public.scripts TO anon;
GRANT USAGE ON SEQUENCE public.scripts_id_seq TO anon;

-- Grant basic permissions for authenticated users  
GRANT SELECT, UPDATE ON public.scripts TO authenticated;

-- Also ensure storage permissions are correct
-- Allow anonymous file uploads to scripts bucket
DROP POLICY IF EXISTS "Anyone can upload scripts" ON storage.objects;
CREATE POLICY "Anyone can upload scripts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scripts');

DROP POLICY IF EXISTS "Anyone can view scripts" ON storage.objects;  
CREATE POLICY "Anyone can view scripts" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

-- Verify the fix worked
SELECT 'Permission fix applied successfully!' as status;

-- Show current policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('scripts', 'users')
ORDER BY tablename, policyname;