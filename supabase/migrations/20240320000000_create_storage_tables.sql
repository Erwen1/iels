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

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create equipment_boxes junction table
CREATE TABLE IF NOT EXISTS equipment_boxes (
    box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
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

-- Create RLS policies
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to view all storage data"
    ON buildings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON floors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON rooms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON storage_units FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON shelves FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON boxes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON equipment FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON equipment_boxes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to view all storage data"
    ON box_documents FOR SELECT
    TO authenticated
    USING (true);

-- Create policies for admin and teacher roles
CREATE POLICY "Allow admin and teacher to manage storage data"
    ON buildings FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON floors FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON rooms FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON storage_units FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON shelves FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON boxes FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON equipment FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON equipment_boxes FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    );

CREATE POLICY "Allow admin and teacher to manage storage data"
    ON box_documents FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('ADMIN', 'ENSEIGNANT')
    ); 