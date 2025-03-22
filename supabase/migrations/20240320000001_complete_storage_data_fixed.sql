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