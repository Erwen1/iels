-- Create loan_requests table
CREATE TABLE IF NOT EXISTS public.loan_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  project_description TEXT NOT NULL,
  loan_manager_email VARCHAR(255) NOT NULL,
  borrowing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT status_check CHECK (status IN ('EN_ATTENTE', 'APPROUVE', 'EMPRUNTE', 'RETOURNE', 'REFUSE'))
);

-- Enable Row Level Security
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON public.loan_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON public.loan_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" ON public.loan_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER on_loan_request_update
  BEFORE UPDATE ON public.loan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 