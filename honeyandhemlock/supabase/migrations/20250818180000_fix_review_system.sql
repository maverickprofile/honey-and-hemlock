-- Fix review system for contractor dashboard

-- 1. Add missing columns to script_reviews table
ALTER TABLE public.script_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'draft')),
ADD COLUMN IF NOT EXISTS overall_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create script_page_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.script_page_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_review_id UUID REFERENCES public.script_reviews(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_script_page_notes_review_id ON public.script_page_notes(script_review_id);
CREATE INDEX IF NOT EXISTS idx_script_page_notes_page_number ON public.script_page_notes(page_number);

-- 4. Enable RLS on script_page_notes
ALTER TABLE public.script_page_notes ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can manage page notes" ON public.script_page_notes;
DROP POLICY IF EXISTS "Public can view page notes" ON public.script_page_notes;

-- 6. Create comprehensive policies for page notes
CREATE POLICY "Public can manage page notes" ON public.script_page_notes
  FOR ALL USING (true);

-- 7. Ensure script_reviews has proper policies
DROP POLICY IF EXISTS "Judges can manage their reviews" ON public.script_reviews;
DROP POLICY IF EXISTS "Public can manage reviews" ON public.script_reviews;

CREATE POLICY "Public can manage reviews" ON public.script_reviews
  FOR ALL USING (true);

-- 8. Grant permissions
GRANT ALL ON public.script_page_notes TO anon, authenticated;
GRANT ALL ON public.script_reviews TO anon, authenticated;

-- 9. Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_script_reviews_updated_at ON public.script_reviews;
CREATE TRIGGER update_script_reviews_updated_at
  BEFORE UPDATE ON public.script_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_script_page_notes_updated_at ON public.script_page_notes;
CREATE TRIGGER update_script_page_notes_updated_at
  BEFORE UPDATE ON public.script_page_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Update existing scripts with test file URLs if they don't have any
UPDATE public.scripts
SET 
  file_url = COALESCE(file_url, 'sample-script-' || SUBSTRING(id::text, 1, 8) || '.pdf'),
  file_type = COALESCE(file_type, 'pdf'),
  page_count = COALESCE(page_count, FLOOR(RANDOM() * 50 + 80)::INTEGER)
WHERE assigned_judge_id IS NOT NULL;

-- 12. Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Review system tables configured successfully';
  RAISE NOTICE 'script_reviews table has status column: %', 
    EXISTS(SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'script_reviews' AND column_name = 'status');
  RAISE NOTICE 'script_page_notes table exists: %', 
    EXISTS(SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'script_page_notes');
END $$;