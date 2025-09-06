-- Fix permissions and add notifications system

-- 1. Fix scripts table DELETE policy for admins
DROP POLICY IF EXISTS "Admins can delete scripts" ON public.scripts;

CREATE POLICY "Admins can delete scripts" ON public.scripts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

-- 2. Ensure admins have full access to scripts
DROP POLICY IF EXISTS "Admins can manage all scripts" ON public.scripts;

CREATE POLICY "Admins have full access to scripts" ON public.scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

-- 3. Fix contacts table permissions
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;

-- Allow admins full access to contacts
CREATE POLICY "Admins have full access to contacts" ON public.contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('script_upload', 'review_complete', 'contact_form', 'contractor_signup', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 5. Add SMTP settings to site_settings (skip this section if site_settings doesn't exist)
-- Comment out these INSERTs if you get errors about site_settings table
/*
INSERT INTO public.site_settings (setting_key, setting_value, created_at, updated_at)
VALUES 
  ('smtp_host', '""'::json, NOW(), NOW()),
  ('smtp_port', '"587"'::json, NOW(), NOW()),
  ('smtp_username', '""'::json, NOW(), NOW()),
  ('smtp_password', '""'::json, NOW(), NOW()),
  ('smtp_from_email', '""'::json, NOW(), NOW()),
  ('smtp_from_name', '"Honey & Hemlock"'::json, NOW(), NOW()),
  ('smtp_secure', '"true"'::json, NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;
*/

-- 6. Fix judges table access for contractors
DROP POLICY IF EXISTS "Contractors can view their own data" ON public.judges;

CREATE POLICY "Users can view their own judge data" ON public.judges
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND (users.raw_user_meta_data->>'role' = 'admin' OR users.email = 'admin@admin.com')
    )
  );

-- 7. Function to create notification on script upload
CREATE OR REPLACE FUNCTION notify_script_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all admins about new script upload
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT 
    u.id,
    'script_upload',
    'New Script Uploaded',
    'A new script "' || COALESCE(NEW.title, 'Untitled') || '" has been uploaded',
    jsonb_build_object('script_id', NEW.id, 'script_title', NEW.title)
  FROM auth.users u
  WHERE u.raw_user_meta_data->>'role' = 'admin' OR u.email = 'admin@admin.com';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for script upload notifications
DROP TRIGGER IF EXISTS script_upload_notification ON public.scripts;
CREATE TRIGGER script_upload_notification
  AFTER INSERT ON public.scripts
  FOR EACH ROW
  EXECUTE FUNCTION notify_script_upload();

-- 8. Function to create notification on contact form submission
CREATE OR REPLACE FUNCTION notify_contact_form()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all admins about new contact form
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT 
    u.id,
    'contact_form',
    'New Contact Form Submission',
    'New message from ' || NEW.name || ' - ' || COALESCE(NEW.subject, 'No subject'),
    jsonb_build_object('contact_id', NEW.id, 'email', NEW.email, 'name', NEW.name)
  FROM auth.users u
  WHERE u.raw_user_meta_data->>'role' = 'admin' OR u.email = 'admin@admin.com';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contact form notifications
DROP TRIGGER IF EXISTS contact_form_notification ON public.contacts;
CREATE TRIGGER contact_form_notification
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_contact_form();

-- 9. Function to create notification when review is complete
CREATE OR REPLACE FUNCTION notify_review_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Notify admins about completed review
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      u.id,
      'review_complete',
      'Script Review Completed',
      'Review completed for script by contractor',
      jsonb_build_object('script_id', NEW.script_id, 'review_id', NEW.id)
    FROM auth.users u
    WHERE u.raw_user_meta_data->>'role' = 'admin' OR u.email = 'admin@admin.com';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review completion notifications
DROP TRIGGER IF EXISTS review_complete_notification ON public.script_reviews;
CREATE TRIGGER review_complete_notification
  AFTER UPDATE ON public.script_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_complete();

-- Grant necessary permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT SELECT ON public.notifications TO anon;