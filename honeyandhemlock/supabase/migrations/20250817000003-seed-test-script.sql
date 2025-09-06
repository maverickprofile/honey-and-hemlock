-- Upload a test thriller script using the free tier
INSERT INTO public.scripts (
  title,
  author_name,
  author_email,
  author_phone,
  file_url,
  file_name,
  status,
  payment_status,
  amount,
  tier_id,
  tier_name,
  submitted_at,
  created_at,
  updated_at
) VALUES (
  'The Last Signal',
  'Test Author',
  'testauthor@example.com',
  '+1234567890',
  '/test-thriller-script.txt',
  'test-thriller-script.txt',
  'pending',
  'paid', -- Marked as paid since it's free tier
  0, -- Free tier amount
  'free',
  'Free Upload',
  now(),
  now(),
  now()
);