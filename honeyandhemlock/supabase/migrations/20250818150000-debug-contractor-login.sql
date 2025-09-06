-- Debug contractor login issue
-- Let's see exactly what's happening

-- 1. First, check what's in the judges table
SELECT 
  id,
  name,
  email,
  status,
  is_admin,
  substring(password_hash, 1, 30) as password_hash_start
FROM public.judges 
WHERE email = 'test';

-- 2. Ensure we have the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create or update test contractor with a simple password
UPDATE public.judges 
SET 
  password_hash = '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l/.SnpeV8lWs7UaUJXPNn.RMqk2', -- 'test' hashed
  status = 'approved',
  name = 'Test Contractor'
WHERE email = 'test';

-- If no rows updated, insert new
INSERT INTO public.judges (
  name,
  email, 
  password_hash,
  status,
  is_admin
)
SELECT 
  'Test Contractor',
  'test',
  '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l/.SnpeV8lWs7UaUJXPNn.RMqk2', -- 'test' hashed
  'approved',
  false
WHERE NOT EXISTS (SELECT 1 FROM public.judges WHERE email = 'test');

-- 4. Test password verification directly
DO $$
DECLARE
  stored_hash TEXT;
  test_pass TEXT := 'test';
  match_result BOOLEAN;
BEGIN
  SELECT password_hash INTO stored_hash FROM public.judges WHERE email = 'test';
  
  IF stored_hash IS NOT NULL THEN
    match_result := (stored_hash = crypt(test_pass, stored_hash));
    RAISE NOTICE 'Password match result: %', match_result;
    RAISE NOTICE 'Stored hash: %', substring(stored_hash, 1, 30);
  ELSE
    RAISE NOTICE 'No test user found';
  END IF;
END $$;

-- 5. Test the authenticate_judge function
SELECT 
  'Function test:' as test_type,
  id,
  email,
  name,
  status
FROM public.authenticate_judge('test', 'test');

-- 6. Create a super simple authentication function for testing
CREATE OR REPLACE FUNCTION public.test_contractor_auth(test_email TEXT, test_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash 
  FROM public.judges 
  WHERE email = test_email;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- For debugging: if password is exactly 'test' and email is 'test', just return true
  IF test_email = 'test' AND test_password = 'test' THEN
    RETURN TRUE;
  END IF;
  
  RETURN (stored_hash = crypt(test_password, stored_hash));
END;
$$;

-- 7. Test the simple function
SELECT 
  'Simple auth test:' as test,
  public.test_contractor_auth('test', 'test') as auth_result;

-- 8. Final status
SELECT 
  'FINAL STATUS' as status,
  id,
  name,
  email,
  'test' as password_to_use,
  status as approval_status
FROM public.judges 
WHERE email = 'test';