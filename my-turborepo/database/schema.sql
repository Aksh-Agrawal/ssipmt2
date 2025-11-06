-- ============================================
-- CIVIC VOICE ASSISTANT - DATABASE SCHEMA
-- PostgreSQL with PostGIS for Supabase
-- ============================================

-- Enable PostGIS for geospatial functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Define custom enum types for status and priority
CREATE TYPE report_status AS ENUM ('Submitted', 'In Progress', 'Resolved', 'Rejected');
CREATE TYPE report_priority AS ENUM ('Low', 'Medium', 'High');

-- ============================================
-- MAIN REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    -- Use UUID for a non-guessable, unique primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Timestamps for tracking and auditing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Core report data
    description TEXT NOT NULL,
    photo_url VARCHAR(2048) NOT NULL, -- URL to the image in Supabase Storage

    -- Use a GEOGRAPHY type for accurate location storage and queries
    location GEOGRAPHY(POINT, 4326) NOT NULL,

    -- AI-classified data
    status report_status NOT NULL DEFAULT 'Submitted',
    category VARCHAR(255),
    priority report_priority,

    -- Identifier for the citizen who submitted the report
    citizen_id UUID NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Speed up common queries from the admin dashboard
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_citizen_id ON reports(citizen_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Geospatial index for location-based queries
CREATE INDEX idx_reports_location ON reports USING GIST (location);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reports table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins can update reports
CREATE POLICY "Admins can update reports"
ON reports FOR UPDATE
TO authenticated
USING (true);

-- Policy: Service role can insert reports
CREATE POLICY "Service role can insert reports"
ON reports FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- EXAMPLE DATA - CIVIC REPORTS
-- ============================================

-- Example 1: High Priority Pothole in Downtown
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Large pothole on Main Street near City Hall. It''s about 2 feet wide and very deep. Multiple cars have been damaged.',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
    ST_GeogFromText('POINT(81.6296 21.2514)'), -- Raipur coordinates (lon, lat)
    'Submitted',
    'Roads',
    'High',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Example 2: Medium Priority Garbage Issue
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Garbage not collected for 3 days on Nehru Road. Pile is growing and attracting stray animals.',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
    ST_GeogFromText('POINT(81.6337 21.2379)'),
    'In Progress',
    'Waste Management',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440002'
);

-- Example 3: High Priority Broken Streetlight
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Street light completely broken on Station Road. Very dark at night, safety concern for pedestrians.',
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800',
    ST_GeogFromText('POINT(81.6390 21.2458)'),
    'Submitted',
    'Infrastructure',
    'High',
    '550e8400-e29b-41d4-a716-446655440003'
);

-- Example 4: Low Priority Park Maintenance
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'The benches in Marine Drive Park need painting. Also, some plants need trimming.',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
    ST_GeogFromText('POINT(81.6368 21.2501)'),
    'Submitted',
    'Parks & Recreation',
    'Low',
    '550e8400-e29b-41d4-a716-446655440004'
);

-- Example 5: Medium Priority Water Leakage
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Water pipe leaking near the intersection of VIP Road and Ring Road. Water is pooling on the street.',
    'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?w=800',
    ST_GeogFromText('POINT(81.6329 21.2414)'),
    'In Progress',
    'Water Supply',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440005'
);

-- Example 6: Resolved High Priority Issue
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Fallen tree blocking the road after last night''s storm on Jail Road.',
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
    ST_GeogFromText('POINT(81.6281 21.2354)'),
    'Resolved',
    'Emergency',
    'High',
    '550e8400-e29b-41d4-a716-446655440006'
);

-- Example 7: Low Priority Graffiti
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Graffiti on the wall near the bus stop on Fafadih Chowk.',
    'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=800',
    ST_GeogFromText('POINT(81.6551 21.2189)'),
    'Submitted',
    'Maintenance',
    'Low',
    '550e8400-e29b-41d4-a716-446655440007'
);

-- Example 8: High Priority Drainage Issue
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Blocked drainage causing waterlogging on Telibandha Road. Water level rising after rain.',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
    ST_GeogFromText('POINT(81.6425 21.2287)'),
    'Submitted',
    'Drainage',
    'High',
    '550e8400-e29b-41d4-a716-446655440008'
);

-- Example 9: Medium Priority Dog Menace
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Pack of stray dogs near Pandri market area. Residents, especially children, are scared to walk.',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ST_GeogFromText('POINT(81.6461 21.2365)'),
    'Submitted',
    'Public Safety',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440009'
);

-- Example 10: Low Priority Signage Issue
INSERT INTO reports (
    description, 
    photo_url, 
    location, 
    status, 
    category, 
    priority, 
    citizen_id
) VALUES (
    'Road signage faded and hard to read on G.E. Road near Mowa. Needs repainting.',
    'https://images.unsplash.com/photo-1517646287270-a5e4907d6b44?w=800',
    ST_GeogFromText('POINT(81.6101 21.2644)'),
    'Submitted',
    'Infrastructure',
    'Low',
    '550e8400-e29b-41d4-a716-446655440010'
);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all reports with their details
-- SELECT 
--     id,
--     description,
--     category,
--     priority,
--     status,
--     ST_AsText(location::geometry) as location_text,
--     created_at
-- FROM reports
-- ORDER BY 
--     CASE priority
--         WHEN 'High' THEN 1
--         WHEN 'Medium' THEN 2
--         WHEN 'Low' THEN 3
--     END,
--     created_at DESC;

-- Count reports by status
-- SELECT status, COUNT(*) as count
-- FROM reports
-- GROUP BY status
-- ORDER BY count DESC;

-- Count reports by priority
-- SELECT priority, COUNT(*) as count
-- FROM reports
-- GROUP BY priority
-- ORDER BY count DESC;

-- Find reports near a location (within 5km)
-- SELECT 
--     id,
--     description,
--     category,
--     ST_Distance(
--         location,
--         ST_GeogFromText('POINT(81.6296 21.2514)')
--     ) / 1000 as distance_km
-- FROM reports
-- WHERE ST_DWithin(
--     location,
--     ST_GeogFromText('POINT(81.6296 21.2514)'),
--     5000  -- 5km radius
-- )
-- ORDER BY distance_km;
