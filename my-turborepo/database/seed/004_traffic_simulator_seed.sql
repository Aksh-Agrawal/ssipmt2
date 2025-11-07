-- Traffic Simulator Seed Data
-- Sample data for Raipur major roads

-- Insert major road segments in Raipur
INSERT INTO road_segments (name, road_name, start_point, end_point, start_lat, start_lng, end_lat, end_lng, length_km, lanes, road_type, speed_limit) VALUES
-- VIP Road segments
('VIP Road - Sector 1 to Pandri', 'VIP Road', 'Sector 1', 'Pandri Chowk', 21.2379, 81.6337, 21.2514, 81.6284, 1.8, 4, 'arterial', 60),
('VIP Road - Pandri to Devendra Nagar', 'VIP Road', 'Pandri Chowk', 'Devendra Nagar', 21.2514, 81.6284, 21.2650, 81.6231, 1.5, 4, 'arterial', 60),
('VIP Road - Devendra Nagar to Dhamtari Road', 'VIP Road', 'Devendra Nagar', 'Dhamtari Road Junction', 21.2650, 81.6231, 21.2785, 81.6178, 1.6, 4, 'arterial', 60),

-- GE Road segments
('GE Road - Station to Fafadih', 'GE Road', 'Railway Station', 'Fafadih Chowk', 21.2497, 81.6296, 21.2350, 81.6450, 2.1, 6, 'major', 60),
('GE Road - Fafadih to Mowa', 'GE Road', 'Fafadih Chowk', 'Mowa', 21.2350, 81.6450, 21.2200, 81.6600, 2.3, 6, 'major', 60),
('GE Road - Mowa to Tatibandh', 'GE Road', 'Mowa', 'Tatibandh', 21.2200, 81.6600, 21.2050, 81.6750, 2.0, 6, 'major', 60),

-- Station Road segments
('Station Road - Pandri to Railway Station', 'Station Road', 'Pandri', 'Railway Station', 21.2514, 81.6284, 21.2497, 81.6296, 0.8, 4, 'arterial', 50),
('Station Road - Railway Station to Bus Stand', 'Station Road', 'Railway Station', 'Bus Stand', 21.2497, 81.6296, 21.2480, 81.6308, 0.5, 4, 'arterial', 40),

-- Jail Road
('Jail Road - Civil Lines to Collectorate', 'Jail Road', 'Civil Lines', 'Collectorate', 21.2300, 81.6350, 21.2380, 81.6420, 1.2, 4, 'arterial', 50),

-- Ring Road segments
('Ring Road - North Sector', 'Ring Road', 'Avanti Vihar', 'Mana', 21.2900, 81.6200, 21.3000, 81.6300, 2.5, 4, 'major', 60),
('Ring Road - South Sector', 'Ring Road', 'Kota', 'Amlidih', 21.2100, 81.6400, 21.2000, 81.6500, 2.2, 4, 'major', 60),

-- Shankar Nagar Road
('Shankar Nagar Road', 'Shankar Nagar Road', 'Shankar Nagar', 'Telibandha', 21.2380, 81.6570, 21.2450, 81.6620, 1.0, 4, 'collector', 40);

-- Insert historical traffic data (sample for different times and conditions)
-- Peak morning hours (9-11 AM) - High congestion
INSERT INTO traffic_data (road_segment_id, "date", hour, day_of_week, vehicle_count, avg_speed, congestion_level, travel_time_minutes) 
SELECT 
  id,
  CURRENT_DATE - (random() * 30)::integer,
  9 + (random() * 2)::integer,
  (random() * 6)::integer,
  800 + (random() * 400)::integer,
  25 + (random() * 15),
  CASE 
    WHEN random() < 0.3 THEN 'moderate'
    WHEN random() < 0.7 THEN 'high'
    ELSE 'severe'
  END,
  length_km * 60 / (25 + random() * 15)
FROM road_segments
WHERE road_type IN ('major', 'arterial')
LIMIT 50;

-- Evening rush (5-7 PM) - Very high congestion
INSERT INTO traffic_data (road_segment_id, "date", hour, day_of_week, vehicle_count, avg_speed, congestion_level, travel_time_minutes)
SELECT 
  id,
  CURRENT_DATE - (random() * 30)::integer,
  17 + (random() * 2)::integer,
  (random() * 4)::integer + 1, -- Weekdays only
  1000 + (random() * 600)::integer,
  15 + (random() * 20),
  CASE 
    WHEN random() < 0.2 THEN 'high'
    ELSE 'severe'
  END,
  length_km * 60 / (15 + random() * 20)
FROM road_segments
WHERE road_type IN ('major', 'arterial')
LIMIT 50;

-- Off-peak hours (2-4 PM) - Low to moderate
INSERT INTO traffic_data (road_segment_id, "date", hour, day_of_week, vehicle_count, avg_speed, congestion_level, travel_time_minutes)
SELECT 
  id,
  CURRENT_DATE - (random() * 30)::integer,
  14 + (random() * 2)::integer,
  (random() * 6)::integer,
  300 + (random() * 300)::integer,
  45 + (random() * 15),
  CASE 
    WHEN random() < 0.7 THEN 'low'
    ELSE 'moderate'
  END,
  length_km * 60 / (45 + random() * 15)
FROM road_segments
LIMIT 50;

-- Insert some special events
INSERT INTO special_events (name, event_type, description, location, location_lat, location_lng, start_time, end_time, expected_attendance, traffic_multiplier, affected_road_segments) VALUES
('IPL Cricket Match', 'sports', 'IPL match at Shaheed Veer Narayan Singh International Cricket Stadium', 'Naya Raipur Cricket Stadium', 21.1458, 81.7392, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 4 hours', 40000, 2.5, 
  (SELECT ARRAY_AGG(id) FROM road_segments WHERE road_name IN ('VIP Road', 'Ring Road') LIMIT 3)),

('Diwali Festival', 'festival', 'Diwali shopping rush in main markets', 'Pandri Market Area', 21.2514, 81.6284, NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 12 hours', 50000, 2.0,
  (SELECT ARRAY_AGG(id) FROM road_segments WHERE road_name IN ('Station Road', 'GE Road') LIMIT 3)),

('Road Construction - GE Road', 'construction', 'Metro construction work', 'GE Road - Fafadih', 21.2350, 81.6450, NOW() + INTERVAL '5 days', NOW() + INTERVAL '35 days', 0, 1.8,
  (SELECT ARRAY_AGG(id) FROM road_segments WHERE road_name = 'GE Road' LIMIT 2));

-- Insert sample road closure (for testing)
INSERT INTO road_closures (road_segment_id, closure_type, reason, start_time, end_time, status, estimated_delay_minutes, alternative_routes)
SELECT 
  id,
  'planned',
  'VIP movement - Chief Minister visit',
  NOW() + INTERVAL '1 day 10 hours',
  NOW() + INTERVAL '1 day 14 hours',
  'planned',
  20,
  ARRAY['Use Ring Road instead', 'Detour via Jail Road']
FROM road_segments
WHERE road_name = 'VIP Road' AND start_point = 'Sector 1'
LIMIT 1;
