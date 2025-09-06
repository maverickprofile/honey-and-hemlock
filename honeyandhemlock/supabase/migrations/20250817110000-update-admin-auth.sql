-- Update authenticate_admin function to accept both 'admin' and 'admin@honeyandhemlock.productions'
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
  -- Check for both 'admin' username and the full email
  IF (admin_email = 'admin' OR admin_email = 'admin@honeyandhemlock.productions') 
     AND admin_password = 'Neurobit@123' THEN
    RETURN QUERY
    SELECT 
      COALESCE(j.id, gen_random_uuid()) as id,
      COALESCE(j.email, admin_email) as email,
      COALESCE(j.name, 'Administrator') as name,
      TRUE as is_admin
    FROM public.judges j
    WHERE j.email IN ('admin', 'admin@honeyandhemlock.productions') 
      AND j.is_admin = TRUE
    LIMIT 1;
    
    -- If no admin exists in judges table, return a virtual admin
    IF NOT FOUND THEN
      RETURN QUERY
      SELECT 
        gen_random_uuid() as id,
        admin_email as email,
        'Administrator' as name,
        TRUE as is_admin;
    END IF;
  END IF;
  
  RETURN;
END;
$$;

-- Create authenticate_judge function for contractor login
CREATE OR REPLACE FUNCTION public.authenticate_judge(judge_email TEXT, judge_password TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Get the password hash for the judge
  SELECT password_hash INTO v_password_hash
  FROM public.judges
  WHERE email = judge_email;
  
  -- If no judge found, return empty
  IF v_password_hash IS NULL THEN
    RETURN;
  END IF;
  
  -- Check password using bcrypt
  IF v_password_hash = crypt(judge_password, v_password_hash) THEN
    RETURN QUERY
    SELECT j.id, j.email, j.name, j.status::TEXT
    FROM public.judges j
    WHERE j.email = judge_email;
  END IF;
  
  RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.authenticate_admin(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_admin(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_judge(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_judge(TEXT, TEXT) TO authenticated;

-- Ensure pgcrypto extension is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert or update admin record in judges table
INSERT INTO public.judges (id, email, name, password_hash, is_admin, status, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'Administrator',
  crypt('Neurobit@123', gen_salt('bf')),
  TRUE,
  'approved',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = crypt('Neurobit@123', gen_salt('bf')),
  is_admin = TRUE,
  status = 'approved';