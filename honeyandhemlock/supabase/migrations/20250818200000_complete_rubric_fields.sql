-- Add all missing rubric fields to script_reviews table
ALTER TABLE public.script_reviews 
-- Concept/Originality
ADD COLUMN IF NOT EXISTS concept_originality_rating INTEGER CHECK (concept_originality_rating >= 1 AND concept_originality_rating <= 5),
ADD COLUMN IF NOT EXISTS concept_originality_notes TEXT,

-- Structure
ADD COLUMN IF NOT EXISTS structure_rating INTEGER CHECK (structure_rating >= 1 AND structure_rating <= 5),
ADD COLUMN IF NOT EXISTS structure_notes TEXT,

-- Dialogue
ADD COLUMN IF NOT EXISTS dialogue_rating INTEGER CHECK (dialogue_rating >= 1 AND dialogue_rating <= 5),
ADD COLUMN IF NOT EXISTS dialogue_notes TEXT,

-- Format/Pacing
ADD COLUMN IF NOT EXISTS format_pacing_rating INTEGER CHECK (format_pacing_rating >= 1 AND format_pacing_rating <= 5),
ADD COLUMN IF NOT EXISTS format_pacing_notes TEXT,

-- Theme
ADD COLUMN IF NOT EXISTS theme_rating INTEGER CHECK (theme_rating >= 1 AND theme_rating <= 5),
ADD COLUMN IF NOT EXISTS theme_tone_notes TEXT,

-- Catharsis
ADD COLUMN IF NOT EXISTS catharsis_rating INTEGER CHECK (catharsis_rating >= 1 AND catharsis_rating <= 5),
ADD COLUMN IF NOT EXISTS catharsis_notes TEXT,

-- Production Budget (1-6 scale)
ADD COLUMN IF NOT EXISTS production_budget_rating INTEGER CHECK (production_budget_rating >= 1 AND production_budget_rating <= 6),
ADD COLUMN IF NOT EXISTS production_budget_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_script_reviews_all_ratings 
ON public.script_reviews(
  plot_rating, 
  characters_rating, 
  concept_originality_rating,
  structure_rating,
  dialogue_rating,
  format_pacing_rating,
  theme_rating,
  catharsis_rating,
  production_budget_rating
);