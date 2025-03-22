-- Check if tables exist
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buildings') AS buildings_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'floors') AS floors_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') AS rooms_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_units') AS storage_units_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shelves') AS shelves_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boxes') AS boxes_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') AS users_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_requests') AS loan_requests_exists;

-- Check record counts
SELECT 'buildings' AS table_name, COUNT(*) AS record_count FROM buildings UNION ALL
SELECT 'floors', COUNT(*) FROM floors UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms UNION ALL
SELECT 'storage_units', COUNT(*) FROM storage_units UNION ALL
SELECT 'shelves', COUNT(*) FROM shelves UNION ALL
SELECT 'boxes', COUNT(*) FROM boxes; 