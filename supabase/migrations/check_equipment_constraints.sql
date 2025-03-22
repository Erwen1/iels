-- Query to check the equipment table definition
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM
  pg_constraint c
JOIN
  pg_class t ON c.conrelid = t.oid
JOIN
  pg_namespace n ON t.relnamespace = n.oid
WHERE
  t.relname = 'equipment'
  AND n.nspname = 'public';

-- Query to view the table definition directly
\d equipment; 