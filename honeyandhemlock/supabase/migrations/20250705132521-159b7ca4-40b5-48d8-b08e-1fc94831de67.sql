
-- Create enums first
DO $$ BEGIN
    CREATE TYPE judge_status AS ENUM ('pending', 'approved', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE script_status AS ENUM ('pending', 'assigned', 'approved', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'new'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id)
);

-- Create judges table
CREATE TABLE IF NOT EXISTS public.judges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  status judge_status DEFAULT 'pending'::judge_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT judges_pkey PRIMARY KEY (id)
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS public.scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  author_phone text,
  file_url text,
  file_name text,
  status script_status DEFAULT 'pending'::script_status,
  assigned_judge_id uuid,
  stripe_payment_intent_id text,
  payment_status payment_status DEFAULT 'pending'::payment_status,
  amount integer DEFAULT 5000,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scripts_pkey PRIMARY KEY (id),
  CONSTRAINT scripts_assigned_judge_id_fkey FOREIGN KEY (assigned_judge_id) REFERENCES public.judges(id)
);

-- Create script_reviews table
CREATE TABLE IF NOT EXISTS public.script_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  script_id uuid,
  judge_id uuid,
  feedback text,
  recommendation script_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT script_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT script_reviews_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.judges(id),
  CONSTRAINT script_reviews_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id)
);

-- Create sponsorship_payments table
CREATE TABLE IF NOT EXISTS public.sponsorship_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sponsor_name text,
  sponsor_email text,
  amount integer NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  payment_status payment_status DEFAULT 'pending'::payment_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sponsorship_payments_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Anyone can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contacts" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for judges
CREATE POLICY "Admins can manage judges" ON public.judges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Judges can view their own data" ON public.judges
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for scripts
CREATE POLICY "Anyone can insert scripts" ON public.scripts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all scripts" ON public.scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Judges can view assigned scripts" ON public.scripts
  FOR SELECT USING (
    assigned_judge_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for script_reviews
CREATE POLICY "Judges can manage their reviews" ON public.script_reviews
  FOR ALL USING (
    judge_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for sponsorship_payments
CREATE POLICY "Anyone can insert sponsorship payments" ON public.sponsorship_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view sponsorship payments" ON public.sponsorship_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = users.id 
      AND users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert admin user credentials (you'll need to hash the password in your auth system)
-- This is just for reference - actual user creation should be done through Supabase Auth
INSERT INTO auth.users (email, raw_user_meta_data) 
VALUES ('admin@honeyandhemlock.productions', '{"role": "admin"}'::jsonb)
ON CONFLICT (email) DO NOTHING;
