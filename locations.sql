-- Create locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    building VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_locations_building_room ON public.locations(building, room);

-- Add a few sample locations
INSERT INTO public.locations (building, room)
VALUES 
  ('Bâtiment A', 'Salle 101'),
  ('Bâtiment A', 'Salle 102'),
  ('Bâtiment A', 'Salle 201'),
  ('Bâtiment B', 'Laboratoire 1'),
  ('Bâtiment B', 'Laboratoire 2'),
  ('Bâtiment C', 'Atelier');

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 