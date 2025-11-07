-- ============================================
-- TRAFFIC SIMULATOR - VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to verify setup
-- ============================================

-- 1. Check if all tables exist
SELECT 
  tablename 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' 
  AND (tablename LIKE '%road%' OR tablename LIKE '%traffic%')
ORDER BY tablename;

-- Expected: road_closures, road_segments, special_events, traffic_data, traffic_predictions

-- ============================================
-- 2. Count records in each table
-- ============================================

SELECT 'road_segments' as table_name, COUNT(*) as count FROM road_segments
UNION ALL
SELECT 'traffic_data', COUNT(*) FROM traffic_data
UNION ALL
SELECT 'road_closures', COUNT(*) FROM road_closures
UNION ALL
SELECT 'traffic_predictions', COUNT(*) FROM traffic_predictions
UNION ALL
SELECT 'special_events', COUNT(*) FROM special_events
ORDER BY table_name;

-- Expected Results:
-- road_segments: 12
-- traffic_data: 150
-- road_closures: 1
-- traffic_predictions: 0 (will be populated by simulations)
-- special_events: 3

-- ============================================
-- 3. View sample road segments (Raipur roads)
-- ============================================

SELECT 
  id,
  name,
  road_name,
  start_point,
  end_point,
  length_km,
  lanes,
  road_type,
  speed_limit
FROM road_segments
ORDER BY road_name, start_point
LIMIT 10;

-- Should show: VIP Road, GE Road, Station Road, Ring Road, etc.

-- ============================================
-- 4. View traffic data by time of day
-- ============================================

SELECT 
  rs.road_name,
  td.hour,
  td.congestion_level,
  COUNT(*) as data_points,
  ROUND(AVG(td.vehicle_count)::numeric, 0) as avg_vehicles,
  ROUND(AVG(td.avg_speed)::numeric, 1) as avg_speed
FROM traffic_data td
JOIN road_segments rs ON td.road_segment_id = rs.id
GROUP BY rs.road_name, td.hour, td.congestion_level
ORDER BY rs.road_name, td.hour
LIMIT 20;

-- Should show traffic patterns: morning rush (9-11), evening rush (17-19), off-peak (14-16)

-- ============================================
-- 5. View special events
-- ============================================

SELECT 
  name,
  event_type,
  description,
  start_time,
  end_time,
  expected_attendance,
  traffic_multiplier,
  array_length(affected_road_segments, 1) as num_affected_roads
FROM special_events
ORDER BY start_time;

-- Should show: IPL Cricket, Diwali Festival, Road Construction

-- ============================================
-- 6. View existing road closures
-- ============================================

SELECT 
  rc.id,
  rs.road_name || ': ' || rs.start_point || ' → ' || rs.end_point as road_segment,
  rc.closure_type,
  rc.reason,
  rc.start_time,
  rc.end_time,
  rc.status,
  rc.is_simulation,
  rc.estimated_delay_minutes
FROM road_closures rc
JOIN road_segments rs ON rc.road_segment_id = rs.id
ORDER BY rc.start_time DESC;

-- Should show: 1 VIP movement closure

-- ============================================
-- 7. Find roads by type
-- ============================================

SELECT 
  road_type,
  COUNT(*) as num_segments,
  SUM(length_km) as total_km,
  ROUND(AVG(speed_limit)::numeric, 0) as avg_speed_limit
FROM road_segments
GROUP BY road_type
ORDER BY num_segments DESC;

-- Should show breakdown: major, arterial, collector roads

-- ============================================
-- 8. Find peak traffic hours
-- ============================================

SELECT 
  hour,
  COUNT(*) as records,
  ROUND(AVG(vehicle_count)::numeric, 0) as avg_vehicles,
  mode() WITHIN GROUP (ORDER BY congestion_level) as most_common_congestion
FROM traffic_data
GROUP BY hour
ORDER BY avg_vehicles DESC
LIMIT 10;

-- Should show: Hours 17-19 (evening rush) and 9-11 (morning rush) as peak

-- ============================================
-- 9. Test simulation results (if any simulations run)
-- ============================================

SELECT 
  rc.id,
  rs.road_name,
  rc.reason,
  rc.simulation_results->>'timestamp' as simulated_at,
  (rc.simulation_results->'overall_impact'->>'severity') as severity,
  (rc.simulation_results->'overall_impact'->>'avg_delay_minutes')::int as avg_delay,
  (rc.simulation_results->'overall_impact'->>'total_affected_segments')::int as affected_count
FROM road_closures rc
JOIN road_segments rs ON rc.road_segment_id = rs.id
WHERE rc.is_simulation = true
ORDER BY rc.created_at DESC
LIMIT 5;

-- Will show results of any simulations you run through the UI

-- ============================================
-- 10. Geographic query - Find roads near a point
-- ============================================

SELECT 
  name,
  road_name,
  start_point,
  end_point,
  length_km,
  ROUND(
    SQRT(
      POWER(start_lat - 21.2514, 2) + 
      POWER(start_lng - 81.6296, 2)
    )::numeric * 111,  -- Convert to approximate km
    2
  ) as distance_km
FROM road_segments
ORDER BY distance_km
LIMIT 5;

-- Finds roads near coordinates 21.2514, 81.6296 (Pandri area)

-- ============================================
-- SUCCESS CRITERIA CHECKLIST
-- ============================================

-- Run this final check to ensure everything is ready:

DO $$
DECLARE
  seg_count int;
  traffic_count int;
  event_count int;
BEGIN
  SELECT COUNT(*) INTO seg_count FROM road_segments;
  SELECT COUNT(*) INTO traffic_count FROM traffic_data;
  SELECT COUNT(*) INTO event_count FROM special_events;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'TRAFFIC SIMULATOR SETUP VERIFICATION';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  
  IF seg_count >= 12 THEN
    RAISE NOTICE '✅ Road segments: % (Expected: 12+)', seg_count;
  ELSE
    RAISE NOTICE '❌ Road segments: % (Expected: 12+)', seg_count;
  END IF;
  
  IF traffic_count >= 150 THEN
    RAISE NOTICE '✅ Traffic data: % (Expected: 150+)', traffic_count;
  ELSE
    RAISE NOTICE '❌ Traffic data: % (Expected: 150+)', traffic_count;
  END IF;
  
  IF event_count >= 3 THEN
    RAISE NOTICE '✅ Special events: % (Expected: 3+)', event_count;
  ELSE
    RAISE NOTICE '❌ Special events: % (Expected: 3+)', event_count;
  END IF;
  
  RAISE NOTICE '';
  
  IF seg_count >= 12 AND traffic_count >= 150 AND event_count >= 3 THEN
    RAISE NOTICE '🎉 ALL CHECKS PASSED! Ready to test simulator.';
    RAISE NOTICE '👉 Next: Open http://localhost:3000/admin/simulate';
  ELSE
    RAISE NOTICE '⚠️  Some checks failed. Review seed data.';
  END IF;
  
  RAISE NOTICE '===========================================';
END $$;
