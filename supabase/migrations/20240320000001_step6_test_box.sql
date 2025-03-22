-- Step 6: Test inserting a single box with the correct status values
-- Using 'available' (allowed by constraint)
INSERT INTO boxes (shelf_id, name, barcode, status) 
VALUES (
  (SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 
  'Test Box 1', 
  'TEST001', 
  'available'
);

-- Using 'in_use' (allowed by constraint)
INSERT INTO boxes (shelf_id, name, barcode, status) 
VALUES (
  (SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 
  'Test Box 2', 
  'TEST002', 
  'in_use'
);

-- Using 'maintenance' (allowed by constraint)
INSERT INTO boxes (shelf_id, name, barcode, status) 
VALUES (
  (SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 
  'Test Box 3', 
  'TEST003', 
  'maintenance'
); 