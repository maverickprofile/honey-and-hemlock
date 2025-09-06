-- Create storage bucket for scripts
-- Run this in Supabase SQL editor

-- Note: Supabase doesn't allow creating storage buckets via SQL directly
-- You need to create the bucket manually in the Supabase Dashboard
-- Go to Storage -> New Bucket -> Name: "scripts" -> Public: Yes

-- However, we can update the scripts table with proper test data
-- This assumes you'll create the 'scripts' bucket manually

-- Add some test file URLs to scripts for testing
UPDATE public.scripts
SET 
  file_url = 'sample-script-' || SUBSTRING(id::text, 1, 8) || '.pdf',
  file_type = 'pdf',
  page_count = FLOOR(RANDOM() * 50 + 80) -- Random page count between 80-130
WHERE assigned_judge_id IS NOT NULL
  AND (file_url IS NULL OR file_url = 'test-script.pdf');

-- Show the updated scripts
SELECT 
  id,
  title,
  file_url,
  file_type,
  page_count,
  assigned_judge_id
FROM public.scripts
WHERE assigned_judge_id IS NOT NULL;