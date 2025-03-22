-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create floors table
CREATE TABLE IF NOT EXISTS floors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(building_id, level)
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create storage_units table
CREATE TABLE IF NOT EXISTS storage_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shelves table
CREATE TABLE IF NOT EXISTS shelves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storage_unit_id UUID NOT NULL REFERENCES storage_units(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(storage_unit_id, level)
);

-- Create boxes table
CREATE TABLE IF NOT EXISTS boxes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shelf_id UUID NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create equipment_boxes junction table
CREATE TABLE IF NOT EXISTS equipment_boxes (
    box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (box_id, equipment_id)
);

-- Create box_documents table
CREATE TABLE IF NOT EXISTS box_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS if not already enabled
DO $$
BEGIN
    -- Check and enable RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'buildings' AND rowsecurity = true
    ) THEN
        ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'floors' AND rowsecurity = true
    ) THEN
        ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'rooms' AND rowsecurity = true
    ) THEN
        ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'storage_units' AND rowsecurity = true
    ) THEN
        ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'shelves' AND rowsecurity = true
    ) THEN
        ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'boxes' AND rowsecurity = true
    ) THEN
        ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'equipment_boxes' AND rowsecurity = true
    ) THEN
        ALTER TABLE equipment_boxes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'box_documents' AND rowsecurity = true
    ) THEN
        ALTER TABLE box_documents ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies for authenticated users if they don't exist
DO $$
BEGIN
    -- Check and create policies for SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'buildings' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON buildings FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'floors' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON floors FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rooms' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON rooms FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage_units' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON storage_units FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shelves' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON shelves FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'boxes' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON boxes FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'equipment_boxes' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON equipment_boxes FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_documents' AND policyname = 'Allow authenticated users to view all storage data'
    ) THEN
        CREATE POLICY "Allow authenticated users to view all storage data"
            ON box_documents FOR SELECT
            TO authenticated
            USING (true);
    END IF;
    
    -- Check and create policies for ALL operations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'buildings' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON buildings FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'floors' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON floors FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rooms' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON rooms FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage_units' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON storage_units FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shelves' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON shelves FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'boxes' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON boxes FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'equipment_boxes' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON equipment_boxes FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_documents' AND policyname = 'Allow admin and teacher to manage storage data'
    ) THEN
        CREATE POLICY "Allow admin and teacher to manage storage data"
            ON box_documents FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
            );
    END IF;
END $$;

-- Insert sample buildings
INSERT INTO buildings (name) VALUES
  ('Bâtiment A'),
  ('Bâtiment B'),
  ('Bâtiment C');

-- Insert floors for Bâtiment A
INSERT INTO floors (building_id, level) VALUES
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1), 0),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1), 1),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1), 2);

-- Insert rooms for Bâtiment A
INSERT INTO rooms (floor_id, name) VALUES
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1) AND level = 0 LIMIT 1), 'Salle 101'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1) AND level = 0 LIMIT 1), 'Salle 102'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1) AND level = 1 LIMIT 1), 'Salle 201'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1) AND level = 1 LIMIT 1), 'Salle 202'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1) AND level = 2 LIMIT 1), 'Salle 301');

-- Insert storage units for rooms - using room_id directly with separate inserts
DO $$
DECLARE
  room_101_id UUID;
  room_102_id UUID;
  room_201_id UUID;
  room_202_id UUID;
  room_301_id UUID;
BEGIN
  -- Get room IDs
  SELECT id INTO room_101_id FROM rooms WHERE name = 'Salle 101' LIMIT 1;
  SELECT id INTO room_102_id FROM rooms WHERE name = 'Salle 102' LIMIT 1;
  SELECT id INTO room_201_id FROM rooms WHERE name = 'Salle 201' LIMIT 1;
  SELECT id INTO room_202_id FROM rooms WHERE name = 'Salle 202' LIMIT 1;
  SELECT id INTO room_301_id FROM rooms WHERE name = 'Salle 301' LIMIT 1;
  
  -- Insert storage units for rooms
  INSERT INTO storage_units (room_id, name) VALUES
    (room_101_id, 'Armoire 1'),
    (room_101_id, 'Armoire 2'),
    (room_102_id, 'Armoire 1'),
    (room_201_id, 'Armoire 1'),
    (room_201_id, 'Armoire 2'),
    (room_202_id, 'Armoire 1'),
    (room_301_id, 'Armoire 1');
END $$;

-- Insert shelves for storage units - using direct IDs
DO $$
DECLARE
  armoire1_101_id UUID;
  armoire2_101_id UUID;
  armoire1_102_id UUID;
  armoire1_201_id UUID;
  armoire2_201_id UUID;
  armoire1_202_id UUID;
  armoire1_301_id UUID;
  room_101_id UUID;
  room_102_id UUID;
  room_201_id UUID;
  room_202_id UUID;
  room_301_id UUID;
BEGIN
  -- Get room IDs
  SELECT id INTO room_101_id FROM rooms WHERE name = 'Salle 101' LIMIT 1;
  SELECT id INTO room_102_id FROM rooms WHERE name = 'Salle 102' LIMIT 1;
  SELECT id INTO room_201_id FROM rooms WHERE name = 'Salle 201' LIMIT 1;
  SELECT id INTO room_202_id FROM rooms WHERE name = 'Salle 202' LIMIT 1;
  SELECT id INTO room_301_id FROM rooms WHERE name = 'Salle 301' LIMIT 1;
  
  -- Get storage unit IDs
  SELECT id INTO armoire1_101_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_101_id LIMIT 1;
  SELECT id INTO armoire2_101_id FROM storage_units WHERE name = 'Armoire 2' AND room_id = room_101_id LIMIT 1;
  SELECT id INTO armoire1_102_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_102_id LIMIT 1;
  SELECT id INTO armoire1_201_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_201_id LIMIT 1;
  SELECT id INTO armoire2_201_id FROM storage_units WHERE name = 'Armoire 2' AND room_id = room_201_id LIMIT 1;
  SELECT id INTO armoire1_202_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_202_id LIMIT 1;
  SELECT id INTO armoire1_301_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_301_id LIMIT 1;
  
  -- Insert shelves
  INSERT INTO shelves (storage_unit_id, level) VALUES
    (armoire1_101_id, 1),
    (armoire1_101_id, 2),
    (armoire2_101_id, 1),
    (armoire1_102_id, 1),
    (armoire1_201_id, 1),
    (armoire2_201_id, 1),
    (armoire1_202_id, 1),
    (armoire1_301_id, 1);
END $$;

-- Insert boxes for shelves with correct status values
DO $$
DECLARE
  armoire1_101_id UUID;
  armoire2_101_id UUID;
  armoire1_102_id UUID;
  room_101_id UUID;
  room_102_id UUID;
  shelf1_armoire1_101_id UUID;
  shelf2_armoire1_101_id UUID;
  shelf1_armoire2_101_id UUID;
  shelf1_armoire1_102_id UUID;
BEGIN
  -- Get room IDs
  SELECT id INTO room_101_id FROM rooms WHERE name = 'Salle 101' LIMIT 1;
  SELECT id INTO room_102_id FROM rooms WHERE name = 'Salle 102' LIMIT 1;
  
  -- Get storage unit IDs
  SELECT id INTO armoire1_101_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_101_id LIMIT 1;
  SELECT id INTO armoire2_101_id FROM storage_units WHERE name = 'Armoire 2' AND room_id = room_101_id LIMIT 1;
  SELECT id INTO armoire1_102_id FROM storage_units WHERE name = 'Armoire 1' AND room_id = room_102_id LIMIT 1;
  
  -- Get shelf IDs
  SELECT id INTO shelf1_armoire1_101_id FROM shelves WHERE storage_unit_id = armoire1_101_id AND level = 1 LIMIT 1;
  SELECT id INTO shelf2_armoire1_101_id FROM shelves WHERE storage_unit_id = armoire1_101_id AND level = 2 LIMIT 1;
  SELECT id INTO shelf1_armoire2_101_id FROM shelves WHERE storage_unit_id = armoire2_101_id AND level = 1 LIMIT 1;
  SELECT id INTO shelf1_armoire1_102_id FROM shelves WHERE storage_unit_id = armoire1_102_id AND level = 1 LIMIT 1;
  
  -- Insert boxes
  INSERT INTO boxes (shelf_id, name, barcode, status) VALUES
    (shelf1_armoire1_101_id, 'Boîte 1', 'BOX001', 'available'),
    (shelf1_armoire1_101_id, 'Boîte 2', 'BOX002', 'available'),
    (shelf2_armoire1_101_id, 'Boîte 3', 'BOX003', 'in_use'),
    (shelf1_armoire2_101_id, 'Boîte 4', 'BOX004', 'available'),
    (shelf1_armoire1_102_id, 'Boîte 5', 'BOX005', 'maintenance');
END $$; 