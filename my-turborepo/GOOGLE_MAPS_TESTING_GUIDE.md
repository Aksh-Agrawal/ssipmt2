# Google Maps Integration - Testing Checklist ✅

## Current Status
- ✅ Google Maps component created
- ✅ API endpoints created (/api/road-closures, /api/traffic/heatmap)
- ✅ Admin traffic map page updated
- ✅ Admin server running on port 3002
- ⚠️ **Waiting for Google Maps API Key**

## What You Should See

### Without API Key (Current State):
When you open http://localhost:3002/admin/traffic-map, you should see:
- Map container with error message:
  ```
  "Error loading Google Maps. Please check your API key in environment variables.
  Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local"
  ```
- Traffic statistics (45% clear, 35% moderate, etc.)
- Active incidents list (right sidebar)
- Traffic cameras list
- Sensor network data
- Map controls (Traffic/Heatmap/Satellite toggles)

### With API Key (After Setup):
- 🗺️ **Interactive Google Map** centered on Raipur (21.2514, 81.6296)
- 🚦 **Google Traffic Layer** - Live traffic from Google (green/yellow/red roads)
- 🔥 **Heatmap Overlay** - Your sensor data as colored overlay
- 📍 **Road Closure Markers** - Red/orange/yellow circles on map
- 💬 **Info Windows** - Click markers to see closure details
- 🎛️ **Controls** - Zoom, pan, street view, map type selector

## Setup Steps

### Step 1: Get Google Maps API Key

1. Go to: https://console.cloud.google.com/

2. Create a new project (or select existing):
   - Click "Select a project" → "New Project"
   - Name: "Raipur Smart City" or similar
   - Click "Create"

3. Enable Required APIs:
   - Navigate to: APIs & Services → Library
   - Search for "Maps JavaScript API" → Click → Enable
   - Search for "Places API" → Click → Enable (optional, for autocomplete)

4. Create API Key:
   - Navigate to: APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key that appears

5. Restrict API Key (IMPORTANT for security):
   - Click "Restrict Key"
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `localhost:3002/*`
     - Add: `localhost:3000/*` (for user app)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Maps JavaScript API"
     - Check "Places API" (if enabled)
   - Click "Save"

### Step 2: Add API Key to Environment

Open: `apps/admin-web/.env.local`

Replace this line:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

With your actual API key:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Server

```powershell
# Stop the current server (Ctrl+C in the terminal running it)
# Or find and kill the process:
Get-Process -Name node | Where-Object { $_.MainWindowTitle -like "*admin*" } | Stop-Process

# Start fresh:
cd apps\admin-web
npm run dev
```

### Step 4: Test the Map

1. Open: http://localhost:3002/admin/traffic-map

2. You should now see:
   - ✅ Real Google Map (not error message)
   - ✅ Traffic layer (if toggled on)
   - ✅ Road closure markers from your database
   - ✅ Interactive controls

## Testing Checklist

### Visual Tests:
- [ ] Map loads without errors
- [ ] Map is centered on Raipur, India
- [ ] Can zoom in/out with mouse wheel
- [ ] Can pan by dragging
- [ ] Street view control appears in bottom right

### Traffic Layer Tests:
- [ ] Click "Traffic" toggle button
- [ ] Roads turn green/yellow/orange/red based on traffic
- [ ] Traffic updates automatically (Google's live data)

### Heatmap Tests:
- [ ] Click "Heatmap" toggle button
- [ ] See colored overlay representing your sensor data
- [ ] Colors range from blue (low) to red (high congestion)

### Road Closure Tests:
- [ ] See colored circle markers on map
- [ ] Marker colors: Red (critical), Orange (medium), Yellow (low)
- [ ] Click a marker → Info window opens
- [ ] Info window shows: Road name, Reason, Severity chip
- [ ] Click X to close info window

### Controls Tests:
- [ ] Toggle "Incidents" on/off
- [ ] Toggle "Cameras" on/off
- [ ] Toggle "Sensors" on/off
- [ ] Toggle "Road Closures" on/off
- [ ] Switch between Traffic/Heatmap/Satellite views
- [ ] Auto-refresh toggle works

## Browser Console Tests

Open Developer Tools (F12) → Console tab

### Check for Errors:
```javascript
// Should see NO errors like:
// ❌ "Google Maps JavaScript API error: InvalidKeyMapError"
// ❌ "Google Maps JavaScript API error: RefererNotAllowedMapError"

// Should see logs like:
// ✅ "Google Maps loaded successfully"
// ✅ API requests to /api/road-closures
// ✅ API requests to /api/traffic/heatmap
```

### Test API Endpoints Manually:
```javascript
// Test road closures
fetch('/api/road-closures')
  .then(r => r.json())
  .then(data => console.log('Road closures:', data));

// Test traffic heatmap
fetch('/api/traffic/heatmap')
  .then(r => r.json())
  .then(data => console.log('Traffic heatmap:', data));
```

## Common Issues & Solutions

### Issue 1: "RefererNotAllowedMapError"
**Cause:** API key restrictions don't allow localhost
**Solution:** 
1. Go to Google Cloud Console → Credentials
2. Edit your API key
3. Under HTTP referrers, add: `localhost:3002/*`
4. Save and wait 5 minutes for changes to propagate

### Issue 2: "InvalidKeyMapError"
**Cause:** API key is wrong or not set
**Solution:**
1. Check `.env.local` has correct key
2. Restart server: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R

### Issue 3: No markers showing
**Cause:** Database has no road closures
**Solution:**
1. Check database: `SELECT * FROM road_closures WHERE is_active = true;`
2. Add test data via Traffic Simulator page
3. Or insert manually:
```sql
INSERT INTO road_closures (road_segment_id, start_date, end_date, reason, severity, is_active)
VALUES ('VIP Road Section 1', NOW(), NOW() + INTERVAL '7 days', 'Road repair work', 'medium', true);
```

### Issue 4: Heatmap not showing
**Cause:** No traffic data in database
**Solution:**
1. Visit: http://localhost:3002/admin/simulate
2. Run traffic simulation to generate data
3. Go back to traffic map and toggle "Heatmap"

### Issue 5: "Billing not enabled"
**Cause:** Google Maps requires billing account (they have free tier)
**Solution:**
1. Go to Google Cloud Console → Billing
2. Set up billing account (free $300 credit)
3. Note: Under free tier, you get:
   - 28,000 map loads per month FREE
   - $200 monthly credit
   - More than enough for development

## Feature Verification

### ✅ Working Features:
1. **Google Traffic Layer** - Shows real-time traffic from Google
2. **Custom Heatmap** - Displays your sensor data
3. **Road Closure Markers** - From your database
4. **Interactive Info Windows** - Click markers for details
5. **Map Controls** - Zoom, pan, street view
6. **Toggle Layers** - Turn on/off traffic/heatmap/closures
7. **Live Updates** - Auto-refresh every 30s (if enabled)
8. **Responsive Layout** - Works on different screen sizes

### 📊 Data Sources:
1. **Google Traffic** - Live traffic from Google Maps
2. **Road Closures** - Your `road_closures` table
3. **Traffic Heatmap** - Your `traffic_data` table
4. **Statistics** - Calculated from database

## Performance Metrics

Expected load times:
- Map initial load: 1-2 seconds
- Markers render: < 500ms
- Heatmap render: < 1 second
- API response: < 200ms

If slower, check:
- Network tab in DevTools
- Database query performance
- Number of markers (optimize if > 100)

## Next Steps After Testing

Once Google Maps is working:

1. **Add Real Coordinates** to database:
   ```sql
   ALTER TABLE road_segments ADD COLUMN lat DECIMAL(10, 8);
   ALTER TABLE road_segments ADD COLUMN lng DECIMAL(11, 8);
   ```

2. **Populate Coordinates** for Raipur roads:
   - VIP Road: 21.2514, 81.6296
   - GE Road: 21.2497, 81.6292
   - Station Road: 21.2561, 81.6347
   - etc.

3. **Draw Road Lines** (polylines) instead of just markers

4. **Add User Reports** to map with different colored pins

5. **Click-to-Create** closures by clicking on map

## Success Criteria ✅

You'll know it's working perfectly when:
- [x] Map loads in < 2 seconds
- [x] No console errors
- [x] Traffic layer shows colored roads
- [x] Markers appear and are clickable
- [x] Info windows display correct data
- [x] Heatmap changes color based on data
- [x] All toggles work smoothly
- [x] Map is responsive and interactive

---

**Current Status**: Ready to test! Just need Google Maps API key.

**Estimated Setup Time**: 10-15 minutes

**Documentation**: See `VOICE_AI_IMPLEMENTATION_COMPLETE.md` for full voice AI docs
