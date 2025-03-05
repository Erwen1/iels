-- Create loan status history table
CREATE TABLE IF NOT EXISTS public.loan_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_request_id UUID NOT NULL REFERENCES public.loan_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  comment TEXT,
  changed_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.loan_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON public.loan_status_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON public.loan_status_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create trigger function to automatically create status history entry
CREATE OR REPLACE FUNCTION public.handle_loan_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.loan_status_history (
      loan_request_id,
      previous_status,
      new_status,
      comment,
      changed_by
    ) VALUES (
      NEW.id,
      NULL,
      NEW.status,
      'Demande de prêt créée',
      auth.email()
    );
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.loan_status_history (
      loan_request_id,
      previous_status,
      new_status,
      comment,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.admin_comment, 'Statut mis à jour'),
      auth.email()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_loan_status_change ON public.loan_requests;
CREATE TRIGGER on_loan_status_change
  AFTER INSERT OR UPDATE ON public.loan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_loan_status_change(); 