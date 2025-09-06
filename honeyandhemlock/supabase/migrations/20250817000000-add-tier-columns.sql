-- Add tier columns to scripts table
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS tier_id text,
ADD COLUMN IF NOT EXISTS tier_name text;

-- Allow free scripts (amount = 0)
ALTER TABLE public.scripts ALTER COLUMN amount DROP NOT NULL;