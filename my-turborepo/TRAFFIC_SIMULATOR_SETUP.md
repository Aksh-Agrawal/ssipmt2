# 🚦 Traffic Simulator Database Setup

## Overview
This guide walks you through setting up the Traffic Simulator database tables in Supabase.

## Method: Manual Setup (Recommended)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `sbqmkbomrwlgcarmyqhw`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Schema Creation

Copy the entire contents of this file:
```
database/migrations/004_traffic_simulator_schema.sql
```

Paste into the SQL Editor and click **RUN**.

This will create 5 tables:
- ✅ `road_segments` - Road network structure
- ✅ `traffic_data` - Historical traffic patterns  
- ✅ `road_closures` - Closure management with simulation support
- ✅ `traffic_predictions` - AI-generated forecasts
- ✅ `special_events` - Events affecting traffic

### Step 3: Run Seed Data

Copy the entire contents of this file:
```
database/seed/004_traffic_simulator_seed.sql
```

Paste into a new SQL Editor query and click **RUN**.

This will insert:
- ✅ 12 major road segments (VIP Road, GE Road, Station Road, Ring Road, etc.)
- ✅ 150 historical traffic data points
- ✅ 3 special events (IPL match, Diwali, construction)
- ✅ 1 sample road closure (VIP movement)

### Step 4: Verify Tables

Run this query to verify everything is working:

```sql
-- Check all tables exist
SELECT 
  tablename 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' 
  AND tablename LIKE '%road%' OR tablename LIKE '%traffic%';

-- Count records in each table
SELECT 'road_segments' as table_name, COUNT(*) as count FROM road_segments
UNION ALL
SELECT 'traffic_data', COUNT(*) FROM traffic_data
UNION ALL
SELECT 'road_closures', COUNT(*) FROM road_closures
UNION ALL
SELECT 'traffic_predictions', COUNT(*) FROM traffic_predictions
UNION ALL
SELECT 'special_events', COUNT(*) FROM special_events;

-- View sample data
SELECT 
  id,
  name,
  road_name,
  start_point,
  end_point,
  length_km,
  lanes,
  road_type
FROM road_segments
ORDER BY road_name, start_point
LIMIT 10;
```

Expected results:
```
road_segments: 12 rows
traffic_data: 150 rows
road_closures: 1 row
traffic_predictions: 0 rows (will be populated by simulation)
special_events: 3 rows
```

## What's Next?

After database setup is complete:

1. **Build the UI**: Create `/admin/simulate` page for police/traffic management
2. **Create Simulation API**: `POST /api/admin/simulate-closure` endpoint
3. **Implement Algorithm**: Calculate traffic redistribution and predictions
4. **Add Visualization**: Heatmap showing affected areas and detours

## Troubleshooting

### Error: "relation already exists"

If you see errors like `ERROR: relation "road_segments" already exists`, the tables are already created. You can:

**Option A: Drop and recreate (⚠️ deletes all data)**
```sql
DROP TABLE IF EXISTS traffic_predictions CASCADE;
DROP TABLE IF EXISTS road_closures CASCADE;
DROP TABLE IF EXISTS traffic_data CASCADE;
DROP TABLE IF EXISTS special_events CASCADE;
DROP TABLE IF EXISTS road_segments CASCADE;
```

Then run the schema creation again.

**Option B: Skip schema, just run seed data**

If tables exist but are empty, skip Step 2 and just run Step 3 (seed data).

### Error: "permission denied"

Make sure you're using the **Service Role Key** in your API calls, not the anon key.

In Supabase SQL Editor, you should have full permissions by default.

### Check Row Level Security (RLS)

If you can't query the tables from your API:

```sql
-- Disable RLS for traffic simulator tables (admin-only anyway)
ALTER TABLE road_segments DISABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE road_closures DISABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_events DISABLE ROW LEVEL SECURITY;
```

## Sample Queries for Testing

### Find all road segments on VIP Road
```sql
SELECT * FROM road_segments 
WHERE road_name = 'VIP Road'
ORDER BY start_point;
```

### Get traffic data for peak hours
```sql
SELECT 
  rs.name,
  td.hour,
  td.vehicle_count,
  td.congestion_level,
  td.travel_time_minutes
FROM traffic_data td
JOIN road_segments rs ON td.road_segment_id = rs.id
WHERE td.hour BETWEEN 17 AND 19  -- Evening rush
ORDER BY td.vehicle_count DESC
LIMIT 10;
```

### Find upcoming special events
```sql
SELECT 
  name,
  event_type,
  start_time,
  expected_attendance,
  traffic_multiplier
FROM special_events
WHERE start_time > NOW()
ORDER BY start_time;
```

### Simulate a road closure (manual query)
```sql
-- This is what the simulation API will do automatically
INSERT INTO road_closures (
  road_segment_id,
  closure_type,
  reason,
  start_time,
  end_time,
  status,
  is_simulation
) VALUES (
  (SELECT id FROM road_segments WHERE road_name = 'GE Road' LIMIT 1),
  'simulation',
  'Test: What if GE Road is closed during evening rush?',
  NOW() + INTERVAL '1 day 17 hours',
  NOW() + INTERVAL '1 day 20 hours',
  'simulated',
  true
)
RETURNING *;
```

## Next Steps After Database Setup

✅ **Database Schema** - You are here  
⬜ **Create /admin/simulate Page** - Build UI for traffic simulation  
⬜ **Create Simulation API** - POST /api/admin/simulate-closure  
⬜ **Implement Algorithm** - Traffic redistribution logic  
⬜ **Add Heatmap Visualization** - Show affected areas  
⬜ **Test with Real Scenarios** - VIP movements, cricket matches, etc.

---

**Ready to continue?** Once you confirm the database is set up, we'll build the simulation UI!
