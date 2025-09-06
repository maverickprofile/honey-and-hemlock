-- Migration to fix auth.users table permission issues
-- Enable RLS on auth.users table (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated to check admin status" ON auth.users;
DROP POLICY IF EXISTS "Public can check user existence for admin verification" ON auth.users;

-- Policy 1: Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON auth.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Allow authenticated users to check if a user exists
CREATE POLICY "Allow authenticated to check admin status" ON auth.users
    FOR SELECT
    USING (
        auth.uid() = id
        OR
        auth.uid() IS NOT NULL
    );

-- Policy 3: Public can check user existence for admin verification
CREATE POLICY "Public can check user existence for admin verification" ON auth.users
    FOR SELECT
    USING (true);

-- Grant necessary schema permissions
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant SELECT permission on auth.users
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- Clean up duplicate policies on the scripts table
DROP POLICY IF EXISTS "Anyone can insert scripts" ON public.scripts;
DROP POLICY IF EXISTS "Public read access" ON public.scripts;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.scripts;
DROP POLICY IF EXISTS "Enable update for authenticated" ON public.scripts;
DROP POLICY IF EXISTS "Enable delete for admins" ON public.scripts;