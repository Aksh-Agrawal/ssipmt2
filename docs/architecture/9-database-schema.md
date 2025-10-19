# 9. Database Schema

This section translates our conceptual data models into physical database schemas for both the relational "Complaints DB" (PostgreSQL) and the "Live DB" (Redis).

## 9.1. Complaints DB (PostgreSQL)

This schema will be implemented in the Supabase PostgreSQL database. It is designed to be robust, scalable, and to support geospatial queries. We will use the `postgis` extension for location data.

```sql
-- Enable PostGIS for geospatial functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Define custom enum types for status and priority to ensure data integrity
CREATE TYPE report_status AS ENUM ('Submitted', 'In Progress', 'Resolved', 'Rejected');
CREATE TYPE report_priority AS ENUM ('Low', 'Medium', 'High');

-- The main table for storing all civic issue reports
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

-- Create indexes to speed up common queries from the admin dashboard
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_citizen_id ON reports(citizen_id);

-- Create a geospatial index for location-based queries
CREATE INDEX idx_reports_location ON reports USING GIST (location);

-- Function to automatically update the 'updated_at' timestamp on any change
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

```

## 9.2. Live DB (Redis)

For Redis, the "schema" is defined by the key structure and the data types we use. We will store JSON objects for our `KnowledgeArticle` entities and use Redis Sets to index them by tags for fast lookups.

**Key Structure for Knowledge Articles:**

*   **Article Data:** A HASH or JSON object to store the article itself.
    *   `Key`: `kb:article:<article_id>`
    *   `Value`: `{ "title": "...", "content": "...", "tags": ["garbage", "schedule"] }`
*   **Tag Index:** A Redis SET for each tag, containing the IDs of articles with that tag.
    *   `Key`: `kb:tag:garbage`
    *   `Value (Set)`: `[<article_id_1>, <article_id_2>]`
    *   `Key`: `kb:tag:schedule`
    *   `Value (Set)`: `[<article_id_1>, <article_id_3>]`

*Query Pattern:* To find articles about "garbage schedule", we would compute the intersection of the `kb:tag:garbage` and `kb:tag:schedule` sets.

**Key Structure for Caching Traffic Data:**

*   **Cached Data:** A simple key-value pair with a Time-To-Live (TTL).
    *   `Key`: `cache:traffic:<location_hash>` (e.g., `cache:traffic:40.7128,-74.0060`)
    *   `Value`: The JSON response from the Google Maps API.
    *   `TTL`: 60 seconds (to ensure data remains fresh).
