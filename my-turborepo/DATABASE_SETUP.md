# 🗄️ Database Setup & Example Data

This guide helps you set up the databases for the AI-Powered Civic Voice Assistant project.

## Overview

The project uses **two separate databases**:

1. **Complaints DB (PostgreSQL)** - Stores citizen reports (restricted access)
2. **Live DB (Redis)** - Stores public civic information (fast-access cache)

---

## 1. Complaints Database (PostgreSQL via Supabase)

### Prerequisites
- Supabase account: https://supabase.com/
- Project created in Supabase

### Step 1: Access SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Schema Creation Script

Copy and paste this entire script into the SQL Editor and click **RUN**:

```sql
-- ============================================
-- CIVIC VOICE ASSISTANT - DATABASE SCHEMA
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
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
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
```

### Step 3: Insert Example Data

After the schema is created, run this script to insert sample reports:

```sql
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
    'https://example.com/photos/pothole-main-street.jpg',
    ST_GeogFromText('POINT(21.2514 81.6296)'), -- Raipur coordinates
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
    'Garbage not collected for 3 days on Nehru Road. Pile is growing and attracting animals.',
    'https://example.com/photos/garbage-nehru-road.jpg',
    ST_GeogFromText('POINT(21.2379 81.6337)'),
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
    'https://example.com/photos/streetlight-station-road.jpg',
    ST_GeogFromText('POINT(21.2458 81.6390)'),
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
    'https://example.com/photos/park-maintenance.jpg',
    ST_GeogFromText('POINT(21.2501 81.6368)'),
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
    'https://example.com/photos/water-leak-vip-road.jpg',
    ST_GeogFromText('POINT(21.2414 81.6329)'),
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
    'https://example.com/photos/fallen-tree.jpg',
    ST_GeogFromText('POINT(21.2354 81.6281)'),
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
    'https://example.com/photos/graffiti-fafadih.jpg',
    ST_GeogFromText('POINT(21.2189 81.6551)'),
    'Submitted',
    'Maintenance',
    'Low',
    '550e8400-e29b-41d4-a716-446655440007'
);
```

### Step 4: Verify Data

Run this query to check your data:

```sql
-- View all reports with their details
SELECT 
    id,
    description,
    category,
    priority,
    status,
    ST_AsText(location::geometry) as location_text,
    created_at
FROM reports
ORDER BY 
    CASE priority
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN 3
    END,
    created_at DESC;
```

---

## 2. Live Database (Redis via Upstash)

### Prerequisites
- Upstash account: https://upstash.com/
- Redis database created

### Step 1: Get Your Credentials

1. Go to your Upstash dashboard
2. Click on your Redis database
3. Copy the **REST URL** and **REST Token**
4. Add them to your `.env` file:

```env
REDIS_URL=https://your-redis-id.upstash.io
REDIS_TOKEN=AXlcA...your-token...
```

### Step 2: Seed Knowledge Articles

You can use the admin dashboard to add knowledge articles, or use this script to seed via API:

Create a file `my-turborepo/scripts/seed-redis.ts`:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

async function seedKnowledgeBase() {
  console.log('🌱 Seeding Redis with knowledge articles...');

  // Article 1: Garbage Collection Schedule
  const article1 = {
    id: 'kb-001',
    title: 'Garbage Collection Schedule',
    content: 'Garbage collection happens every Monday, Wednesday, and Friday between 6 AM and 10 AM. Please place your bins outside before 6 AM. If your collection was missed, please report it through the app.',
    tags: ['garbage', 'waste', 'schedule', 'collection'],
    authorId: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`kb:article:${article1.id}`, JSON.stringify(article1));
  for (const tag of article1.tags) {
    await redis.sadd(`kb:tag:${tag}`, article1.id);
  }
  console.log('✅ Added: Garbage Collection Schedule');

  // Article 2: Water Supply Timing
  const article2 = {
    id: 'kb-002',
    title: 'Daily Water Supply Schedule',
    content: 'Municipal water supply is available from 5 AM to 9 AM and 5 PM to 9 PM daily. During summer months, there may be additional supply between 12 PM and 2 PM. Please store adequate water for your daily needs.',
    tags: ['water', 'supply', 'schedule', 'timing'],
    authorId: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`kb:article:${article2.id}`, JSON.stringify(article2));
  for (const tag of article2.tags) {
    await redis.sadd(`kb:tag:${tag}`, article2.id);
  }
  console.log('✅ Added: Water Supply Schedule');

  // Article 3: Road Construction Updates
  const article3 = {
    id: 'kb-003',
    title: 'Ongoing Road Construction - VIP Road',
    content: 'VIP Road is under construction from Ring Road to Pandri. Expected completion: December 2025. Alternative routes: Use G.E. Road or Vidhan Sabha Road. Construction hours: 7 AM to 7 PM.',
    tags: ['roads', 'construction', 'traffic', 'vip road'],
    authorId: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`kb:article:${article3.id}`, JSON.stringify(article3));
  for (const tag of article3.tags) {
    await redis.sadd(`kb:tag:${tag}`, article3.id);
  }
  console.log('✅ Added: Road Construction Updates');

  // Article 4: Emergency Contact Numbers
  const article4 = {
    id: 'kb-004',
    title: 'Emergency Contact Numbers',
    content: 'Municipal Emergency: 100, Fire Service: 101, Ambulance: 102, Water Supply Issues: 1916, Electricity: 1912, Road Maintenance: 1800-xxx-xxxx. Available 24/7.',
    tags: ['emergency', 'contact', 'help', 'phone'],
    authorId: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`kb:article:${article4.id}`, JSON.stringify(article4));
  for (const tag of article4.tags) {
    await redis.sadd(`kb:tag:${tag}`, article4.id);
  }
  console.log('✅ Added: Emergency Contacts');

  // Article 5: Property Tax Information
  const article5 = {
    id: 'kb-005',
    title: 'Property Tax Payment Information',
    content: 'Property tax can be paid online at rmc.gov.in/tax or at any municipal office. Payment deadline: March 31st annually. 5% discount for early payment before December 31st. Penalties apply after deadline.',
    tags: ['tax', 'property', 'payment', 'finance'],
    authorId: 'admin-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`kb:article:${article5.id}`, JSON.stringify(article5));
  for (const tag of article5.tags) {
    await redis.sadd(`kb:tag:${tag}`, article5.id);
  }
  console.log('✅ Added: Property Tax Info');

  console.log('✨ Redis seeding complete!');
}

seedKnowledgeBase().catch(console.error);
```

### Step 3: Run the Seed Script

```powershell
# Install Upstash Redis client
cd my-turborepo
npm install @upstash/redis --save-dev

# Run the seed script
npx tsx scripts/seed-redis.ts
```

---

## 3. Verify Everything Works

### Test PostgreSQL Connection

Run this query in Supabase SQL Editor:

```sql
-- Count reports by status
SELECT status, COUNT(*) as count
FROM reports
GROUP BY status
ORDER BY count DESC;

-- Count reports by priority
SELECT priority, COUNT(*) as count
FROM reports
GROUP BY priority
ORDER BY count DESC;

-- Find reports near a location (within 5km)
SELECT 
    id,
    description,
    category,
    ST_Distance(
        location,
        ST_GeogFromText('POINT(21.2514 81.6296)')
    ) / 1000 as distance_km
FROM reports
WHERE ST_DWithin(
    location,
    ST_GeogFromText('POINT(21.2514 81.6296)'),
    5000  -- 5km radius
)
ORDER BY distance_km;
```

### Test Redis Connection

From your API server:

```bash
cd apps/api
npm run dev
```

Then test the agent endpoint:

```powershell
# Test knowledge retrieval
$body = @{ query = "When is garbage collected?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/agent/query" -Method POST -ContentType "application/json" -Body $body
```

---

## 4. Useful Database Queries

### PostgreSQL Queries

```sql
-- Get all high priority submitted reports
SELECT * FROM reports 
WHERE priority = 'High' AND status = 'Submitted'
ORDER BY created_at DESC;

-- Update a report status
UPDATE reports 
SET status = 'In Progress'
WHERE id = 'your-report-id-here';

-- Find reports by category
SELECT category, COUNT(*) as count
FROM reports
GROUP BY category
ORDER BY count DESC;

-- Find reports created today
SELECT * FROM reports
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- Get report statistics
SELECT 
    COUNT(*) as total_reports,
    COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as submitted,
    COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
    COUNT(CASE WHEN priority = 'High' THEN 1 END) as high_priority
FROM reports;
```

### Redis Commands (via Upstash Console)

```redis
# Get all article IDs with 'garbage' tag
SMEMBERS kb:tag:garbage

# Get article content
GET kb:article:kb-001

# Get all tags starting with 'kb:tag:'
KEYS kb:tag:*

# Check cached traffic data
KEYS cache:traffic:*

# Get specific cached data
GET cache:traffic:21.2514,81.6296
```

---

## 5. Environment Variables Summary

Make sure your `apps/api/.env` file contains:

```env
# Supabase (PostgreSQL)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-key...

# Upstash Redis
REDIS_URL=https://your-redis-id.upstash.io
REDIS_TOKEN=AXlcA...your-token...

# Google APIs (for agent features)
GOOGLE_CLOUD_API_KEY=AIzaSy...your-key...
GOOGLE_MAPS_API_KEY=AIzaSy...your-key...
```

---

## 6. Troubleshooting

### PostgreSQL Issues

**Error: "extension postgis does not exist"**
- Solution: Run `CREATE EXTENSION IF NOT EXISTS postgis;` in SQL Editor

**Error: "type report_status already exists"**
- Solution: Drop existing types first: `DROP TYPE IF EXISTS report_status CASCADE;`

**Can't insert data**
- Check RLS policies are configured correctly
- Use service role key for API insertions

### Redis Issues

**Connection timeout**
- Verify REDIS_URL and REDIS_TOKEN are correct
- Check you're using REST API credentials (not standard Redis URL)

**Keys not found**
- Redis has no data persistence in free tier - reseed if needed
- Check key naming convention matches your code

---

## 7. Next Steps

1. ✅ Run schema creation script in Supabase
2. ✅ Insert example data
3. ✅ Configure environment variables
4. ✅ Seed Redis with knowledge articles
5. ✅ Test both databases via API
6. 🚀 Start developing!

---

**Need Help?** Check the main `SETUP.md` or `QUICKSTART.md` files for more information.
