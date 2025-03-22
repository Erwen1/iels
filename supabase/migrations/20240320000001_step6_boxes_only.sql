-- Step 6: Insert boxes using a simpler approach
-- First, get a specific shelf ID to use for all boxes
DO $$
DECLARE
  target_shelf_id UUID;
BEGIN
  -- Find a shelf ID that exists (from the first storage unit, first shelf)
  SELECT id INTO target_shelf_id FROM shelves LIMIT 1;
  
  -- Make sure we found a shelf
  IF target_shelf_id IS NULL THEN
    RAISE EXCEPTION 'No shelves found in the database';
  END IF;
  
  -- Insert boxes with correct status values
  INSERT INTO boxes (shelf_id, name, barcode, status) VALUES
    (target_shelf_id, 'Boîte 1', 'BOX001', 'available'),
    (target_shelf_id, 'Boîte 2', 'BOX002', 'available'),
    (target_shelf_id, 'Boîte 3', 'BOX003', 'in_use'),
    (target_shelf_id, 'Boîte 4', 'BOX004', 'available'),
    (target_shelf_id, 'Boîte 5', 'BOX005', 'maintenance');
    
  RAISE NOTICE 'Successfully inserted 5 boxes with shelf_id: %', target_shelf_id;
END $$; 