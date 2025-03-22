-- Insert sample buildings
INSERT INTO buildings (name) VALUES
  ('Bâtiment A'),
  ('Bâtiment B'),
  ('Bâtiment C');

-- Insert floors for Bâtiment A
INSERT INTO floors (building_id, level) VALUES
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 0),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 1),
  ((SELECT id FROM buildings WHERE name = 'Bâtiment A'), 2);

-- Insert rooms for Bâtiment A
INSERT INTO rooms (floor_id, name) VALUES
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 0), 'Salle 101'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 0), 'Salle 102'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 1), 'Salle 201'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 1), 'Salle 202'),
  ((SELECT id FROM floors WHERE building_id = (SELECT id FROM buildings WHERE name = 'Bâtiment A') AND level = 2), 'Salle 301');

-- Insert storage units for rooms
INSERT INTO storage_units (room_id, name) VALUES
  ((SELECT id FROM rooms WHERE name = 'Salle 101'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 101'), 'Armoire 2'),
  ((SELECT id FROM rooms WHERE name = 'Salle 102'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 201'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 201'), 'Armoire 2'),
  ((SELECT id FROM rooms WHERE name = 'Salle 202'), 'Armoire 1'),
  ((SELECT id FROM rooms WHERE name = 'Salle 301'), 'Armoire 1');

-- Insert shelves for storage units
INSERT INTO shelves (storage_unit_id, level) VALUES
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 2),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 2' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 102')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 201')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 2' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 201')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 202')), 1),
  ((SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 301')), 1);

-- Insert boxes for shelves
INSERT INTO boxes (shelf_id, name, barcode, status) VALUES
  ((SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 'Boîte 1', 'BOX001', 'DISPONIBLE'),
  ((SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 'Boîte 2', 'BOX002', 'DISPONIBLE'),
  ((SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 2), 'Boîte 3', 'BOX003', 'EMPRUNTE'),
  ((SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 2' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 101')) AND level = 1), 'Boîte 4', 'BOX004', 'DISPONIBLE'),
  ((SELECT id FROM shelves WHERE storage_unit_id = (SELECT id FROM storage_units WHERE name = 'Armoire 1' AND room_id = (SELECT id FROM rooms WHERE name = 'Salle 102')) AND level = 1), 'Boîte 5', 'BOX005', 'MAINTENANCE');

-- Insert sample equipment with all required fields
INSERT INTO equipment (reference, name, description, type, department, building, floor, room, referent, status) VALUES
  ('MICRO001', 'Microscope', 'Microscope optique standard', 'MATERIEL_PEDAGOGIQUE', 'Sciences', 'Bâtiment A', '1er étage', 'Salle 101', '{"prof.sciences@example.com"}', 'DISPONIBLE'),
  ('LAPTOP001', 'Ordinateur portable', 'Laptop Dell Latitude', 'MATERIEL_INFORMATIQUE', 'Informatique', 'Bâtiment B', '2ème étage', 'Salle 202', '{"tech.info@example.com"}', 'EMPRUNTE'),
  ('PROJ001', 'Projecteur', 'Projecteur Epson', 'MATERIEL_PEDAGOGIQUE', 'Audiovisuel', 'Bâtiment A', 'Rez-de-chaussée', 'Salle 101', '{"av.tech@example.com"}', 'DISPONIBLE'),
  ('PRINT001', 'Imprimante', 'Imprimante HP LaserJet', 'MATERIEL_INFORMATIQUE', 'Informatique', 'Bâtiment C', '3ème étage', 'Salle 301', '{"tech.info@example.com"}', 'MAINTENANCE');

-- Link equipment to boxes
INSERT INTO equipment_boxes (box_id, equipment_id) VALUES
  ((SELECT id FROM boxes WHERE barcode = 'BOX001'), (SELECT id FROM equipment WHERE name = 'Microscope')),
  ((SELECT id FROM boxes WHERE barcode = 'BOX002'), (SELECT id FROM equipment WHERE name = 'Ordinateur portable')),
  ((SELECT id FROM boxes WHERE barcode = 'BOX003'), (SELECT id FROM equipment WHERE name = 'Projecteur')),
  ((SELECT id FROM boxes WHERE barcode = 'BOX004'), (SELECT id FROM equipment WHERE name = 'Imprimante')); 