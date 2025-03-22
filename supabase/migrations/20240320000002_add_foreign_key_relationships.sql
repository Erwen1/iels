-- Check if foreign key constraint already exists before adding
DO $$
BEGIN
  -- Add foreign key relationship between floors and buildings
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'floors_building_id_fkey' 
    AND conrelid = 'floors'::regclass
  ) THEN
    ALTER TABLE floors ADD CONSTRAINT floors_building_id_fkey 
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: floors_building_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: floors_building_id_fkey';
  END IF;

  -- Add foreign key relationship between rooms and floors
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rooms_floor_id_fkey' 
    AND conrelid = 'rooms'::regclass
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_floor_id_fkey 
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: rooms_floor_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: rooms_floor_id_fkey';
  END IF;

  -- Add foreign key relationship between storage_units and rooms
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'storage_units_room_id_fkey' 
    AND conrelid = 'storage_units'::regclass
  ) THEN
    ALTER TABLE storage_units ADD CONSTRAINT storage_units_room_id_fkey 
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: storage_units_room_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: storage_units_room_id_fkey';
  END IF;

  -- Add foreign key relationship between shelves and storage_units
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'shelves_storage_unit_id_fkey' 
    AND conrelid = 'shelves'::regclass
  ) THEN
    ALTER TABLE shelves ADD CONSTRAINT shelves_storage_unit_id_fkey 
    FOREIGN KEY (storage_unit_id) REFERENCES storage_units(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: shelves_storage_unit_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: shelves_storage_unit_id_fkey';
  END IF;

  -- Add foreign key relationship between boxes and shelves
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'boxes_shelf_id_fkey' 
    AND conrelid = 'boxes'::regclass
  ) THEN
    ALTER TABLE boxes ADD CONSTRAINT boxes_shelf_id_fkey 
    FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint: boxes_shelf_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: boxes_shelf_id_fkey';
  END IF;
END $$; 