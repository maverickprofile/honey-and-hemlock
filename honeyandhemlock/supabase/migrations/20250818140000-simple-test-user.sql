-- Simplest possible test user setup
-- This bypasses all complexity and creates a working test user

-- 1. Create or update the test user with a pre-computed hash
INSERT INTO public.judges (
  name,
  email,
  password_hash,
  status,
  is_admin,
  created_at
) VALUES (
  'Test Contractor',
  'test',
  '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l/.SnpeV8lWs7UaUJXPNn.RMqk2', -- 'test' hashed with bcrypt
  'approved',
  false,
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l/.SnpeV8lWs7UaUJXPNn.RMqk2',
  status = 'approved',
  name = 'Test Contractor';

-- 2. Make sure the authenticate_judge function returns data correctly
CREATE OR REPLACE FUNCTION public.authenticate_judge(judge_email TEXT, judge_password TEXT)
RETURNS SETOF RECORD
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.email,
    j.name,
    j.status::TEXT
  FROM public.judges j
  WHERE j.email = judge_email
    AND j.password_hash = crypt(judge_password, j.password_hash);
END;
$$;

-- 3. Test the login
SELECT * FROM public.authenticate_judge('test', 'test') 
AS (id UUID, email TEXT, name TEXT, status TEXT);

-- 4. Show result
SELECT 
  'READY FOR LOGIN' as status,
  'Email: test' as credentials,
  'Password: test' as password
FROM public.judges 
WHERE email = 'test'
LIMIT 1;