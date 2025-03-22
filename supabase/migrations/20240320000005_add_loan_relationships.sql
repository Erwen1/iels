-- First create users table unconditionally
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS for users table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'users' AND rowsecurity = true
  ) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow users to view their own data'
  ) THEN
    CREATE POLICY "Allow users to view their own data"
      ON users FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id OR auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
      );
  END IF;
    
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow admin to manage users'
  ) THEN
    CREATE POLICY "Allow admin to manage users"
      ON users FOR ALL
      TO authenticated
      USING (
        auth.jwt() ->> 'role' = 'ADMIN'
      );
  END IF;
END $$;

-- Now create loan_requests table
CREATE TABLE IF NOT EXISTS loan_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  equipment_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  pickup_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS for loan_requests table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'loan_requests' AND rowsecurity = true
  ) THEN
    ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for loan_requests table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loan_requests' AND policyname = 'Allow users to view their own loan requests'
  ) THEN
    CREATE POLICY "Allow users to view their own loan requests"
      ON loan_requests FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
      );
  END IF;
    
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loan_requests' AND policyname = 'Allow users to create loan requests'
  ) THEN
    CREATE POLICY "Allow users to create loan requests"
      ON loan_requests FOR INSERT
      TO authenticated
      WITH CHECK (
        user_id = auth.uid()
      );
  END IF;
    
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loan_requests' AND policyname = 'Allow admin and teacher to manage loan requests'
  ) THEN
    CREATE POLICY "Allow admin and teacher to manage loan requests"
      ON loan_requests FOR ALL
      TO authenticated
      USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
      );
  END IF;
END $$; 