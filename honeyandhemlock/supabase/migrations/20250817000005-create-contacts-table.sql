-- Create contacts table for storing form submissions
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contacts" ON public.contacts
  FOR SELECT USING (true);

CREATE POLICY "Admins can update contacts" ON public.contacts
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE USING (true);

-- Grant permissions
GRANT INSERT ON public.contacts TO anon;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;