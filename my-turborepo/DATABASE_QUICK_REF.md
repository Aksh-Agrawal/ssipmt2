# 📊 Database Quick Reference

## File Locations

```
my-turborepo/
├── DATABASE_SETUP.md          # Complete setup guide
├── database/
│   └── schema.sql             # PostgreSQL schema + example data
└── scripts/
    └── seed-redis.ts          # Redis seeding script
```

## Quick Setup Commands

### 1. PostgreSQL (Supabase)

```sql
-- Run in Supabase SQL Editor
-- Copy content from: database/schema.sql
```

**Access:** https://supabase.com/ → Your Project → SQL Editor

### 2. Redis (Upstash)

```powershell
# Install dependency
npm install @upstash/redis --save-dev

# Run seed script
npx tsx scripts/seed-redis.ts
```

**Access:** https://upstash.com/ → Your Database → Data Browser

## Example Data Summary

### PostgreSQL - 10 Sample Reports

| Priority | Category | Status | Description |
|----------|----------|--------|-------------|
| High | Roads | Submitted | Large pothole on Main Street |
| Medium | Waste Management | In Progress | Garbage not collected for 3 days |
| High | Infrastructure | Submitted | Street light broken on Station Road |
| Low | Parks & Recreation | Submitted | Benches need painting in park |
| Medium | Water Supply | In Progress | Water pipe leaking at intersection |
| High | Emergency | Resolved | Fallen tree blocking road |
| Low | Maintenance | Submitted | Graffiti near bus stop |
| High | Drainage | Submitted | Blocked drainage causing waterlogging |
| Medium | Public Safety | Submitted | Stray dogs near market |
| Low | Infrastructure | Submitted | Road signage faded |

### Redis - 10 Knowledge Articles

| ID | Title | Tags |
|----|-------|------|
| kb-001 | Garbage Collection Schedule | garbage, waste, schedule |
| kb-002 | Water Supply Schedule | water, supply, timing |
| kb-003 | Road Construction Updates | roads, construction, traffic |
| kb-004 | Emergency Contact Numbers | emergency, contact, help |
| kb-005 | Property Tax Information | tax, property, payment |
| kb-006 | Streetlight Repair Process | streetlight, infrastructure |
| kb-007 | Parks Maintenance Schedule | parks, maintenance |
| kb-008 | Pothole Repair Timeline | pothole, roads, repair |
| kb-009 | Monsoon Preparedness | monsoon, weather, emergency |
| kb-010 | Birth/Death Certificates | certificate, documents |

## Environment Variables

```env
# PostgreSQL (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Redis (Upstash)
REDIS_URL=https://xxxxx.upstash.io
REDIS_TOKEN=AXlcA...
```

## Testing Database Connections

### Test PostgreSQL
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM reports;
SELECT status, COUNT(*) FROM reports GROUP BY status;
```

### Test Redis
```powershell
# Test agent endpoint
$body = @{ query = "When is garbage collected?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/agent/query" -Method POST -ContentType "application/json" -Body $body
```

## Database Schema Overview

### PostgreSQL Tables

**reports**
- `id` (UUID) - Primary key
- `description` (TEXT) - Report details
- `photo_url` (VARCHAR) - Photo URL
- `location` (GEOGRAPHY) - Geo coordinates
- `status` (ENUM) - Submitted/In Progress/Resolved/Rejected
- `category` (VARCHAR) - AI-assigned category
- `priority` (ENUM) - Low/Medium/High
- `citizen_id` (UUID) - Reporter ID
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Redis Key Structure

**Knowledge Articles:**
- `kb:article:{id}` → Full article JSON
- `kb:tag:{tag}` → Set of article IDs

**Cached Traffic:**
- `cache:traffic:{location}` → Traffic data (60s TTL)

## Common Queries

### PostgreSQL

```sql
-- High priority unresolved reports
SELECT * FROM reports 
WHERE priority = 'High' AND status != 'Resolved'
ORDER BY created_at DESC;

-- Reports within 5km of location
SELECT id, description, 
  ST_Distance(location, ST_GeogFromText('POINT(81.6296 21.2514)')) / 1000 as km
FROM reports
WHERE ST_DWithin(location, ST_GeogFromText('POINT(81.6296 21.2514)'), 5000)
ORDER BY km;
```

### Redis

```redis
# Get article by ID
GET kb:article:kb-001

# Find articles by tag
SMEMBERS kb:tag:garbage

# List all tags
KEYS kb:tag:*
```

## Next Steps

1. ✅ Read `DATABASE_SETUP.md` for detailed instructions
2. ✅ Run `database/schema.sql` in Supabase
3. ✅ Run `scripts/seed-redis.ts` to populate Redis
4. ✅ Configure environment variables in `apps/api/.env`
5. ✅ Test connections via API endpoints
6. 🚀 Start developing!

---

**Full Documentation:** See `DATABASE_SETUP.md` for complete setup guide.
