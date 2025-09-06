-- Add rubric fields to script_reviews table
ALTER TABLE public.script_reviews 
ADD COLUMN IF NOT EXISTS title_response TEXT,
ADD COLUMN IF NOT EXISTS plot_rating INTEGER CHECK (plot_rating >= 1 AND plot_rating <= 5),
ADD COLUMN IF NOT EXISTS plot_notes TEXT,
ADD COLUMN IF NOT EXISTS characters_rating INTEGER CHECK (characters_rating >= 1 AND characters_rating <= 5),
ADD COLUMN IF NOT EXISTS character_notes TEXT;

-- Create an index for faster queries on ratings
CREATE INDEX IF NOT EXISTS idx_script_reviews_ratings 
ON public.script_reviews(plot_rating, characters_rating);

-- Update any existing reviews with default values (optional)
-- This ensures existing reviews don't break the new UI
UPDATE public.script_reviews 
SET 
  plot_rating = COALESCE(plot_rating, 3),
  characters_rating = COALESCE(characters_rating, 3)
WHERE plot_rating IS NULL OR characters_rating IS NULL;