-- Fix authenticate_judge function to work with bcrypt passwords
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS public.authenticate_judge(TEXT, TEXT);

-- Create or replace the authenticate_judge function
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
  v_judge_id UUID;
  v_judge_name TEXT;
  v_judge_status TEXT;
BEGIN
  -- Get the judge details
  SELECT j.password_hash, j.id, j.name, j.status::TEXT 
  INTO v_password_hash, v_judge_id, v_judge_name, v_judge_status
  FROM public.judges j
  WHERE j.email = judge_email;
  
  -- If no judge found, return empty
  IF v_password_hash IS NULL THEN
    RETURN;
  END IF;
  
  -- Check password using crypt (bcrypt)
  IF v_password_hash = crypt(judge_password, v_password_hash) THEN
    RETURN QUERY
    SELECT v_judge_id, judge_email, v_judge_name, v_judge_status;
  END IF;
  
  RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.authenticate_judge(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_judge(TEXT, TEXT) TO authenticated;

-- Now insert test contractors with proper bcrypt hashing
-- First ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update existing test contractors or insert new ones
-- First, unassign any scripts from test contractors
UPDATE public.scripts 
SET assigned_judge_id = NULL 
WHERE assigned_judge_id IN (
  SELECT id FROM public.judges WHERE email IN ('test', 'test@judge.com')
);

-- Insert or update test contractor with simple credentials
INSERT INTO public.judges (
  name,
  email,
  password_hash,
  status,
  is_admin,
  current_workload,
  total_scripts_reviewed,
  specialization,
  created_at
) VALUES (
  'Test Contractor',
  'test',
  crypt('test', gen_salt('bf', 10)), -- Creates proper bcrypt hash of 'test'
  'approved',
  false,
  0,
  0,
  'General',
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('test', gen_salt('bf', 10)),
  status = 'approved',
  name = 'Test Contractor';

-- Also insert or update another test contractor
INSERT INTO public.judges (
  name,
  email,
  password_hash,
  status,
  is_admin,
  current_workload,
  total_scripts_reviewed,
  specialization,
  created_at
) VALUES (
  'Test Judge',
  'test@judge.com',
  crypt('test123', gen_salt('bf', 10)), -- Creates proper bcrypt hash of 'test123'
  'approved',
  false,
  0,
  0,
  'General',
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('test123', gen_salt('bf', 10)),
  status = 'approved',
  name = 'Test Judge';

-- Verify the contractors were created and test authentication
DO $$
DECLARE
  result RECORD;
BEGIN
  -- Test authentication for test contractor
  SELECT * INTO result FROM public.authenticate_judge('test', 'test');
  IF result.id IS NOT NULL THEN
    RAISE NOTICE 'Test contractor authentication works! ID: %', result.id;
  ELSE
    RAISE WARNING 'Test contractor authentication failed!';
  END IF;
  
  -- Display the created contractors
  FOR result IN SELECT name, email, status FROM public.judges WHERE email IN ('test', 'test@judge.com')
  LOOP
    RAISE NOTICE 'Created contractor: % (%) - Status: %', result.name, result.email, result.status;
  END LOOP;
END $$;