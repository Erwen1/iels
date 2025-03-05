-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_loan_status_trend(integer);
DROP FUNCTION IF EXISTS public.get_equipment_utilization_trend(integer);
DROP FUNCTION IF EXISTS public.calculate_equipment_trend(integer);
DROP FUNCTION IF EXISTS public.get_most_used_equipment(integer);
DROP FUNCTION IF EXISTS public.calculate_loan_trends(integer);
DROP FUNCTION IF EXISTS public.get_loan_duration_stats();
DROP FUNCTION IF EXISTS public.generate_date_series(date, date);

-- Create recursive dates function
CREATE OR REPLACE FUNCTION public.generate_date_series(start_date date, end_date date)
RETURNS TABLE (series_date date) AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT d::date
  FROM generate_series(start_date, end_date, '1 day'::interval) d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get loan status trend
CREATE OR REPLACE FUNCTION public.get_loan_status_trend(days integer DEFAULT 30)
RETURNS TABLE (
  date date,
  active bigint,
  pending bigint,
  overdue bigint
) AS $$
DECLARE
  start_date date;
  end_date date;
BEGIN
  IF days IS NULL OR days <= 0 THEN
    days := 30;
  END IF;

  end_date := CURRENT_DATE;
  start_date := end_date - days + 1;

  RETURN QUERY
  WITH dates AS (
    SELECT d::date as series_date
    FROM generate_series(start_date, end_date, '1 day'::interval) d
  )
  SELECT 
    d.series_date as date,
    COALESCE(COUNT(CASE WHEN lr.status = 'EMPRUNTE' THEN 1 END), 0)::bigint as active,
    COALESCE(COUNT(CASE WHEN lr.status = 'EN_ATTENTE' THEN 1 END), 0)::bigint as pending,
    COALESCE(COUNT(CASE WHEN lr.status = 'EN_RETARD' THEN 1 END), 0)::bigint as overdue
  FROM dates d
  LEFT JOIN loan_requests lr ON d.series_date = DATE(lr.created_at)
  GROUP BY d.series_date
  ORDER BY d.series_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get equipment utilization trend
CREATE OR REPLACE FUNCTION public.get_equipment_utilization_trend(days integer DEFAULT 30)
RETURNS TABLE (
  date date,
  utilization numeric
) AS $$
DECLARE
  start_date date;
  end_date date;
BEGIN
  IF days IS NULL OR days <= 0 THEN
    days := 30;
  END IF;

  end_date := CURRENT_DATE;
  start_date := end_date - days + 1;

  RETURN QUERY
  WITH dates AS (
    SELECT d::date as series_date
    FROM generate_series(start_date, end_date, '1 day'::interval) d
  ),
  daily_stats AS (
    SELECT 
      d.series_date,
      CASE 
        WHEN COUNT(DISTINCT e.id) = 0 THEN 0
        ELSE (COUNT(DISTINCT lr.equipment_id)::numeric / COUNT(DISTINCT e.id)::numeric * 100)
      END as daily_utilization
    FROM dates d
    CROSS JOIN equipment e
    LEFT JOIN loan_requests lr ON e.id = lr.equipment_id
      AND lr.status = 'EMPRUNTE'
      AND d.series_date BETWEEN DATE(lr.borrowing_date) AND COALESCE(DATE(lr.actual_return_date), DATE(lr.expected_return_date))
    GROUP BY d.series_date
  )
  SELECT 
    series_date as date,
    COALESCE(daily_utilization, 0) as utilization
  FROM daily_stats
  ORDER BY series_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate equipment trend
CREATE OR REPLACE FUNCTION public.calculate_equipment_trend(days integer DEFAULT 30)
RETURNS TABLE (trend numeric) AS $$
DECLARE
  current_count integer;
  past_count integer;
BEGIN
  IF days IS NULL OR days <= 0 THEN
    days := 30;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM equipment;
  
  SELECT COUNT(*) INTO past_count
  FROM equipment
  WHERE created_at <= CURRENT_TIMESTAMP - (days || ' days')::interval;
  
  RETURN QUERY
  SELECT COALESCE(
    CASE
      WHEN past_count = 0 THEN 100
      ELSE ((current_count::numeric - past_count::numeric) / past_count::numeric * 100)
    END,
    0
  )::numeric AS trend;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most used equipment
CREATE OR REPLACE FUNCTION public.get_most_used_equipment(limit_count integer DEFAULT 5)
RETURNS TABLE (
  name text,
  loans bigint
) AS $$
BEGIN
  IF limit_count IS NULL OR limit_count <= 0 THEN
    limit_count := 5;
  END IF;

  RETURN QUERY
  SELECT 
    e.name,
    COALESCE(COUNT(lr.id), 0)::bigint as loans
  FROM equipment e
  LEFT JOIN loan_requests lr ON e.id = lr.equipment_id
  GROUP BY e.id, e.name
  ORDER BY loans DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate loan trends
CREATE OR REPLACE FUNCTION public.calculate_loan_trends(days integer DEFAULT 30)
RETURNS TABLE (
  active_trend numeric,
  overdue_trend numeric
) AS $$
DECLARE
  current_active integer;
  past_active integer;
  current_overdue integer;
  past_overdue integer;
BEGIN
  IF days IS NULL OR days <= 0 THEN
    days := 30;
  END IF;

  SELECT COUNT(*) INTO current_active
  FROM loan_requests
  WHERE status = 'EMPRUNTE';
  
  SELECT COUNT(*) INTO current_overdue
  FROM loan_requests
  WHERE status = 'EN_RETARD';
  
  SELECT COUNT(*) INTO past_active
  FROM loan_requests
  WHERE status = 'EMPRUNTE'
  AND created_at <= CURRENT_TIMESTAMP - (days || ' days')::interval;
  
  SELECT COUNT(*) INTO past_overdue
  FROM loan_requests
  WHERE status = 'EN_RETARD'
  AND created_at <= CURRENT_TIMESTAMP - (days || ' days')::interval;
  
  RETURN QUERY
  SELECT 
    COALESCE(
      CASE
        WHEN past_active = 0 THEN 100
        ELSE ((current_active::numeric - past_active::numeric) / past_active::numeric * 100)
      END,
      0
    )::numeric AS active_trend,
    COALESCE(
      CASE
        WHEN past_overdue = 0 THEN 100
        ELSE ((current_overdue::numeric - past_overdue::numeric) / past_overdue::numeric * 100)
      END,
      0
    )::numeric AS overdue_trend;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get loan duration statistics
CREATE OR REPLACE FUNCTION public.get_loan_duration_stats()
RETURNS TABLE (
  range text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN duration <= 7 THEN '1-7 jours'
      WHEN duration <= 14 THEN '8-14 jours'
      WHEN duration <= 30 THEN '15-30 jours'
      ELSE '30+ jours'
    END as range,
    COALESCE(COUNT(*), 0)::bigint as count
  FROM (
    SELECT 
      EXTRACT(DAY FROM (COALESCE(actual_return_date, CURRENT_TIMESTAMP) - borrowing_date)) as duration
    FROM loan_requests
    WHERE status IN ('EMPRUNTE', 'RETOURNE')
  ) durations
  GROUP BY range
  ORDER BY 
    CASE range
      WHEN '1-7 jours' THEN 1
      WHEN '8-14 jours' THEN 2
      WHEN '15-30 jours' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 