-- Step 4: Insert storage units
INSERT INTO storage_units (room_id, name) VALUES
  ((SELECT id FROM rooms WHERE name = 'Salle 101'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 101'), 'Armoire 2'),
  ((SELECT id FROM rooms WHERE name = 'Salle 102'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 201'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 201'), 'Armoire 2'),
  ((SELECT id FROM rooms WHERE name = 'Salle 202'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 301'), 'Armoire 1'); 