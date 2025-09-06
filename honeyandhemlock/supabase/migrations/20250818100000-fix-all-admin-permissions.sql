-- Comprehensive fix for admin permissions
-- This migration fixes all RLS policies to work with localStorage-based admin authentication

-- 1. Drop all existing policies that might conflict
DROP POLICY IF EXISTS "Admins can delete scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admins have full access to scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admins can manage all scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admins have full access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all judges" ON public.judges;
DROP POLICY IF EXISTS "Admins can manage all judges" ON public.judges;
DROP POLICY IF EXISTS "Admins can manage judges" ON public.judges;
DROP POLICY IF EXISTS "Users can view their own judge data" ON public.judges;
DROP POLICY IF EXISTS "Judges can view their own data" ON public.judges;

-- 2. Temporarily disable RLS to clean up
ALTER TABLE public.scripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for public/anon access for admin operations
-- Since admin uses localStorage auth, we need to allow anon access but validate in the app

-- Scripts policies
CREATE POLICY "Public can view scripts" ON public.scripts
  FOR SELECT USING (true);

CREATE POLICY "Public can insert scripts" ON public.scripts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update scripts" ON public.scripts
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete scripts" ON public.scripts
  FOR DELETE USING (true);

-- Judges/Contractors policies
CREATE POLICY "Public can view judges" ON public.judges
  FOR SELECT USING (true);

CREATE POLICY "Public can insert judges" ON public.judges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update judges" ON public.judges
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete judges" ON public.judges
  FOR DELETE USING (true);

-- Contacts policies
CREATE POLICY "Public can view contacts" ON public.contacts
  FOR SELECT USING (true);

CREATE POLICY "Public can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update contacts" ON public.contacts
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete contacts" ON public.contacts
  FOR DELETE USING (true);

-- Script reviews policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'script_reviews') THEN
    ALTER TABLE public.script_reviews DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.script_reviews ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public can view reviews" ON public.script_reviews;
    DROP POLICY IF EXISTS "Public can manage reviews" ON public.script_reviews;
    
    CREATE POLICY "Public can view reviews" ON public.script_reviews
      FOR SELECT USING (true);
    
    CREATE POLICY "Public can manage reviews" ON public.script_reviews
      FOR ALL USING (true);
  END IF;
END $$;

-- Script page notes policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'script_page_notes') THEN
    ALTER TABLE public.script_page_notes DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.script_page_notes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public can view page notes" ON public.script_page_notes;
    DROP POLICY IF EXISTS "Public can manage page notes" ON public.script_page_notes;
    
    CREATE POLICY "Public can view page notes" ON public.script_page_notes
      FOR SELECT USING (true);
    
    CREATE POLICY "Public can manage page notes" ON public.script_page_notes
      FOR ALL USING (true);
      
    GRANT ALL ON public.script_page_notes TO anon, authenticated;
  END IF;
END $$;

-- Notifications policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public can view notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Public can manage notifications" ON public.notifications;
    
    CREATE POLICY "Public can view notifications" ON public.notifications
      FOR SELECT USING (true);
    
    CREATE POLICY "Public can manage notifications" ON public.notifications
      FOR ALL USING (true);
      
    GRANT ALL ON public.notifications TO anon, authenticated;
  END IF;
END $$;

-- 5. Grant necessary permissions to anon and authenticated roles
GRANT ALL ON public.scripts TO anon, authenticated;
GRANT ALL ON public.judges TO anon, authenticated;
GRANT ALL ON public.contacts TO anon, authenticated;

-- Grant permissions on script_reviews if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'script_reviews') THEN
    GRANT ALL ON public.script_reviews TO anon, authenticated;
  END IF;
END $$;

-- 6. Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Note: This makes the tables publicly accessible. 
-- Security should be handled at the application level for admin operations
-- since the admin uses localStorage authentication instead of Supabase Auth.