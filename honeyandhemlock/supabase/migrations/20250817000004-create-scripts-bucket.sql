-- Create storage bucket for scripts if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'scripts',
  'scripts',
  true, -- Make it public so we can generate public URLs
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for scripts bucket
CREATE POLICY "Anyone can upload scripts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scripts');

CREATE POLICY "Anyone can view scripts" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

CREATE POLICY "Admins can delete scripts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'scripts' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update scripts" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'scripts' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = users.id
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );