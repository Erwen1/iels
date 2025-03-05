-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one row
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  loan_reminders BOOLEAN NOT NULL DEFAULT true,
  maintenance_alerts BOOLEAN NOT NULL DEFAULT true,
  overdue_notifications BOOLEAN NOT NULL DEFAULT true,

  -- Email Settings
  reminder_frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  email_template VARCHAR(20) NOT NULL DEFAULT 'default',

  -- System Settings
  language VARCHAR(10) NOT NULL DEFAULT 'fr',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  time_zone VARCHAR(50) NOT NULL DEFAULT 'Europe/Paris',

  -- Loan Settings
  max_loan_duration INTEGER NOT NULL DEFAULT 30,
  default_loan_duration INTEGER NOT NULL DEFAULT 7,
  allow_extensions BOOLEAN NOT NULL DEFAULT true,
  max_extensions INTEGER NOT NULL DEFAULT 2,

  -- Maintenance Settings
  maintenance_interval INTEGER NOT NULL DEFAULT 90,
  auto_schedule BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Add constraints
  CONSTRAINT reminder_frequency_check CHECK (reminder_frequency IN ('daily', 'weekly', 'biweekly')),
  CONSTRAINT email_template_check CHECK (email_template IN ('default', 'minimal', 'detailed')),
  CONSTRAINT language_check CHECK (language IN ('fr', 'en')),
  CONSTRAINT date_format_check CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'))
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON public.system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for admin users" ON public.system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Insert default settings if they don't exist
INSERT INTO public.system_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING; 