# Create Sample Data for Testing

This guide helps you populate your database with sample reports to test the dashboard functionality.

## Method 1: Using API Endpoint (Recommended)

### Create Sample Reports via API

You can use the browser console or any HTTP client to create sample reports:

```javascript
// Open your browser console (F12) on http://localhost:3000
// Paste this code to create 5 sample reports:

const sampleReports = [
  {
    description: "Large pothole causing vehicle damage on Main Road near City Hospital",
    category: "Potholes",
    priority: "Critical",
    location: { lat: 21.2514, lng: 81.6296 },
    address: "Main Road, Civil Lines",
    area: "Civil Lines",
    landmark: "Near City Hospital",
    photos: [],
    input_method: "text",
    input_language: "en"
  },
  {
    description: "Streetlight not working for 3 days on Station Road",
    category: "Streetlights",
    priority: "High",
    location: { lat: 21.2497, lng: 81.6295 },
    address: "Station Road, Raipur",
    area: "Station Road",
    landmark: "Bus Stop 12",
    photos: [],
    input_method: "text",
    input_language: "en"
  },
  {
    description: "Garbage not collected for 2 weeks, creating health hazard",
    category: "Garbage",
    priority: "High",
    location: { lat: 21.2450, lng: 81.6340 },
    address: "Sector 5, Devendra Nagar",
    area: "Devendra Nagar",
    photos: [],
    input_method: "text",
    input_language: "en"
  },
  {
    description: "Water supply disrupted in entire colony since yesterday",
    category: "Water Supply",
    priority: "Critical",
    location: { lat: 21.2380, lng: 81.6420 },
    address: "Shankar Nagar, Raipur",
    area: "Shankar Nagar",
    photos: [],
    input_method: "text",
    input_language: "en"
  },
  {
    description: "Traffic signal malfunctioning at major intersection causing congestion",
    category: "Traffic Signal",
    priority: "High",
    location: { lat: 21.2560, lng: 81.6390 },
    address: "VIP Road Junction",
    area: "VIP Road",
    landmark: "Near Mall",
    photos: [],
    input_method: "text",
    input_language: "en"
  }
];

// Create reports one by one
async function createSampleReports() {
  for (const report of sampleReports) {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      const result = await response.json();
      console.log('Created:', result.data?.unique_id || 'Report');
    } catch (error) {
      console.error('Error:', error);
    }
    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('✅ All sample reports created! Refresh the page to see them.');
}

createSampleReports();
```

## Method 2: Using cURL (Command Line)

### Windows PowerShell:

```powershell
# Report 1: Critical Pothole
$body = @{
  description = "Large pothole causing vehicle damage on Main Road"
  category = "Potholes"
  priority = "Critical"
  location = @{ lat = 21.2514; lng = 81.6296 }
  address = "Main Road, Civil Lines"
  area = "Civil Lines"
  input_method = "text"
  input_language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reports" -Method POST -Body $body -ContentType "application/json"
```

## Method 3: Direct SQL (Supabase Dashboard)

Go to Supabase Dashboard → SQL Editor → New Query:

```sql
-- Insert sample reports
INSERT INTO reports (
  description,
  category,
  priority,
  status,
  location,
  address,
  area,
  landmark,
  citizen_id,
  input_method,
  input_language,
  sla_deadline
) VALUES
(
  'Large pothole causing vehicle damage on Main Road near City Hospital',
  'Potholes',
  'Critical',
  'Submitted',
  ST_MakePoint(81.6296, 21.2514)::geography,
  'Main Road, Civil Lines',
  'Civil Lines',
  'Near City Hospital',
  (SELECT id FROM users LIMIT 1), -- Uses first user
  'text',
  'en',
  NOW() + INTERVAL '2 hours'
),
(
  'Streetlight not working for 3 days on Station Road',
  'Streetlights',
  'High',
  'Under Review',
  ST_MakePoint(81.6295, 21.2497)::geography,
  'Station Road, Raipur',
  'Station Road',
  'Bus Stop 12',
  (SELECT id FROM users LIMIT 1),
  'text',
  'en',
  NOW() + INTERVAL '6 hours'
),
(
  'Garbage not collected for 2 weeks',
  'Garbage',
  'High',
  'In Progress',
  ST_MakePoint(81.6340, 21.2450)::geography,
  'Sector 5, Devendra Nagar',
  'Devendra Nagar',
  NULL,
  (SELECT id FROM users LIMIT 1),
  'text',
  'en',
  NOW() + INTERVAL '6 hours'
),
(
  'Water supply disrupted in entire colony',
  'Water Supply',
  'Critical',
  'Submitted',
  ST_MakePoint(81.6420, 21.2380)::geography,
  'Shankar Nagar, Raipur',
  'Shankar Nagar',
  NULL,
  (SELECT id FROM users LIMIT 1),
  'text',
  'en',
  NOW() + INTERVAL '2 hours'
),
(
  'Traffic signal malfunctioning at intersection',
  'Traffic Signal',
  'High',
  'Resolved',
  ST_MakePoint(81.6390, 21.2560)::geography,
  'VIP Road Junction',
  'VIP Road',
  'Near Mall',
  (SELECT id FROM users LIMIT 1),
  'text',
  'en',
  NOW() + INTERVAL '6 hours'
);
```

## Verify Data

After creating sample data, verify it in your dashboard:

1. **User Portal** (http://localhost:3000):
   - Login with your test citizen account
   - Go to Dashboard
   - You should see the reports you created

2. **Admin Portal** (http://localhost:3002):
   - Login with admin account
   - Go to Dashboard
   - You should see ALL reports from all users

## Test API Directly

```bash
# Get all reports
curl http://localhost:3000/api/reports

# Get dashboard stats
curl http://localhost:3000/api/stats/dashboard

# Get specific report
curl http://localhost:3000/api/reports/[report-id]

# Filter by status
curl "http://localhost:3000/api/reports?status=Submitted"

# Filter by category
curl "http://localhost:3000/api/reports?category=Potholes"
```

## Multi-Language Sample (Hindi/Chhattisgarhi)

```javascript
// Hindi voice report example
const hindiReport = {
  description: "Main road par bada gadha hai jo gaadi ke tire damage kar raha hai",
  category: "Potholes",
  priority: "High",
  location: { lat: 21.2514, lng: 81.6296 },
  address: "Main Road, Civil Lines",
  area: "Civil Lines",
  input_method: "voice",
  input_language: "hi",
  voice_transcription: "मुख्य सड़क पर बड़ा गड्ढा है जो गाड़ी के टायर डैमेज कर रहा है"
};

fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(hindiReport)
});
```

## Troubleshooting

### Error: "User not found"
**Solution**: The API will auto-create users. Make sure you're logged in with Clerk authentication.

### Error: "Unauthorized"
**Solution**: Ensure you're logged in to the portal before making API requests.

### Error: "Missing required fields"
**Solution**: Include all required fields: `description`, `category`, `location` (with lat/lng).

### Empty Dashboard
**Solution**: 
1. Check that you're logged in
2. Verify reports were created (check Supabase dashboard)
3. Open browser console (F12) to see any API errors
4. Try refreshing the page

## Next Steps

Once you have sample data:

1. ✅ Test filtering on My Reports page
2. ✅ Test status updates (admin portal)
3. ✅ Test adding comments to reports
4. ✅ Test traffic data and events APIs
5. ✅ Test voice input with Pipecat integration

---

**Quick Start**: Just run Method 1 in your browser console for instant sample data! 🚀
