-- ============================================
-- FIX SCRIPT UPLOAD PERMISSIONS
-- This allows anonymous users to upload scripts
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable Row Level Security on scripts table if not already enabled
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable update for admins" ON public.scripts;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.scripts;

-- 3. Create policy to allow anyone (including anonymous users) to insert scripts
CREATE POLICY "Enable insert for everyone" ON public.scripts
  FOR INSERT WITH CHECK (true);

-- 4. Create policy to allow anyone to read scripts (optional, for status checking)
CREATE POLICY "Enable select for everyone" ON public.scripts
  FOR SELECT USING (true);

-- 5. Create policy to allow admins and contractors to update scripts
CREATE POLICY "Enable update for admins" ON public.scripts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' IN ('admin', 'contractor')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.contractors
      WHERE contractors.email = current_user
      AND contractors.status = 'approved'
    )
  );

-- 6. Create policy to allow admins to delete scripts
CREATE POLICY "Enable delete for admins" ON public.scripts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 7. Grant necessary permissions to anon role
GRANT INSERT, SELECT ON public.scripts TO anon;
GRANT UPDATE ON public.scripts_id_seq TO anon; -- Allow sequence usage for auto-incrementing ID

-- 8. Verify the setup
SELECT 'RLS policies created successfully!' as status;

-- Check if policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'scripts';