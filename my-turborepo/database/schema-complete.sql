-- ============================================
-- CIVIC VOICE PLATFORM - COMPLETE DATABASE SCHEMA
-- For Smart City Management (Raipur, India)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE report_status AS ENUM ('Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate');
CREATE TYPE report_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE report_category AS ENUM (
    'Roads', 'Waste Management', 'Infrastructure', 'Water Supply', 
    'Electricity', 'Parks & Recreation', 'Traffic', 'Emergency', 
    'Maintenance', 'Other'
);
CREATE TYPE user_role AS ENUM ('citizen', 'field_worker', 'admin', 'super_admin');
CREATE TYPE notification_type AS ENUM ('Push', 'SMS', 'WhatsApp', 'Email');
CREATE TYPE notification_status AS ENUM ('Pending', 'Sent', 'Failed', 'Read');
CREATE TYPE event_type AS ENUM ('Construction', 'Event', 'Maintenance', 'Emergency');
CREATE TYPE language_code AS ENUM ('en', 'hi', 'cg');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    preferred_language language_code DEFAULT 'hi',
    
    -- Notification preferences
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT true,
    
    -- Profile
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- REPORTS TABLE (Enhanced)
-- ============================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(20) UNIQUE NOT NULL, -- User-facing short ID (e.g., RR-2025-001234)
    
    -- User submitted data
    description TEXT NOT NULL,
    category report_category NOT NULL,
    priority report_priority NOT NULL DEFAULT 'Medium',
    status report_status NOT NULL DEFAULT 'Submitted',
    
    -- Voice/text metadata
    input_method VARCHAR(20) CHECK (input_method IN ('voice', 'text')),
    input_language language_code DEFAULT 'hi',
    voice_transcription TEXT, -- Original transcription
    
    -- Location data
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    area VARCHAR(255), -- e.g., "Downtown", "North Zone"
    landmark VARCHAR(255),
    
    -- Media attachments
    photos TEXT[], -- Array of photo URLs with geo-tags
    video_url TEXT,
    
    -- AI Processing
    ai_category_confidence DECIMAL(3,2), -- 0.00 to 1.00
    ai_priority_reason TEXT,
    ai_suggested_department VARCHAR(255),
    keywords TEXT[], -- Extracted keywords
    
    -- Assignment & tracking
    citizen_id UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id), -- Field worker
    assigned_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- SLA tracking
    sla_deadline TIMESTAMPTZ,
    is_overdue BOOLEAN DEFAULT false,
    response_time_hours DECIMAL(8,2), -- Time from submission to first response
    resolution_time_hours DECIMAL(8,2), -- Time from submission to resolution
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REPORT COMMENTS TABLE
-- ============================================

CREATE TABLE report_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT false, -- From admin/field worker
    is_internal BOOLEAN DEFAULT false, -- Only visible to admins
    
    -- Attachments
    photo_urls TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REPORT TIMELINE TABLE
-- ============================================

CREATE TABLE report_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- e.g., "Status Changed", "Assigned", "Comment Added"
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    performed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRAFFIC DATA TABLE
-- ============================================

CREATE TABLE traffic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Location
    road_segment_id VARCHAR(100) NOT NULL,
    road_name VARCHAR(255) NOT NULL,
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326) NOT NULL,
    
    -- Traffic metrics
    congestion_level VARCHAR(20) CHECK (congestion_level IN ('Free Flow', 'Light', 'Moderate', 'Heavy', 'Blocked')),
    average_speed DECIMAL(5,2), -- km/h
    vehicle_count INTEGER,
    estimated_delay_minutes INTEGER,
    
    -- Source
    data_source VARCHAR(50), -- 'sensor', 'camera', 'manual', 'ai_prediction'
    
    -- Contextual data
    is_blocked BOOLEAN DEFAULT false,
    block_reason VARCHAR(255),
    weather VARCHAR(50),
    
    -- Temporal
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROAD CLOSURES / EVENTS TABLE
-- ============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    
    -- Location
    road_segment_id VARCHAR(100),
    road_name VARCHAR(255) NOT NULL,
    affected_area TEXT,
    location GEOGRAPHY(POINT, 4326),
    
    -- Impact
    lanes_affected INTEGER,
    total_lanes INTEGER,
    estimated_traffic_impact VARCHAR(20), -- 'Low', 'Medium', 'High', 'Severe'
    detour_route TEXT,
    
    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(100), -- e.g., "Every Monday 9AM-5PM"
    
    -- Approval workflow
    status VARCHAR(20) CHECK (status IN ('Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled')),
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Notifications
    notify_citizens BOOLEAN DEFAULT true,
    notification_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRAFFIC SIMULATIONS TABLE
-- ============================================

CREATE TABLE traffic_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Simulation parameters
    road_segment_id VARCHAR(100) NOT NULL,
    closure_start TIMESTAMPTZ NOT NULL,
    closure_end TIMESTAMPTZ NOT NULL,
    event_type event_type,
    special_occasion VARCHAR(255), -- e.g., "Cricket Match", "Festival"
    traffic_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Results
    predicted_congestion JSONB, -- {road_id: congestion_level}
    affected_areas TEXT[],
    suggested_detours TEXT[],
    estimated_delay_minutes INTEGER,
    alternative_routes JSONB,
    
    -- Metadata
    run_by UUID NOT NULL REFERENCES users(id),
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    simulation_duration_ms INTEGER
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'Pending',
    
    -- Context
    related_report_id UUID REFERENCES reports(id),
    related_event_id UUID REFERENCES events(id),
    action_url TEXT, -- Deep link or URL
    
    -- Delivery
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    
    -- Report metrics
    total_reports INTEGER DEFAULT 0,
    submitted_reports INTEGER DEFAULT 0,
    resolved_reports INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(8,2),
    avg_resolution_time_hours DECIMAL(8,2),
    sla_compliance_rate DECIMAL(5,2), -- Percentage
    
    -- Category breakdown (JSONB for flexibility)
    reports_by_category JSONB,
    reports_by_priority JSONB,
    reports_by_area JSONB,
    
    -- Traffic metrics
    traffic_incidents INTEGER DEFAULT 0,
    avg_congestion_level DECIMAL(3,2),
    blocked_roads_count INTEGER DEFAULT 0,
    
    -- User metrics
    active_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(date)
);

-- ============================================
-- CHATBOT CONVERSATIONS TABLE
-- ============================================

CREATE TABLE chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    
    -- Message
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    input_language language_code DEFAULT 'hi',
    
    -- Intent classification
    intent VARCHAR(100), -- 'traffic_query', 'report_status', 'general_info', etc.
    entities JSONB, -- Extracted entities (location, time, category, etc.)
    confidence DECIMAL(3,2),
    
    -- Context
    related_report_id UUID REFERENCES reports(id),
    query_resolved BOOLEAN DEFAULT false,
    
    -- Metadata
    response_time_ms INTEGER,
    model_used VARCHAR(50), -- 'groq-llama', etc.
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- KNOWLEDGE BASE TABLE
-- ============================================

CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Multi-language support
    language language_code DEFAULT 'en',
    translations JSONB, -- {hi: {title, content}, cg: {title, content}}
    
    -- Classification
    category VARCHAR(100),
    tags TEXT[],
    keywords TEXT[],
    
    -- SEO & Search
    slug VARCHAR(255) UNIQUE,
    search_vector tsvector, -- For full-text search
    
    -- Metadata
    author_id UUID NOT NULL REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    value_type VARCHAR(20) CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who & What
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- e.g., 'UPDATE_REPORT', 'DELETE_USER'
    entity_type VARCHAR(50) NOT NULL, -- 'report', 'user', 'event', etc.
    entity_id UUID,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Reports
CREATE INDEX idx_reports_citizen_id ON reports(citizen_id);
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_area ON reports(area);
CREATE INDEX idx_reports_unique_id ON reports(unique_id);
CREATE INDEX idx_reports_location ON reports USING GIST (location);
CREATE INDEX idx_reports_overdue ON reports(is_overdue) WHERE is_overdue = true;

-- Report Comments
CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX idx_report_comments_user_id ON report_comments(user_id);

-- Report Timeline
CREATE INDEX idx_report_timeline_report_id ON report_timeline(report_id);
CREATE INDEX idx_report_timeline_created_at ON report_timeline(created_at DESC);

-- Traffic Data
CREATE INDEX idx_traffic_data_road_segment ON traffic_data(road_segment_id);
CREATE INDEX idx_traffic_data_timestamp ON traffic_data(timestamp DESC);
CREATE INDEX idx_traffic_data_location ON traffic_data USING GIST (start_location);
CREATE INDEX idx_traffic_data_congestion ON traffic_data(congestion_level);

-- Events
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_road_segment ON events(road_segment_id);
CREATE INDEX idx_events_location ON events USING GIST (location);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Chatbot
CREATE INDEX idx_chatbot_session_id ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_created_at ON chatbot_conversations(created_at DESC);

-- Knowledge Base
CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_language ON knowledge_articles(language);
CREATE INDEX idx_knowledge_articles_published ON knowledge_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_knowledge_articles_search ON knowledge_articles USING GIN (search_vector);

-- Analytics
CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON reports FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON report_comments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Generate unique report ID
CREATE OR REPLACE FUNCTION generate_report_unique_id()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_unique_id TEXT;
BEGIN
    year_part := TO_CHAR(NEW.created_at, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM reports
    WHERE unique_id LIKE 'RR-' || year_part || '-%';
    
    new_unique_id := 'RR-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    NEW.unique_id := new_unique_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_report_id BEFORE INSERT ON reports FOR EACH ROW EXECUTE PROCEDURE generate_report_unique_id();

-- Update comment count on reports
CREATE OR REPLACE FUNCTION update_report_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reports SET comment_count = (
        SELECT COUNT(*) FROM report_comments WHERE report_id = NEW.report_id
    ) WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count AFTER INSERT ON report_comments FOR EACH ROW EXECUTE PROCEDURE update_report_comment_count();

-- Update knowledge article search vector
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_vector BEFORE INSERT OR UPDATE ON knowledge_articles FOR EACH ROW EXECUTE PROCEDURE update_knowledge_search_vector();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Reports: Citizens see their own, admins see all
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (citizen_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (citizen_id = auth.uid());
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'field_worker'));

-- Comments: Users see public comments, admins see all
CREATE POLICY "Users can view comments" ON report_comments FOR SELECT USING (NOT is_internal OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY "Users can create comments" ON report_comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: Users see only their own
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

-- Chatbot: Users see their own conversations
CREATE POLICY "Users can view their conversations" ON chatbot_conversations FOR SELECT USING (user_id = auth.uid() OR session_id = current_setting('app.session_id', true));

-- ============================================
-- INITIAL SYSTEM SETTINGS
-- ============================================

INSERT INTO system_settings (key, value, value_type, description) VALUES
('sla_critical_hours', '2', 'number', 'SLA response time for critical priority (hours)'),
('sla_high_hours', '6', 'number', 'SLA response time for high priority (hours)'),
('sla_medium_hours', '24', 'number', 'SLA response time for medium priority (hours)'),
('sla_low_hours', '72', 'number', 'SLA response time for low priority (hours)'),
('maintenance_mode', 'false', 'boolean', 'System maintenance mode enabled'),
('default_language', 'hi', 'string', 'Default system language'),
('max_photos_per_report', '3', 'number', 'Maximum photos allowed per report'),
('ai_categorization_enabled', 'true', 'boolean', 'Enable AI auto-categorization'),
('auto_assignment_enabled', 'true', 'boolean', 'Enable automatic issue assignment'),
('notification_sms_enabled', 'true', 'boolean', 'Enable SMS notifications globally'),
('notification_whatsapp_enabled', 'true', 'boolean', 'Enable WhatsApp notifications globally')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active reports summary
CREATE OR REPLACE VIEW active_reports_summary AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'Submitted') as submitted_count,
    COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'Assigned') as assigned_count,
    COUNT(*) FILTER (WHERE priority = 'Critical') as critical_count,
    COUNT(*) FILTER (WHERE is_overdue = true) as overdue_count,
    AVG(response_time_hours) FILTER (WHERE response_time_hours IS NOT NULL) as avg_response_time,
    COUNT(*) as total_active
FROM reports
WHERE status NOT IN ('Resolved', 'Rejected');

-- Top problem areas
CREATE OR REPLACE VIEW top_problem_areas AS
SELECT 
    area,
    category,
    COUNT(*) as report_count,
    AVG(resolution_time_hours) as avg_resolution_time,
    COUNT(*) FILTER (WHERE status = 'Resolved') as resolved_count
FROM reports
WHERE area IS NOT NULL
GROUP BY area, category
ORDER BY report_count DESC;

-- Traffic congestion hotspots
CREATE OR REPLACE VIEW traffic_hotspots AS
SELECT 
    road_segment_id,
    road_name,
    AVG(CASE 
        WHEN congestion_level = 'Blocked' THEN 5
        WHEN congestion_level = 'Heavy' THEN 4
        WHEN congestion_level = 'Moderate' THEN 3
        WHEN congestion_level = 'Light' THEN 2
        ELSE 1
    END) as avg_congestion_score,
    COUNT(*) as data_points
FROM traffic_data
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY road_segment_id, road_name
ORDER BY avg_congestion_score DESC;

-- ============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Search reports by location radius
CREATE OR REPLACE FUNCTION search_reports_near(
    lat DECIMAL,
    lon DECIMAL,
    radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
    report_id UUID,
    description TEXT,
    category report_category,
    priority report_priority,
    distance_meters DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.description,
        r.category,
        r.priority,
        ST_Distance(r.location, ST_GeogFromText('POINT(' || lon || ' ' || lat || ')'))::DECIMAL as distance
    FROM reports r
    WHERE ST_DWithin(
        r.location,
        ST_GeogFromText('POINT(' || lon || ' ' || lat || ')'),
        radius_meters
    )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Get report statistics
CREATE OR REPLACE FUNCTION get_report_statistics(days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_reports', COUNT(*),
        'resolved_reports', COUNT(*) FILTER (WHERE status = 'Resolved'),
        'avg_response_time_hours', AVG(response_time_hours),
        'avg_resolution_time_hours', AVG(resolution_time_hours),
        'sla_compliance_rate', 
            (COUNT(*) FILTER (WHERE is_overdue = false) * 100.0 / NULLIF(COUNT(*), 0)),
        'by_category', json_object_agg(category, category_count)
    )
    INTO result
    FROM reports
    LEFT JOIN (
        SELECT category, COUNT(*) as category_count
        FROM reports
        WHERE created_at >= NOW() - (days || ' days')::INTERVAL
        GROUP BY category
    ) cat_counts ON true
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE! 🎉
-- ============================================
