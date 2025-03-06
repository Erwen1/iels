-- Add location column to equipment table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN location VARCHAR(255);
    END IF;
END $$; 