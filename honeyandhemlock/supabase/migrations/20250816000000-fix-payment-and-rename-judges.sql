-- Fix default amount issue and rename judges to contractors

-- 1. Remove the default amount from scripts table (let the application handle it)
ALTER TABLE public.scripts ALTER COLUMN amount DROP DEFAULT;

-- 2. Rename judges table to contractors
ALTER TABLE public.judges RENAME TO contractors;

-- 3. Rename judge_applications to contractor_applications  
ALTER TABLE public.judge_applications RENAME TO contractor_applications;

-- 4. Rename the judge_status enum to contractor_status
ALTER TYPE judge_status RENAME TO contractor_status;

-- 5. Update column names in scripts table
ALTER TABLE public.scripts RENAME COLUMN assigned_judge_id TO assigned_contractor_id;

-- 6. Update column names in script_reviews table
ALTER TABLE public.script_reviews RENAME COLUMN judge_id TO contractor_id;

-- 7. Update column names in activity_log table
ALTER TABLE public.activity_log RENAME COLUMN judge_id TO contractor_id;

-- 8. Drop existing foreign key constraints
ALTER TABLE public.scripts DROP CONSTRAINT IF EXISTS scripts_assigned_judge_id_fkey;
ALTER TABLE public.script_reviews DROP CONSTRAINT IF EXISTS script_reviews_judge_id_fkey;
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_judge_id_fkey;

-- 9. Recreate foreign key constraints with new names
ALTER TABLE public.scripts 
  ADD CONSTRAINT scripts_assigned_contractor_id_fkey 
  FOREIGN KEY (assigned_contractor_id) REFERENCES public.contractors(id);

ALTER TABLE public.script_reviews 
  ADD CONSTRAINT script_reviews_contractor_id_fkey 
  FOREIGN KEY (contractor_id) REFERENCES public.contractors(id);

ALTER TABLE public.activity_log 
  ADD CONSTRAINT activity_log_contractor_id_fkey 
  FOREIGN KEY (contractor_id) REFERENCES public.contractors(id);

-- 10. Drop old policies
DROP POLICY IF EXISTS "Admins can manage judges" ON public.contractors;
DROP POLICY IF EXISTS "Judges can view their own data" ON public.contractors;
DROP POLICY IF EXISTS "Anyone can apply as judge" ON public.contractor_applications;
DROP POLICY IF EXISTS "Admins can view judge applications" ON public.contractor_applications;
DROP POLICY IF EXISTS "Admins can update judge applications" ON public.contractor_applications;

-- 11. Create new policies with contractor naming
CREATE POLICY "Admins can manage contractors" ON public.contractors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Contractors can view their own data" ON public.contractors
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can apply as contractor" ON public.contractor_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contractor applications" ON public.contractor_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contractors 
      WHERE contractors.id = auth.uid() AND contractors.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update contractor applications" ON public.contractor_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.contractors 
      WHERE contractors.id = auth.uid() AND contractors.is_admin = TRUE
    )
  );

-- 12. Update the scripts policies
DROP POLICY IF EXISTS "Judges can view assigned scripts" ON public.scripts;

CREATE POLICY "Contractors can view assigned scripts" ON public.scripts
  FOR SELECT USING (
    assigned_contractor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 13. Update the workload function
CREATE OR REPLACE FUNCTION update_contractor_workload()
RETURNS TRIGGER AS $$
BEGIN
  -- If script assignment changed
  IF TG_OP = 'UPDATE' AND OLD.assigned_contractor_id IS DISTINCT FROM NEW.assigned_contractor_id THEN
    -- Decrease workload for old contractor
    IF OLD.assigned_contractor_id IS NOT NULL THEN
      UPDATE public.contractors 
      SET current_workload = GREATEST(0, current_workload - 1)
      WHERE id = OLD.assigned_contractor_id;
    END IF;
    
    -- Increase workload for new contractor
    IF NEW.assigned_contractor_id IS NOT NULL THEN
      UPDATE public.contractors 
      SET current_workload = current_workload + 1
      WHERE id = NEW.assigned_contractor_id;
    END IF;
  END IF;
  
  -- If new script is assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_contractor_id IS NOT NULL THEN
    UPDATE public.contractors 
    SET current_workload = current_workload + 1,
        scripts_reviewed = scripts_reviewed + 1
    WHERE id = NEW.assigned_contractor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Drop old trigger and create new one
DROP TRIGGER IF EXISTS update_judge_workload_trigger ON public.scripts;
DROP FUNCTION IF EXISTS update_judge_workload();

CREATE TRIGGER update_contractor_workload_trigger
  AFTER INSERT OR UPDATE ON public.scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_workload();

-- 15. Update the log_activity function signature
CREATE OR REPLACE FUNCTION log_activity(
  p_activity_type TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT NULL,
  p_script_id UUID DEFAULT NULL,
  p_contractor_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.activity_log (activity_type, description, user_id, script_id, contractor_id, metadata)
  VALUES (p_activity_type, p_description, p_user_id, p_script_id, p_contractor_id, p_metadata);
END;
$$ LANGUAGE plpgsql;