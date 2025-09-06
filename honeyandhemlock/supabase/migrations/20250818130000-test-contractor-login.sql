-- Simple test to verify contractor login
-- This will help debug the login issue

-- First, let's see what's in the judges table
SELECT 
  id,
  name, 
  email, 
  status,
  is_admin,
  substring(password_hash, 1, 20) as password_hash_start
FROM public.judges 
WHERE email IN ('test', 'test@judge.com');

-- Test the authenticate_judge function directly
SELECT * FROM public.authenticate_judge('test', 'test');

-- Let's also check if the password verification works
DO $$
DECLARE
  stored_hash TEXT;
  test_result BOOLEAN;
BEGIN
  -- Get the stored hash for test user
  SELECT password_hash INTO stored_hash 
  FROM public.judges 
  WHERE email = 'test';
  
  IF stored_hash IS NOT NULL THEN
    -- Test if the password 'test' matches the stored hash
    test_result := (stored_hash = crypt('test', stored_hash));
    RAISE NOTICE 'Password verification for test user: %', test_result;
    RAISE NOTICE 'Stored hash starts with: %', substring(stored_hash, 1, 20);
  ELSE
    RAISE NOTICE 'No test user found!';
  END IF;
END $$;

-- Let's also create a simpler version without function complexity
-- This creates a test user with a known working hash
UPDATE public.judges 
SET password_hash = '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l/.SnpeV8lWs7UaUJXPNn.RMqk2' -- This is 'test' hashed
WHERE email = 'test';

-- Now test again
SELECT * FROM public.authenticate_judge('test', 'test');

-- Show the final state
SELECT 
  'Test user ready' as status,
  email,
  'Password: test' as password_info
FROM public.judges 
WHERE email = 'test';