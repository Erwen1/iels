-- Update equipment table to add missing columns
DO $$
BEGIN
    -- Add equipment_manager_email column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'equipment_manager_email'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN equipment_manager_email VARCHAR(255);
        RAISE NOTICE 'Added equipment_manager_email column to equipment table';
    END IF;

    -- Add type column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN type VARCHAR(50);
        RAISE NOTICE 'Added type column to equipment table';
    END IF;

    -- Add reference column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'reference'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN reference VARCHAR(255);
        RAISE NOTICE 'Added reference column to equipment table';
    END IF;

    -- Add department column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'department'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN department VARCHAR(255);
        RAISE NOTICE 'Added department column to equipment table';
    END IF;

    -- Add quantity column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN quantity INTEGER DEFAULT 1;
        RAISE NOTICE 'Added quantity column to equipment table';
    END IF;

    -- Add location column if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'location'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column to equipment table';
    END IF;

    -- Add box_id column if not exists (for direct association with boxes)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'box_id'
    ) THEN
        ALTER TABLE public.equipment ADD COLUMN box_id UUID REFERENCES boxes(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added box_id column to equipment table';
    END IF;

    -- Update status CHECK constraint to match the application's expected values
    ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS status_check;
    ALTER TABLE public.equipment ADD CONSTRAINT status_check 
        CHECK (status IN ('DISPONIBLE', 'EMPRUNTE', 'MAINTENANCE', 'HORS_SERVICE', 'available', 'in_use', 'maintenance'));
    RAISE NOTICE 'Updated status check constraint';

END $$;
