-- Traffic Simulator Database Schema
-- For Raipur Smart City Platform

-- Table: road_segments
-- Stores all major road segments in Raipur for traffic simulation
CREATE TABLE IF NOT EXISTS road_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "VIP Road - Sector 1 to Sector 2"
  road_name TEXT NOT NULL, -- e.g., "VIP Road", "GE Road"
  start_point TEXT NOT NULL, -- Starting landmark/location
  end_point TEXT NOT NULL, -- Ending landmark/location
  start_lat DECIMAL(10, 8) NOT NULL,
  start_lng DECIMAL(11, 8) NOT NULL,
  end_lat DECIMAL(10, 8) NOT NULL,
  end_lng DECIMAL(11, 8) NOT NULL,
  length_km DECIMAL(5, 2) NOT NULL, -- Length in kilometers
  lanes INTEGER NOT NULL DEFAULT 2,
  road_type TEXT NOT NULL DEFAULT 'major', -- 'major', 'arterial', 'collector', 'local'
  speed_limit INTEGER NOT NULL DEFAULT 40, -- km/h
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: traffic_data
-- Historical and simulated traffic data
CREATE TABLE IF NOT EXISTS traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_segment_id UUID NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  vehicle_count INTEGER NOT NULL DEFAULT 0,
  avg_speed DECIMAL(5, 2) NOT NULL, -- km/h
  congestion_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'moderate', 'high', 'severe'
  travel_time_minutes DECIMAL(5, 2) NOT NULL, -- Actual travel time
  is_special_event BOOLEAN DEFAULT false,
  event_type TEXT, -- 'cricket_match', 'festival', 'vip_movement', 'construction', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: road_closures
-- Planned and simulated road closures
CREATE TABLE IF NOT EXISTS road_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_segment_id UUID NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
  closure_type TEXT NOT NULL, -- 'planned', 'emergency', 'simulation'
  reason TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
  affected_area_radius_km DECIMAL(5, 2) DEFAULT 2.0,
  estimated_delay_minutes INTEGER,
  alternative_routes TEXT[], -- Array of suggested detour descriptions
  created_by UUID, -- Admin user ID
  approved_by UUID, -- Approving admin ID
  is_simulation BOOLEAN DEFAULT false, -- True for "what-if" simulations
  simulation_results JSONB, -- Store simulation output
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: traffic_predictions
-- AI-generated traffic predictions based on historical data
CREATE TABLE IF NOT EXISTS traffic_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_segment_id UUID NOT NULL REFERENCES road_segments(id) ON DELETE CASCADE,
  closure_id UUID REFERENCES road_closures(id) ON DELETE CASCADE,
  prediction_time TIMESTAMPTZ NOT NULL,
  predicted_vehicle_count INTEGER,
  predicted_congestion_level TEXT, -- 'low', 'moderate', 'high', 'severe'
  predicted_delay_minutes INTEGER,
  affected_segments UUID[], -- Array of affected road segment IDs
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  prediction_factors JSONB, -- Store factors affecting prediction
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: special_events
-- Track special events that affect traffic
CREATE TABLE IF NOT EXISTS special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'sports', 'festival', 'political', 'construction'
  description TEXT,
  location TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  expected_attendance INTEGER,
  traffic_multiplier DECIMAL(3, 2) DEFAULT 1.5, -- Traffic increase factor
  affected_road_segments UUID[], -- Array of road segment IDs
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'ongoing', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_data_segment ON traffic_data(road_segment_id);
CREATE INDEX IF NOT EXISTS idx_traffic_data_date ON traffic_data("date", hour);
CREATE INDEX IF NOT EXISTS idx_road_closures_segment ON road_closures(road_segment_id);
CREATE INDEX IF NOT EXISTS idx_road_closures_time ON road_closures(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_road_closures_simulation ON road_closures(is_simulation);
CREATE INDEX IF NOT EXISTS idx_traffic_predictions_segment ON traffic_predictions(road_segment_id);
CREATE INDEX IF NOT EXISTS idx_special_events_time ON special_events(start_time, end_time);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_road_segments_updated_at BEFORE UPDATE ON road_segments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_road_closures_updated_at BEFORE UPDATE ON road_closures
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_events_updated_at BEFORE UPDATE ON special_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
