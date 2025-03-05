-- First, ensure we have the departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  department_id UUID REFERENCES public.departments(id),
  role_id UUID REFERENCES public.roles(id),
  phone VARCHAR(20),
  office_location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
  ('admin', 'Administrator with full access', '["manage_users", "manage_equipment", "manage_loans", "manage_departments", "view_reports"]'),
  ('manager', 'Department manager with limited access', '["manage_equipment", "manage_loans", "view_reports"]'),
  ('user', 'Regular user with basic access', '["request_loans", "view_equipment"]')
ON CONFLICT (name) DO NOTHING;

-- Insert a default department if none exists
INSERT INTO public.departments (name, description)
VALUES ('Administration', 'Administrative Department')
ON CONFLICT (name) DO NOTHING;

-- Create or update user profile for the admin user
INSERT INTO public.user_profiles (
  id,
  full_name,
  department_id,
  role_id,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User'),
  (SELECT id FROM public.departments WHERE name = 'Administration'),
  (SELECT id FROM public.roles WHERE name = 'admin'),
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'your.email@example.com'
ON CONFLICT (id) DO UPDATE
SET 
  role_id = (SELECT id FROM public.roles WHERE name = 'admin'),
  department_id = (SELECT id FROM public.departments WHERE name = 'Administration'),
  updated_at = NOW();

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.roles;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON public.departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id); 