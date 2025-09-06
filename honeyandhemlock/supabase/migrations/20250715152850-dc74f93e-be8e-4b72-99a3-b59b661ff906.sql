
-- Add tier information to scripts table
ALTER TABLE public.scripts 
ADD COLUMN tier_id TEXT,
ADD COLUMN tier_name TEXT,
ADD COLUMN tier_description TEXT;

-- Create judges signup table for public judge registrations
CREATE TABLE IF NOT EXISTS public.judge_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  availability TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for judge applications
ALTER TABLE public.judge_applications ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to apply as a judge
CREATE POLICY "Anyone can apply as judge" ON public.judge_applications
  FOR INSERT WITH CHECK (true);

-- Policy for admins to view all applications
CREATE POLICY "Admins can view judge applications" ON public.judge_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.judges 
      WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
    )
  );

-- Policy for admins to update applications
CREATE POLICY "Admins can update judge applications" ON public.judge_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.judges 
      WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
    )
  );

-- Add workload tracking to judges table
ALTER TABLE public.judges 
ADD COLUMN IF NOT EXISTS current_workload INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_scripts_reviewed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_turnaround_days DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available';

-- Create settings table for site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage settings
CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.judges 
      WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
    )
  );

-- Insert default tier pricing settings
INSERT INTO public.site_settings (setting_key, setting_value, category) VALUES
('tier_1_price', '500', 'pricing'),
('tier_2_price', '750', 'pricing'),
('tier_3_price', '1000', 'pricing'),
('tier_1_description', '"Includes rubric (updated) and scoring with 4-5 pages of notes and detailed feedback"', 'pricing'),
('tier_2_description', '"Rubric score, includes 9-10 pages of notes. Including detailed analysis on character, structure, story, voice, and form – what works and what doesn''t – plus additional comments on how to strengthen, tighten, and clarify the script."', 'pricing'),
('tier_3_description', '"Rubric score, Includes everything from Package 2, plus written notations on the script. Script Notes includes suggestions for scenes that could be cut, condensed, dialogue that could be clearer, possible character changes as well as suggestions where to insert story changes."', 'pricing'),
('additional_page_fee', '5', 'pricing'),
('site_title', '"Honey & Hemlock Productions"', 'general'),
('support_email', '"support@honeyandhemlock.productions"', 'general')
ON CONFLICT (setting_key) DO NOTHING;

-- Create activity log table for dashboard tracking
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID,
  script_id UUID REFERENCES public.scripts(id),
  judge_id UUID REFERENCES public.judges(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for activity log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view activity log
CREATE POLICY "Admins can view activity log" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.judges 
      WHERE judges.id = auth.uid() AND judges.is_admin = TRUE
    )
  );

-- Policy for system to insert activity log
CREATE POLICY "System can insert activity log" ON public.activity_log
  FOR INSERT WITH CHECK (true);

-- Create function to update judge workload
CREATE OR REPLACE FUNCTION update_judge_workload()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workload when script is assigned
  IF TG_OP = 'UPDATE' AND OLD.assigned_judge_id IS DISTINCT FROM NEW.assigned_judge_id THEN
    -- Decrease workload for old judge
    IF OLD.assigned_judge_id IS NOT NULL THEN
      UPDATE public.judges 
      SET current_workload = current_workload - 1
      WHERE id = OLD.assigned_judge_id;
    END IF;
    
    -- Increase workload for new judge
    IF NEW.assigned_judge_id IS NOT NULL THEN
      UPDATE public.judges 
      SET current_workload = current_workload + 1
      WHERE id = NEW.assigned_judge_id;
    END IF;
  END IF;
  
  -- Update review completion stats
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('approved', 'declined') THEN
    UPDATE public.judges 
    SET total_scripts_reviewed = total_scripts_reviewed + 1,
        current_workload = current_workload - 1
    WHERE id = NEW.assigned_judge_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for judge workload updates
DROP TRIGGER IF EXISTS update_judge_workload_trigger ON public.scripts;
CREATE TRIGGER update_judge_workload_trigger
  AFTER UPDATE ON public.scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_judge_workload();

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_activity_type TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT NULL,
  p_script_id UUID DEFAULT NULL,
  p_judge_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.activity_log (activity_type, description, user_id, script_id, judge_id, metadata)
  VALUES (p_activity_type, p_description, p_user_id, p_script_id, p_judge_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
