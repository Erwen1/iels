-- Step 3: Insert rooms for Bâtiment A
INSERT INTO rooms (floor_id, name) VALUES
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 0), 'Salle 101'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 0), 'Salle 102'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 1), 'Salle 201'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 1), 'Salle 202'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 2), 'Salle 301'); 