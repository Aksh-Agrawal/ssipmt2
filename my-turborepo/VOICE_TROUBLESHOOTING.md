# 🎤 Voice Assistant Troubleshooting - Quick Fix Guide

## ⚡ Immediate Steps to Test

### 1. **Click "Test Mic" Button First**
Before trying "Start Voice Session", click the **"Test Mic"** button on the page.

**Expected Result:**
- Browser asks for microphone permission
- Alert shows: "✅ Microphone is working!"
- Console shows: "✅ Microphone test PASSED"

**If it fails:**
- Check error message in alert
- Open browser console (F12) to see detailed error

---

### 2. **Open Browser Console (F12)**
Press **F12** key to open Developer Tools → Console tab

Watch for these messages when you click "Test Mic":
```
🧪 Testing microphone access...
✅ Microphone test PASSED
Available tracks: [...]
```

---

### 3. **Check Windows Microphone Settings**

#### Quick Check:
1. Right-click **speaker icon** in taskbar
2. Click **"Sounds"**
3. Go to **"Recording"** tab
4. Speak into microphone - you should see **green bars** moving
5. If no bars → Microphone is muted or not working

#### Privacy Settings:
1. Windows Settings → **Privacy & Security** → **Microphone**
2. Make sure **"Let apps access your microphone"** is **ON**
3. Make sure **browser (Chrome/Edge)** has permission

---

## 🔍 Common Issues & Solutions

### Issue 1: "Permission Denied"
**Error Message:** `NotAllowedError` or `PermissionDeniedError`

**Solution:**
1. Click the **🎤 icon** in browser address bar
2. Select **"Allow"** for microphone
3. Refresh the page
4. Try "Test Mic" again

---

### Issue 2: "No Microphone Found"
**Error Message:** `NotFoundError` or `DevicesNotFoundError`

**Solution:**
1. Check if microphone is **plugged in** (for external mics)
2. Go to Windows **Device Manager**
3. Check **"Audio inputs and outputs"**
4. Make sure microphone is **enabled** (not disabled)
5. Try a different USB port (for USB mics)

---

### Issue 3: "Microphone Already in Use"
**Error Message:** `NotReadableError` or `TrackStartError`

**Solution:**
1. Close **Zoom, Teams, Skype**, or other apps using microphone
2. Close other **browser tabs** that might be using microphone
3. Restart browser
4. Try "Test Mic" again

---

### Issue 4: Browser Not Supported
**Error Message:** "Your browser does not support microphone access"

**Solution:**
1. Use **Google Chrome** or **Microsoft Edge** (recommended)
2. Update browser to **latest version**
3. Don't use: Internet Explorer, old Firefox versions

---

### Issue 5: Nothing Happens When Clicking Button
**Symptoms:**
- No browser prompt appears
- No error message
- Button does nothing

**Solution:**
1. Open Console (F12) and look for JavaScript errors
2. Check if page loaded correctly (no 404 errors)
3. Hard refresh: **Ctrl + Shift + R**
4. Clear browser cache
5. Try in **Incognito/Private mode**

---

## 🧪 Step-by-Step Testing Process

### Step 1: Test Mic Button
```
1. Open http://localhost:3000/user/voice-assistant
2. Click "Test Mic" button
3. Click "Allow" when browser asks
4. Should see success alert
```

**Console should show:**
```
🧪 Testing microphone access...
✅ Microphone test PASSED
Available tracks: [MediaStreamTrack]
```

---

### Step 2: Start Voice Session
```
1. After "Test Mic" passes, click "Start Voice Session"
2. Should see status change to "Connecting..."
3. Then "Listening... speak now"
4. Red dot should be pulsing
5. Should see "🎤 Level: 0" (or higher when speaking)
```

**Console should show:**
```
🎬 Starting voice session...
📱 Requesting microphone access...
✅ Microphone access granted
Audio tracks: [{label: "Your Mic Name", enabled: true}]
Using MIME type: audio/webm;codecs=opus
✅ Audio level monitoring started
```

---

### Step 3: Test Voice Detection
```
1. Speak clearly: "Hello, can you hear me?"
2. Watch "🎤 Level:" number increase (30-60 when speaking)
3. Wait 3 seconds
4. Should see your message appear in chat
```

**Console should show:**
```
🎤 Audio detected! Level: 45
📊 Audio blob received, size: 45678 bytes
✅ Audio size acceptable, processing...
Voice chat result: {transcription: "hello can you hear me", ...}
```

---

## 📋 Browser Console Debug Commands

### Check Available Microphones:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const mics = devices.filter(d => d.kind === 'audioinput');
    console.log('Available microphones:', mics);
  });
```

### Test Basic Mic Access:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Mic works!');
    console.log('Tracks:', stream.getTracks());
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => {
    console.error('❌ Mic failed:', err.name, err.message);
  });
```

---

## 🎯 What Should Happen (Step by Step)

### 1. Page Loads
- You see "Real-Time Voice Assistant" header
- Language dropdown (English selected)
- "Start Voice Session" button
- **NEW: "Test Mic" button**
- Blue info box with instructions

### 2. Click "Test Mic"
- Browser popup: "Allow microphone?"
- Click "Allow"
- Alert: "✅ Microphone is working!"
- Console: Green checkmark messages

### 3. Click "Start Voice Session"
- Status chip changes to "Connecting..."
- Then "Listening... speak now"
- Pulsing red dot appears
- Welcome message in chat
- Audio level indicator shows "🎤 Level: 0"

### 4. Start Speaking
- Audio level increases to 30-60
- Console logs "🎤 Audio detected!"
- After 3 seconds, status changes to "AI is responding..."
- Your message appears in chat
- AI response appears in chat
- Audio plays (AI voice)

### 5. Continuous Conversation
- Status returns to "Listening..."
- Red dot pulses again
- Can speak again without clicking
- Repeats automatically

---

## 🚨 Error Messages Explained

### Browser Console Errors:

| Error Name | Meaning | Fix |
|------------|---------|-----|
| `NotAllowedError` | Permission denied | Click Allow in browser popup |
| `NotFoundError` | No microphone | Plug in microphone |
| `NotReadableError` | Mic in use | Close other apps |
| `OverconstrainedError` | Mic doesn't support settings | Try different mic |
| `TypeError` | Browser not supported | Use Chrome/Edge |

---

## ✅ Success Indicators

You know it's working when you see ALL of these:

1. ✅ "Test Mic" shows success alert
2. ✅ Console shows "✅ Microphone access granted"
3. ✅ Pulsing red dot visible
4. ✅ Audio level shows 0 when silent, 30-60 when speaking
5. ✅ Console logs "🎤 Audio detected!" when you speak
6. ✅ Your message appears in chat after speaking
7. ✅ AI responds with voice
8. ✅ Status returns to "Listening..." automatically

---

## 🆘 Still Not Working?

### Final Checklist:
- [ ] Using Chrome or Edge (latest version)
- [ ] Microphone physically connected and working in Windows
- [ ] Windows microphone privacy settings allow browser access
- [ ] Browser has microphone permission (check address bar icon)
- [ ] No other apps using microphone (Zoom, Teams, etc.)
- [ ] Page loaded without errors (no 404s)
- [ ] Console shows no JavaScript errors
- [ ] "Test Mic" button works and shows success

### If ALL above checked and still failing:

1. **Copy ALL console output** (F12 → Console → Right-click → Save as)
2. **Take screenshot** of the error on screen
3. **Note your setup:**
   - Windows version
   - Browser name and version
   - Microphone model/type
   - What happens when you click buttons

4. **Share this info** so we can debug further

---

## 🎤 Microphone Recommendations

### Best Setup:
- **Chrome or Edge** browser (latest version)
- **External USB microphone** (better than laptop mic)
- **Quiet room** (minimal background noise)
- **6-12 inches** from mouth
- **Speak clearly** at normal volume

### Known Working Mics:
- Built-in laptop microphones (basic quality)
- Webcam microphones
- USB conference mics
- Gaming headsets
- Podcast microphones
- Any Windows-compatible mic

---

## 📞 Quick Test Script

Run this in Console (F12) to test everything:

```javascript
console.log('🧪 Running full microphone diagnostic...');

// 1. Check browser support
if (!navigator.mediaDevices) {
  console.error('❌ Browser does not support getUserMedia');
} else {
  console.log('✅ Browser supports getUserMedia');
}

// 2. List all microphones
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const mics = devices.filter(d => d.kind === 'audioinput');
    console.log(`✅ Found ${mics.length} microphone(s):`, mics);
  });

// 3. Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    console.log('Tracks:', stream.getTracks().map(t => ({
      label: t.label,
      enabled: t.enabled,
      muted: t.muted
    })));
    
    // 4. Test audio level
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let count = 0;
    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const level = Math.round(dataArray.reduce((a,b) => a+b) / dataArray.length);
      console.log(`Level ${count++}:`, level, level > 10 ? '🎤 VOICE DETECTED' : '');
      if (count < 30) setTimeout(checkLevel, 100);
      else {
        console.log('✅ Test complete. Speak during test to see levels.');
        stream.getTracks().forEach(t => t.stop());
      }
    };
    checkLevel();
  })
  .catch(err => {
    console.error('❌ Microphone test failed:', err.name, err.message);
  });
```

This will run for 3 seconds and show if voice is detected.
