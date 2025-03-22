-- Step 2: Insert floors for Bâtiment A
INSERT INTO floors (building_id, level) VALUES
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 0),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 1),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 2); 