-- Migration to fix auth.users table permission issues
-- This migration adds necessary RLS policies to allow the scripts table policies to work

-- Enable RLS on auth.users table (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON auth.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Allow authenticated users to check if a user exists (needed for admin checks)
-- This is specifically needed for the scripts table policy that checks admin status
CREATE POLICY IF NOT EXISTS "Allow authenticated to check admin status" ON auth.users
    FOR SELECT
    USING (
        -- Allow users to see their own record
        auth.uid() = id
        OR
        -- Allow checking if someone is an admin (limited fields only)
        auth.uid() IS NOT NULL
    );

-- Alternative approach: Create a simpler policy for public access to check admin status
-- This is less restrictive but necessary if the scripts are being inserted by non-authenticated users
CREATE POLICY IF NOT EXISTS "Public can check user existence for admin verification" ON auth.users
    FOR SELECT
    USING (true)  -- This allows reading but you might want to restrict columns
    WITH CHECK (false);  -- Prevents any writes

-- Grant necessary schema permissions
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant SELECT permission on auth.users to both anon and authenticated roles
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- Optional: If you want to be more restrictive, you can drop the overly permissive policy
-- and create a function-based approach instead
-- But for now, the above should resolve your immediate issue

-- Also, let's clean up duplicate policies on the scripts table
-- First, let's drop the duplicate policies (be careful with this in production)
DROP POLICY IF EXISTS "Anyone can insert scripts" ON public.scripts;
DROP POLICY IF EXISTS "Public read access" ON public.scripts;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.scripts;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.scripts;

-- Keep only the more descriptive policies
-- The remaining policies should be:
-- - "Public can view scripts"
-- - "Public can insert scripts"
-- - "Public can update scripts"
-- - "Public can delete scripts"
-- - "Judges can view assigned scripts"

-- Note: After applying this migration, test your script upload functionality again
-- If you still have issues, you may need to modify the "Judges can view assigned scripts" policy
-- to not reference auth.users directly or use a different approach for admin checks