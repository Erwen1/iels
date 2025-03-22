-- Insert sample buildings if they don't exist
INSERT INTO buildings (name)
SELECT 'Bâtiment A' WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Bâtiment A');

INSERT INTO buildings (name)
SELECT 'Bâtiment B' WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Bâtiment B');

INSERT INTO buildings (name)
SELECT 'Bâtiment C' WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Bâtiment C');

-- Insert floors for Bâtiment A if they don't exist
DO $$
DECLARE
  building_a_id UUID;
BEGIN
  -- Get building ID
  SELECT id INTO building_a_id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1;
  
  -- Insert floors if they don't exist
  INSERT INTO floors (building_id, level)
  SELECT building_a_id, 0
  WHERE NOT EXISTS (SELECT 1 FROM floors WHERE building_id = building_a_id AND level = 0);
  
  INSERT INTO floors (building_id, level)
  SELECT building_a_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM floors WHERE building_id = building_a_id AND level = 1);
  
  INSERT INTO floors (building_id, level)
  SELECT building_a_id, 2
  WHERE NOT EXISTS (SELECT 1 FROM floors WHERE building_id = building_a_id AND level = 2);
END $$;

-- Insert rooms for Bâtiment A if they don't exist
DO $$
DECLARE
  floor0_id UUID;
  floor1_id UUID;
  floor2_id UUID;
  building_a_id UUID;
BEGIN
  -- Get building ID
  SELECT id INTO building_a_id FROM buildings WHERE name = 'Bâtiment A' LIMIT 1;
  
  -- Get floor IDs
  SELECT id INTO floor0_id FROM floors WHERE building_id = building_a_id AND level = 0 LIMIT 1;
  SELECT id INTO floor1_id FROM floors WHERE building_id = building_a_id AND level = 1 LIMIT 1;
  SELECT id INTO floor2_id FROM floors WHERE building_id = building_a_id AND level = 2 LIMIT 1;
  
  -- Insert rooms if they don't exist
  -- For floor 0
  INSERT INTO rooms (floor_id, name)
  SELECT floor0_id, 'Salle 101'
  WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE floor_id = floor0_id AND name = 'Salle 101');
  
  INSERT INTO rooms (floor_id, name)
  SELECT floor0_id, 'Salle 102'
  WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE floor_id = floor0_id AND name = 'Salle 102');
  
  -- For floor 1
  INSERT INTO rooms (floor_id, name)
  SELECT floor1_id, 'Salle 201'
  WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE floor_id = floor1_id AND name = 'Salle 201');
  
  INSERT INTO rooms (floor_id, name)
  SELECT floor1_id, 'Salle 202'
  WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE floor_id = floor1_id AND name = 'Salle 202');
  
  -- For floor 2
  INSERT INTO rooms (floor_id, name)
  SELECT floor2_id, 'Salle 301'
  WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE floor_id = floor2_id AND name = 'Salle 301');
END $$;

-- Insert storage units for rooms if they don't exist
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
  
  -- Insert storage units for rooms if they don't exist
  -- For room 101
  INSERT INTO storage_units (room_id, name)
  SELECT room_101_id, 'Armoire 1'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_101_id AND name = 'Armoire 1');
  
  INSERT INTO storage_units (room_id, name)
  SELECT room_101_id, 'Armoire 2'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_101_id AND name = 'Armoire 2');
  
  -- For room 102
  INSERT INTO storage_units (room_id, name)
  SELECT room_102_id, 'Armoire 1'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_102_id AND name = 'Armoire 1');
  
  -- For room 201
  INSERT INTO storage_units (room_id, name)
  SELECT room_201_id, 'Armoire 1'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_201_id AND name = 'Armoire 1');
  
  INSERT INTO storage_units (room_id, name)
  SELECT room_201_id, 'Armoire 2'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_201_id AND name = 'Armoire 2');
  
  -- For room 202
  INSERT INTO storage_units (room_id, name)
  SELECT room_202_id, 'Armoire 1'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_202_id AND name = 'Armoire 1');
  
  -- For room 301
  INSERT INTO storage_units (room_id, name)
  SELECT room_301_id, 'Armoire 1'
  WHERE NOT EXISTS (SELECT 1 FROM storage_units WHERE room_id = room_301_id AND name = 'Armoire 1');
END $$;

-- Insert shelves for storage units if they don't exist
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
  
  -- Insert shelves if they don't exist
  -- For Armoire 1 in Room 101
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_101_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_101_id AND level = 1);
  
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_101_id, 2
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_101_id AND level = 2);
  
  -- For Armoire 2 in Room 101
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire2_101_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire2_101_id AND level = 1);
  
  -- For Armoire 1 in Room 102
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_102_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_102_id AND level = 1);
  
  -- For Armoire 1 in Room 201
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_201_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_201_id AND level = 1);
  
  -- For Armoire 2 in Room 201
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire2_201_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire2_201_id AND level = 1);
  
  -- For Armoire 1 in Room 202
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_202_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_202_id AND level = 1);
  
  -- For Armoire 1 in Room 301
  INSERT INTO shelves (storage_unit_id, level)
  SELECT armoire1_301_id, 1
  WHERE NOT EXISTS (SELECT 1 FROM shelves WHERE storage_unit_id = armoire1_301_id AND level = 1);
END $$;

-- Insert boxes for shelves if they don't exist
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
  
  -- Insert boxes if they don't exist
  -- For Shelf 1 of Armoire 1 in Room 101
  INSERT INTO boxes (shelf_id, name, barcode, status)
  SELECT shelf1_armoire1_101_id, 'Boîte 1', 'BOX001', 'available'
  WHERE NOT EXISTS (SELECT 1 FROM boxes WHERE barcode = 'BOX001');
  
  INSERT INTO boxes (shelf_id, name, barcode, status)
  SELECT shelf1_armoire1_101_id, 'Boîte 2', 'BOX002', 'available'
  WHERE NOT EXISTS (SELECT 1 FROM boxes WHERE barcode = 'BOX002');
  
  -- For Shelf 2 of Armoire 1 in Room 101
  INSERT INTO boxes (shelf_id, name, barcode, status)
  SELECT shelf2_armoire1_101_id, 'Boîte 3', 'BOX003', 'in_use'
  WHERE NOT EXISTS (SELECT 1 FROM boxes WHERE barcode = 'BOX003');
  
  -- For Shelf 1 of Armoire 2 in Room 101
  INSERT INTO boxes (shelf_id, name, barcode, status)
  SELECT shelf1_armoire2_101_id, 'Boîte 4', 'BOX004', 'available'
  WHERE NOT EXISTS (SELECT 1 FROM boxes WHERE barcode = 'BOX004');
  
  -- For Shelf 1 of Armoire 1 in Room 102
  INSERT INTO boxes (shelf_id, name, barcode, status)
  SELECT shelf1_armoire1_102_id, 'Boîte 5', 'BOX005', 'maintenance'
  WHERE NOT EXISTS (SELECT 1 FROM boxes WHERE barcode = 'BOX005');
END $$; 