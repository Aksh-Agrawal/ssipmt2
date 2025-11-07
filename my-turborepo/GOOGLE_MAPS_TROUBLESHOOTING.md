# Google Maps API Key Troubleshooting Guide

## Your Current Setup
- ✅ API Key added to `.env.local`: `AIzaSyBN8AG1g3co2s51wn4pzOtzvK_kKWHecYA`
- ✅ Server restarted on port 3002
- ⚠️ Getting error: "This page didn't load Google Maps correctly"

## Common Causes & Solutions

### Issue 1: Maps JavaScript API Not Enabled ⚠️
**Most Common Cause**

**How to Fix:**
1. Go to: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
2. Make sure you're in the correct project
3. Click **"Enable"** button
4. Wait 1-2 minutes for activation
5. Refresh your browser

**Also enable these (recommended):**
- Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

### Issue 2: API Key Restrictions Blocking Localhost

**How to Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key name
3. Under **"Application restrictions"**:
   - Select **"None"** (for testing)
   - OR select **"HTTP referrers"** and add:
     ```
     localhost:*
     127.0.0.1:*
     http://localhost:3002/*
     http://localhost:3000/*
     ```
4. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
5. Click **"Save"**
6. Wait 2-3 minutes for changes to propagate
7. Hard refresh browser: **Ctrl + Shift + R**

### Issue 3: Billing Not Enabled

**Google Maps requires billing even for free tier**

**How to Fix:**
1. Go to: https://console.cloud.google.com/billing
2. Click **"Link a billing account"**
3. Add payment method (won't be charged unless you exceed free tier)
4. **Free tier includes:**
   - $200 monthly credit
   - 28,000 map loads per month FREE
   - More than enough for development

### Issue 4: Wrong Project Selected

**Make sure you're using the correct Google Cloud project**

**How to Fix:**
1. Go to: https://console.cloud.google.com/
2. Check project dropdown (top left, next to "Google Cloud")
3. Select the project where you created the API key
4. Verify APIs are enabled in **this** project

## Step-by-Step Verification

### Step 1: Check Browser Console

1. Open DevTools: Press **F12**
2. Go to **Console** tab
3. Look for errors:

**If you see:**
```
Google Maps JavaScript API error: InvalidKeyMapError
```
**Solution:** API key is wrong or not enabled. Check Steps 1-3 above.

**If you see:**
```
Google Maps JavaScript API error: RefererNotAllowedMapError
```
**Solution:** API key restrictions are blocking localhost. See Issue 2.

**If you see:**
```
Google Maps JavaScript API error: ApiNotActivatedMapError
```
**Solution:** Maps JavaScript API not enabled. See Issue 1.

**If you see:**
```
This API project is not authorized to use this API
```
**Solution:** Billing not enabled or API not activated. See Issues 1 & 3.

### Step 2: Test API Key Directly

I created a test file for you: `test-google-maps-key.html`

1. Open it in your browser (already opened)
2. It will show you the exact error
3. Follow the solutions provided on that page

### Step 3: Verify Environment Variable

**Check if Next.js loaded the API key:**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type:
```javascript
// This will show the loaded API key
console.log('API Key loaded:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

**If undefined:**
- Server wasn't restarted properly
- `.env.local` file not in correct location
- Typo in environment variable name

**Solution:**
```powershell
# Stop all node processes
Stop-Process -Name node -Force

# Restart admin server
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web"
npm run dev
```

### Step 4: Hard Refresh Browser

Sometimes browser caches the error:

1. Press: **Ctrl + Shift + R** (Windows)
2. Or: **Ctrl + F5**
3. Or: Clear cache and refresh

## Quick Checklist ✅

Go through this checklist:

- [ ] Maps JavaScript API is enabled in Google Cloud Console
- [ ] Billing account is linked (required even for free tier)
- [ ] API key restrictions allow localhost (or set to "None" for testing)
- [ ] Correct project selected in Google Cloud Console
- [ ] `.env.local` has the API key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...`
- [ ] Admin server restarted after adding API key
- [ ] Browser hard refreshed (Ctrl + Shift + R)
- [ ] No console errors in browser DevTools

## Expected Result

When everything is working, you should see:

✅ **Google Map loads** centered on Raipur (21.2514, 81.6296)
✅ **Traffic layer** shows colored roads (green/yellow/red)
✅ **No error messages** in map container
✅ **Map controls** visible (zoom, street view, map type)
✅ **No console errors** in browser DevTools

## Still Not Working?

### Option 1: Use a Fresh API Key

Sometimes the easiest solution:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ Create Credentials"** → **"API Key"**
3. Copy the new key
4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=new_api_key_here
   ```
5. Don't add any restrictions yet (test first)
6. Restart server and test

### Option 2: Check API Key Status

Visit this URL in your browser (replace with your key):
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyBN8AG1g3co2s51wn4pzOtzvK_kKWHecYA
```

**If you see JavaScript code:** ✅ Key is valid and working
**If you see an error message:** ❌ Read the error - it tells you what to fix

### Option 3: Enable All Required APIs at Once

Run this checklist in Google Cloud Console:

1. **Maps JavaScript API** - Required
   - https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

2. **Places API** - Optional but recommended
   - https://console.cloud.google.com/apis/library/places-backend.googleapis.com

3. **Geocoding API** - Optional but useful
   - https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

4. **Directions API** - Optional for routing
   - https://console.cloud.google.com/apis/library/directions-backend.googleapis.com

Click "Enable" on each, wait for confirmation.

## Contact Support

If still stuck, check:

1. **Test page results** (`test-google-maps-key.html`) - what error do you see?
2. **Browser console** (F12 → Console tab) - copy the exact error message
3. **API key restrictions** - take a screenshot
4. **Billing status** - is it enabled?

## Next Steps Once Working

Once you see the map loading:

1. ✅ Verify traffic layer works (toggle on/off)
2. ✅ Check road closure markers appear
3. ✅ Test heatmap layer
4. ✅ Click markers to see info windows
5. 🎉 **Celebrate!** Your Google Maps integration is complete!

---

**Most Likely Solution:**
1. Enable "Maps JavaScript API" in Google Cloud Console
2. Link billing account
3. Wait 2-3 minutes
4. Hard refresh browser (Ctrl + Shift + R)

**Let me know which error you see in the browser console and I'll help you fix it!**
