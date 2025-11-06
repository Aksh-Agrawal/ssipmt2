# Quick Start Testing Guide

Get your platform up and running with sample data in **5 minutes**! 🚀

---

## Step 1: Start Both Portals (2 minutes)

### Terminal 1: User Portal
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform"
npm run dev
```
✅ Should start on: **http://localhost:3000**

### Terminal 2: Admin Portal
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web"
npm run dev
```
✅ Should start on: **http://localhost:3002**

---

## Step 2: Login (1 minute)

### User Portal Login
1. Go to **http://localhost:3000**
2. Click "Citizen Login"
3. Sign up or sign in with Clerk
4. You'll be redirected to dashboard

### Admin Portal Login
1. Go to **http://localhost:3002**
2. Click "Admin Login"
3. Sign up or sign in with Clerk (use different account than citizen)
4. You'll be redirected to admin dashboard

---

## Step 3: Create Sample Data (2 minutes)

### Method A: Automated Script (Recommended) ⭐

1. Go to **http://localhost:3000** (make sure you're logged in)
2. Press **F12** to open browser console
3. Copy the entire contents of: `scripts/create-sample-data.js`
4. Paste into console and press **Enter**
5. Watch it create 10 reports automatically!
6. Page will auto-refresh after 3 seconds

**Expected Output:**
```
🚀 Starting sample data creation...
📝 Creating report 1/10...
✅ Created: RPT-2024-00001 - Large pothole causing severe vehicle damage...
📝 Creating report 2/10...
✅ Created: RPT-2024-00002 - मुख्य सड़क पर स्ट्रीटलाइट 3 दिन से...
...
📊 SUMMARY
✅ Successfully created: 10 reports
🔄 Refreshing page to show new data...
```

### Method B: Quick Single Report (Fast Test)

Paste this in console to create one test report:

```javascript
fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: "Large pothole causing vehicle damage on Main Road near City Hospital",
    category: "Potholes",
    priority: "Critical",
    location: { lat: 21.2514, lng: 81.6296 },
    address: "Main Road, Civil Lines, Raipur",
    area: "Civil Lines",
    landmark: "Near City Hospital",
    input_method: "text",
    input_language: "en"
  })
}).then(r => r.json()).then(d => {
  console.log('✅ Report created:', d.data?.unique_id);
  location.reload();
});
```

Run this 5 times (change description each time) to create sample data!

---

## Step 4: Verify Everything Works

### ✅ User Dashboard (http://localhost:3000/user/dashboard)

Should display:
- **Total Reports**: 10 (or however many you created)
- **Pending**: 10 (newly created reports)
- **In Progress**: 0
- **Resolved**: 0
- **Recent Reports**: List of your 5 most recent reports with:
  - Unique ID (e.g., RPT-2024-00001)
  - Description
  - Status chip (colored)
  - Category, Priority, Area
  - Creation date

### ✅ Admin Dashboard (http://localhost:3002/admin/dashboard)

Should display:
- **Pending Issues**: 10
- **In Progress**: 0
- **Resolved**: 0
- **Total Users**: 1 (or more if multiple accounts)
- **Resolution Rate**: 0% (no resolved reports yet)
- **Recent Incidents**: List of 5 most recent reports from ALL users

---

## Step 5: Test API Directly (Optional)

### Using Browser Console

```javascript
// Get all reports
fetch('/api/reports').then(r => r.json()).then(console.log);

// Get dashboard stats
fetch('/api/stats/dashboard').then(r => r.json()).then(console.log);

// Filter by category
fetch('/api/reports?category=Potholes').then(r => r.json()).then(console.log);

// Filter by status
fetch('/api/reports?status=Submitted').then(r => r.json()).then(console.log);
```

### Using PowerShell (cURL alternative)

```powershell
# Get all reports
Invoke-RestMethod -Uri "http://localhost:3000/api/reports" -Method GET

# Get dashboard stats
Invoke-RestMethod -Uri "http://localhost:3000/api/stats/dashboard" -Method GET

# Create a report
$body = @{
  description = "Test pothole"
  category = "Potholes"
  priority = "High"
  location = @{ lat = 21.2514; lng = 81.6296 }
  address = "Main Road, Raipur"
  area = "Civil Lines"
  input_method = "text"
  input_language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reports" -Method POST -Body $body -ContentType "application/json"
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution**: Make sure you're logged in before running scripts or API calls.

### Issue: Dashboard shows 0 reports
**Solution**: 
1. Refresh the page (Ctrl + R)
2. Check browser console (F12) for errors
3. Verify you're logged in
4. Try creating a report manually using Method B

### Issue: "Failed to fetch" error
**Solution**:
1. Ensure dev servers are running (check terminals)
2. Verify correct ports (3000 for user, 3002 for admin)
3. Check network tab in DevTools for failed requests

### Issue: Reports created but not showing
**Solution**:
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache
3. Check Supabase Dashboard → reports table to verify data exists

### Issue: API returns "User not found"
**Solution**: The API auto-creates users. Make sure Clerk authentication is working properly.

---

## Next Steps After Testing

### 1. Test Report Workflow (Admin Actions)
- Update report status (Submitted → Under Review → In Progress → Resolved)
- Change priority levels
- Assign reports to teams
- Add admin notes

### 2. Test Filtering
- Filter by status (Submitted, In Progress, Resolved)
- Filter by category (Potholes, Streetlights, etc.)
- Filter by priority (Critical, High, Medium, Low)

### 3. Test Comments (Coming Soon)
- Add comments to reports
- View comment history
- Timeline tracking

### 4. Add More Features
- Voice input integration (Pipecat)
- AI categorization (Groq)
- Traffic simulator
- Notifications

---

## Quick Commands Reference

### Start Servers
```powershell
# User portal
cd apps/web-platform; npm run dev

# Admin portal
cd apps/admin-web; npm run dev
```

### Create Sample Data (Browser Console)
```javascript
// See scripts/create-sample-data.js for full script
```

### Check Database (Supabase)
1. Go to https://supabase.com/dashboard
2. Select project: sbqmkbomrwlgcarmyqhw
3. Click "Table Editor"
4. View "reports" table

### Test API Health
```javascript
fetch('/api/test-db').then(r => r.json()).then(console.log);
```

---

## 🎉 Success Criteria

Your platform is working correctly if:

✅ Both portals load without errors  
✅ Login works on both portals  
✅ Dashboard shows real data  
✅ Creating reports via API works  
✅ Reports appear in dashboards  
✅ Stats update correctly  
✅ Different users see different data (user vs admin)  
✅ No console errors  

---

## Platform Status: 70% Complete ✅

**Working:**
- ✅ Frontend (16 pages)
- ✅ Authentication (Clerk)
- ✅ Database (15 tables)
- ✅ API Routes (7 endpoints)
- ✅ Real-time dashboards

**Pending:**
- 🔜 Voice pipeline (Pipecat)
- 🔜 AI categorization (Groq)
- 🔜 Traffic simulator
- 🔜 Notifications

---

## Need Help?

**Documentation:**
- API Reference: `API_DOCUMENTATION.md`
- Backend Details: `BACKEND_API_COMPLETE.md`
- Sample Data: `SAMPLE_DATA_GUIDE.md`
- Milestone Summary: `MILESTONE_FRONTEND_BACKEND_INTEGRATION.md`

**Check Logs:**
- Browser Console (F12)
- Terminal where servers are running
- Supabase Dashboard logs

**Database:**
- Supabase Dashboard: https://supabase.com/dashboard
- Table Editor → View raw data
- SQL Editor → Run queries

---

## Ready to Build More?

Once testing is complete, you can:
1. Build "My Reports" page with filters
2. Build report detail page with comments
3. Integrate Pipecat for voice input
4. Add Groq AI for auto-categorization
5. Build traffic simulator
6. Add SMS/WhatsApp notifications

**Your Smart City Voice Platform is ready for action! 🚀🏙️**
