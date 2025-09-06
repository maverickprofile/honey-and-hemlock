-- Create Test Judge account in the judges table
-- Note: Password 'test' hashed with bcrypt (10 rounds)

-- First ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Test Judge into judges table (which is what the app is actually using)
INSERT INTO public.judges (
  id,
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
  gen_random_uuid(),
  'Test Judge',
  'test@judge.com',
  crypt('test123', gen_salt('bf')), -- Creates bcrypt hash of 'test123'
  'approved',
  false,
  0,
  0,
  'General',
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  password_hash = EXCLUDED.password_hash;

-- Also create a simpler test contractor
INSERT INTO public.judges (
  id,
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
  gen_random_uuid(),
  'Test Contractor',
  'test',
  crypt('test', gen_salt('bf')), -- Creates bcrypt hash of 'test'
  'approved',
  false,
  0,
  0,
  'General',
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  password_hash = EXCLUDED.password_hash;

-- Verify the Test Judge was created
SELECT name, email, status FROM public.judges WHERE email IN ('test@judge.com', 'test');