-- Check if functions exist
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_loan_status_trend',
    'get_equipment_utilization_trend',
    'calculate_equipment_trend',
    'get_most_used_equipment',
    'calculate_loan_trends',
    'get_loan_duration_stats',
    'generate_date_series'
); 