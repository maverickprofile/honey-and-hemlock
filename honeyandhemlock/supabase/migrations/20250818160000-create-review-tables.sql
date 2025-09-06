-- Create the review system tables

-- 1. Create script_reviews table
CREATE TABLE IF NOT EXISTS public.script_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES public.judges(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'draft')),
  overall_notes TEXT,
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('approved', 'declined', NULL)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(script_id, judge_id)
);

-- 2. Create script_page_notes table for page-by-page notes
CREATE TABLE IF NOT EXISTS public.script_page_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_review_id UUID REFERENCES public.script_reviews(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_script_reviews_script_id ON public.script_reviews(script_id);
CREATE INDEX IF NOT EXISTS idx_script_reviews_judge_id ON public.script_reviews(judge_id);
CREATE INDEX IF NOT EXISTS idx_script_page_notes_review_id ON public.script_page_notes(script_review_id);
CREATE INDEX IF NOT EXISTS idx_script_page_notes_page_number ON public.script_page_notes(page_number);

-- 4. Enable RLS
ALTER TABLE public.script_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_page_notes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Script Reviews policies
CREATE POLICY "Public can view script reviews" ON public.script_reviews
  FOR SELECT USING (true);

CREATE POLICY "Public can create script reviews" ON public.script_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update script reviews" ON public.script_reviews
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete script reviews" ON public.script_reviews
  FOR DELETE USING (true);

-- Script Page Notes policies
CREATE POLICY "Public can view page notes" ON public.script_page_notes
  FOR SELECT USING (true);

CREATE POLICY "Public can create page notes" ON public.script_page_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update page notes" ON public.script_page_notes
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete page notes" ON public.script_page_notes
  FOR DELETE USING (true);

-- 6. Grant permissions
GRANT ALL ON public.script_reviews TO anon, authenticated;
GRANT ALL ON public.script_page_notes TO anon, authenticated;

-- 7. Add file_url column to scripts table if it doesn't exist
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'pdf',
ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- 8. Update existing scripts to have a dummy file_url for testing
UPDATE public.scripts
SET file_url = 'test-script.pdf'
WHERE file_url IS NULL
  AND assigned_judge_id IS NOT NULL;

-- 9. Create a function to update the updated_at timestamp
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

-- 11. Verify the tables were created
SELECT 
  'Review system ready' as status,
  COUNT(*) as review_tables_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('script_reviews', 'script_page_notes');