# Backend API Documentation

## Base URLs
- **User Portal**: http://localhost:3000/api
- **Admin Portal**: http://localhost:3002/api

## Authentication
All API endpoints require Clerk authentication. Include the Clerk session token in requests.

---

## Reports API

### GET /api/reports
Get list of reports with filters

**Query Parameters:**
- `status` (optional): Filter by status (Submitted, Under Review, In Progress, Resolved, Closed)
- `category` (optional): Filter by category (Potholes, Streetlights, Garbage, Water Supply, Traffic Signal, Other)
- `priority` (optional): Filter by priority (Critical, High, Medium, Low)
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "unique_id": "RPT-2024-00001",
      "description": "Report description",
      "category": "Potholes",
      "priority": "High",
      "status": "Submitted",
      "location": "POINT(...)",
      "address": "Street address",
      "area": "Area name",
      "photos": ["url1", "url2"],
      "created_at": "2024-01-01T00:00:00Z",
      "sla_deadline": "2024-01-01T06:00:00Z"
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

### POST /api/reports
Create a new report (voice or text input)

**Request Body:**
```json
{
  "description": "Pothole on main road",
  "category": "Potholes",
  "priority": "High",
  "location": { "lat": 21.2514, "lng": 81.6296 },
  "address": "Main Road, Raipur",
  "area": "Civil Lines",
  "landmark": "Near City Hospital",
  "photos": ["https://..."],
  "input_method": "voice",
  "input_language": "hi",
  "voice_transcription": "मुख्य सड़क पर गड्ढा है",
  "userEmail": "user@example.com",
  "userName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* report object */ },
  "message": "Report created successfully"
}
```

### GET /api/reports/:id
Get single report with details (comments, timeline)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "unique_id": "RPT-2024-00001",
    /* ...report fields... */
    "citizen": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "comments": [
      {
        "id": "uuid",
        "comment_text": "Comment text",
        "created_at": "2024-01-01T00:00:00Z",
        "commenter": { "name": "Admin", "role": "admin" }
      }
    ],
    "timeline": [
      {
        "id": "uuid",
        "action": "Report Created",
        "description": "Report submitted by citizen",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### PATCH /api/reports/:id
Update report (admin only)

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "Critical",
  "assigned_to": "admin-user-id",
  "admin_notes": "Working on this issue",
  "resolution_notes": "Issue resolved"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated report */ },
  "message": "Report updated successfully"
}
```

### POST /api/reports/:id/comments
Add comment to report

**Request Body:**
```json
{
  "comment_text": "This has been escalated to the field team"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* comment object */ },
  "message": "Comment added successfully"
}
```

### GET /api/reports/:id/comments
Get all comments for a report

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "comment_text": "Comment text",
      "created_at": "2024-01-01T00:00:00Z",
      "commenter": {
        "id": "uuid",
        "name": "User Name",
        "role": "citizen"
      }
    }
  ]
}
```

---

## Dashboard Stats API

### GET /api/stats/dashboard
Get dashboard statistics (role-based: citizen sees own reports, admin sees all)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 150,
    "statusCounts": {
      "Submitted": 20,
      "Under Review": 15,
      "In Progress": 30,
      "Resolved": 70,
      "Closed": 15
    },
    "categoryCounts": {
      "Potholes": 40,
      "Streetlights": 30,
      "Garbage": 25,
      "Water Supply": 20,
      "Traffic Signal": 15,
      "Other": 20
    },
    "priorityCounts": {
      "Critical": 10,
      "High": 30,
      "Medium": 80,
      "Low": 30
    },
    "recentReports": [/* 10 most recent reports */],
    
    // Admin-only fields:
    "totalUsers": 500,
    "pendingReports": 35,
    "overdueReports": 5,
    "resolutionRate": 85.3
  }
}
```

---

## Traffic API

### GET /api/traffic
Get traffic data with filters

**Query Parameters:**
- `severity` (optional): Filter by severity (Critical, High, Medium, Low)
- `status` (optional): Filter by status (active, resolved) - default: active
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "location": "POINT(...)",
      "road_name": "Ring Road",
      "severity": "High",
      "congestion_level": 85,
      "average_speed": 15,
      "estimated_delay_minutes": 25,
      "incident_type": "Road Closure",
      "description": "Construction work",
      "affected_routes": ["Route 1", "Route 2"],
      "alternative_routes": ["Route 3", "Route 4"],
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/traffic
Create traffic data (admin only)

**Request Body:**
```json
{
  "location": { "lat": 21.2514, "lng": 81.6296 },
  "road_name": "Ring Road",
  "severity": "High",
  "congestion_level": 85,
  "average_speed": 15,
  "estimated_delay_minutes": 25,
  "incident_type": "Accident",
  "description": "Two-vehicle collision",
  "affected_routes": ["Route 1"],
  "alternative_routes": ["Route 2"]
}
```

---

## Events API

### GET /api/events
Get events with filters

**Query Parameters:**
- `type` (optional): Filter by event type (Festival, Cricket Match, Political Rally, Market Day, Concert, Other)
- `upcoming` (optional): If true, only return future events
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_name": "Diwali Festival",
      "event_type": "Festival",
      "location": "POINT(...)",
      "venue_name": "Gandhi Maidan",
      "start_time": "2024-01-01T10:00:00Z",
      "end_time": "2024-01-01T22:00:00Z",
      "expected_attendance": 50000,
      "traffic_impact_multiplier": 2.5,
      "affected_roads": ["Road 1", "Road 2"],
      "description": "Major festival celebration",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/events
Create event (admin only)

**Request Body:**
```json
{
  "event_name": "Cricket Match",
  "event_type": "Cricket Match",
  "location": { "lat": 21.2514, "lng": 81.6296 },
  "venue_name": "Shaheed Veer Narayan Singh Stadium",
  "start_time": "2024-01-15T14:00:00Z",
  "end_time": "2024-01-15T22:00:00Z",
  "expected_attendance": 30000,
  "traffic_impact_multiplier": 3.0,
  "affected_roads": ["Stadium Road", "Link Road"],
  "description": "IPL match"
}
```

---

## Database Test API

### GET /api/test-db
Test database connection and get basic stats

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "reportsCount": 150,
    "usersCount": 500,
    "systemSettings": [
      { "setting_key": "app_name", "setting_value": "Smart City Voice Platform" }
    ]
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Voice Integration Flow

For voice-first reporting:

1. **Frontend**: Record audio → send to Pipecat pipeline
2. **Pipecat Pipeline**:
   - SARVAM AI detects language (EN/HI/CG)
   - Deepgram transcribes speech to text
   - Google Cloud NLP extracts intent
   - Store transcription and detected language
3. **API Call**: POST /api/reports with:
   - `input_method`: "voice"
   - `input_language`: detected language code
   - `voice_transcription`: original transcription
   - `description`: processed description
4. **AI Categorization**: Backend applies Groq for automatic category/priority assignment
5. **Response**: Return created report with unique_id

---

## Geo-Search Example

To find reports near a location (using PostGIS):

```sql
-- Find reports within 5km radius
SELECT * FROM reports
WHERE ST_DWithin(
  location,
  ST_MakePoint(81.6296, 21.2514)::geography,
  5000  -- 5km in meters
);
```

This functionality can be added as `/api/reports/nearby` endpoint.

---

## Next Steps

1. ✅ Reports CRUD API - Complete
2. ✅ Dashboard Stats API - Complete
3. ✅ Traffic Data API - Complete
4. ✅ Events API - Complete
5. ⏳ Connect frontend dashboards to real data
6. 🔜 Pipecat voice pipeline integration
7. 🔜 Groq AI categorization
8. 🔜 SARVAM language detection
9. 🔜 Traffic simulator logic
10. 🔜 Notifications system (SMS/WhatsApp/Push)
