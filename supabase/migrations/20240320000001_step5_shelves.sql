-- Step 5: Insert shelves for storage units
INSERT INTO shelves (storage_unit_id, level) VALUES
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 2),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 2' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 102')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 201')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 2' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 201')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 202')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 301')), 1); 