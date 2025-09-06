-- Enhanced Script Review System

-- 1. Create script_page_notes table for page-by-page notes
CREATE TABLE IF NOT EXISTS public.script_page_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_review_id UUID REFERENCES public.script_reviews(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note_content TEXT, -- No character limit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_script_page_notes_review_id ON public.script_page_notes(script_review_id);
CREATE INDEX idx_script_page_notes_page_number ON public.script_page_notes(page_number);

-- 2. Add status column to script_reviews if not exists
ALTER TABLE public.script_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' 
CHECK (status IN ('in_progress', 'completed', 'draft'));

-- 3. Add additional columns to script_reviews
ALTER TABLE public.script_reviews
ADD COLUMN IF NOT EXISTS overall_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_pages_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pages INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Enable RLS for script_page_notes
ALTER TABLE public.script_page_notes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for script_page_notes
-- Contractors can manage their own page notes
CREATE POLICY "Contractors can manage their page notes" ON public.script_page_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.script_reviews sr
      WHERE sr.id = script_page_notes.script_review_id
      AND sr.judge_id = auth.uid()
    )
  );

-- Admins can view all page notes
CREATE POLICY "Admins can view all page notes" ON public.script_page_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email IN ('admin', 'admin@honeyandhemlock.productions'))
    )
  );

-- 6. Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for updated_at
CREATE TRIGGER update_script_page_notes_updated_at
  BEFORE UPDATE ON public.script_page_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_script_reviews_updated_at
  BEFORE UPDATE ON public.script_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Function to compile all page notes for a review
CREATE OR REPLACE FUNCTION compile_review_notes(review_id UUID)
RETURNS TABLE(
  page_number INTEGER,
  note_content TEXT,
  overall_notes TEXT,
  feedback TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spn.page_number,
    spn.note_content,
    sr.overall_notes,
    sr.feedback,
    sr.recommendation::TEXT
  FROM public.script_reviews sr
  LEFT JOIN public.script_page_notes spn ON spn.script_review_id = sr.id
  WHERE sr.id = review_id
  ORDER BY spn.page_number;
END;
$$;

-- 9. Grant permissions
GRANT ALL ON public.script_page_notes TO authenticated;
GRANT SELECT ON public.script_page_notes TO anon;
GRANT EXECUTE ON FUNCTION compile_review_notes(UUID) TO authenticated;

-- 10. Add file_url column to scripts table if not exists
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'pdf',
ADD COLUMN IF NOT EXISTS page_count INTEGER;