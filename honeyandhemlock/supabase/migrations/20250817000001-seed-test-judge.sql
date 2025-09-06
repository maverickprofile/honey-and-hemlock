-- Create Test Judge account
-- Note: Password 'test' hashed with bcrypt (10 rounds)
INSERT INTO public.contractors (
  id,
  name,
  email,
  password_hash,
  status,
  is_admin,
  current_workload,
  max_workload,
  scripts_reviewed,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Judge',
  'test',
  '$2b$10$S0tSdn0cq3lfGaVnwNeswuFgNV3k61uLTh4DtH72isIYOt9R6SBiK', -- bcrypt hash of 'test'
  'approved',
  false,
  0,
  10,
  0,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  password_hash = EXCLUDED.password_hash;