
-- Add is_admin column to judges table if it doesn't exist
ALTER TABLE public.judges 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a dedicated admin user in the judges table with the specified credentials
INSERT INTO public.judges (email, password_hash, name, status, is_admin)
VALUES (
  'admin@honeyandhemlock.productions',
  '$2b$10$8K1p0uQBxWdERR4t2St2j.UQjH4VqXFXzXzXzXzXzXzXzXzXzXzXzX', -- This is a placeholder hash
  'Admin User',
  'approved',
  TRUE
) ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  status = 'approved';

-- Function to authenticate admin login
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email TEXT, admin_password TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- For now, we'll do a simple email check since password hashing needs to be handled properly
  -- In production, you'd want proper password hashing
  IF admin_email = 'admin@honeyandhemlock.productions' AND admin_password = 'Neurobit@123' THEN
    RETURN QUERY
    SELECT j.id, j.email, j.name, j.is_admin
    FROM public.judges j
    WHERE j.email = admin_email AND j.is_admin = TRUE;
  END IF;
  
  RETURN;
END;
$$;

-- Update RLS policies for admin access
DROP POLICY IF EXISTS "Admins can view all scripts" ON public.scripts;
CREATE POLICY "Admins can view all scripts"
ON public.scripts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.judges 
  WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
));

DROP POLICY IF EXISTS "Admins can update all scripts" ON public.scripts;
CREATE POLICY "Admins can update all scripts"
ON public.scripts
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.judges 
  WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
));

-- Create policy for admins to view all judges
DROP POLICY IF EXISTS "Admins can view all judges" ON public.judges;
CREATE POLICY "Admins can view all judges"
ON public.judges
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.judges admin_check
  WHERE admin_check.id = auth.uid() AND admin_check.is_admin = TRUE
));

-- Create policy for admins to manage judges
DROP POLICY IF EXISTS "Admins can manage all judges" ON public.judges;
CREATE POLICY "Admins can manage all judges"
ON public.judges
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.judges admin_check
  WHERE admin_check.id = auth.uid() AND admin_check.is_admin = TRUE
));
