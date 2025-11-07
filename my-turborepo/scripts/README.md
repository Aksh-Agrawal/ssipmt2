# Scripts Directory

This directory contains utility scripts for development and testing.

## Available Scripts

### 1. create-sample-data.js

Creates 10 sample reports in the database for testing dashboards and functionality.

**Usage:**

1. **Browser Console Method (Easiest)**:
   ```
   1. Open http://localhost:3000 (or :3002 for admin)
   2. Make sure you're logged in
   3. Press F12 to open browser console
   4. Copy entire contents of scripts/create-sample-data.js
   5. Paste into console and press Enter
   6. Watch it create 10 reports
   7. Page will auto-refresh to show new data
   ```

2. **Quick One-Liner** (Single Report):
   ```javascript
   fetch('/api/reports', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       description: "Test pothole on Main Road",
       category: "Potholes",
       priority: "High",
       location: { lat: 21.2514, lng: 81.6296 },
       address: "Main Road, Raipur",
       area: "Civil Lines",
       input_method: "text",
       input_language: "en"
     })
   }).then(r => r.json()).then(d => {
     console.log('✅ Created:', d.data?.unique_id);
     location.reload();
   });
   ```

**Sample Data Includes:**

- 10 civic reports across all categories:
  - 2 Potholes (Critical, High)
  - 2 Streetlights (High, Medium)
  - 2 Garbage (High, Medium)
  - 2 Water Supply (Critical, High)
  - 1 Traffic Signal (High)
  - 1 Other - Footpath (Medium)

- Multi-language examples:
  - 7 English reports
  - 3 Hindi reports (with voice transcription)

- Various priority levels:
  - 2 Critical
  - 5 High
  - 3 Medium

- Different areas in Raipur:
  - Civil Lines, Station Road, Devendra Nagar
  - Shankar Nagar, VIP Road, Bus Stand
  - Pandri, Kota, GE Road, Shastri Market

**Expected Output:**

```
🚀 Starting sample data creation...

📝 Creating report 1/10...
✅ Created: RPT-2024-00001 - Large pothole causing severe vehicle damage...
📝 Creating report 2/10...
✅ Created: RPT-2024-00002 - मुख्य सड़क पर स्ट्रीटलाइट 3 दिन से...
...

============================================================
📊 SUMMARY
============================================================
✅ Successfully created: 10 reports
❌ Failed: 0 reports

🔄 Refreshing page to show new data...
```

## Troubleshooting

### "Unauthorized" Error
**Solution**: Make sure you're logged in before running the script.

### "User not found" Error
**Solution**: The API will auto-create users. Ensure Clerk authentication is working.

### No reports appearing in dashboard
**Solution**: 
1. Refresh the page manually
2. Check browser console for errors
3. Verify reports in Supabase Dashboard → Table Editor → reports

### API not responding
**Solution**:
1. Ensure dev server is running (`npm run dev`)
2. Check correct port (3000 for user, 3002 for admin)
3. Verify `.env.local` has correct Supabase credentials

## Future Scripts (Coming Soon)

- `create-traffic-data.js` - Generate sample traffic incidents
- `create-events.js` - Create sample city events
- `update-report-statuses.js` - Simulate report workflow
- `add-comments.js` - Add sample comments to reports
- `cleanup-test-data.js` - Remove all test data

## Contributing

When adding new scripts:
1. Use clear console.log messages
2. Add progress indicators
3. Include error handling
4. Document usage in this README
5. Test on both portals (user and admin)
