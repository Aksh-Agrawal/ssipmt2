# Voice AI Quick Test Guide 🎤

## Prerequisites
Ensure you have API keys in `.env.local`:
```env
DEEPGRAM_API_KEY=your_key
SARVAM_AI_API_KEY=your_key
CARTESIA_API_KEY=your_key
GROQ_API_KEY=your_key
GOOGLE_CLOUD_API_KEY=your_key
```

## Test 1: Voice Recording UI ⏺️

### Steps:
1. Start dev server:
```powershell
cd apps\web-platform
npm run dev
```

2. Open: http://localhost:3000/user/report

3. Test flow:
   - Select language (English/Hindi/Chhattisgarhi)
   - Click blue microphone icon
   - Speak clearly: "There is a pothole on Station Road"
   - Click red stop icon
   - Watch form auto-fill

### Expected Result:
- ✅ Transcription appears in text field
- ✅ Category auto-selected (Road Maintenance)
- ✅ Priority auto-detected (Medium)
- ✅ AI suggestion box shows confidence

### Debug Console Output:
```javascript
Voice transcription result: {
  transcription: "There is a pothole on Station Road",
  language: "en",
  reportDetails: {
    category: "road_maintenance",
    priority: "medium",
    location: "Station Road",
    description: "There is a pothole on Station Road"
  },
  nlp: {
    intent: "report_issue",
    entities: { location: "Station Road" }
  }
}
```

---

## Test 2: Chatbot API 💬

### PowerShell Test:
```powershell
$body = @{
  message = "What is the traffic on VIP Road?"
  language = "en"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

### Expected Response:
```json
{
  "message": "Based on live traffic sensors, VIP Road currently has medium congestion with an average speed of 35 km/h.",
  "intent": "traffic",
  "language": "en",
  "sources": ["Live Traffic Data"]
}
```

### Hindi Test:
```powershell
$body = @{
  message = "VIP Road par traffic kaisa hai?"
  language = "hi"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

---

## Test 3: Voice API Health Check 🏥

### Test Endpoint:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/voice/process" `
  -Method GET | Select-Object -Expand Content | ConvertFrom-Json
```

### Expected Response:
```json
{
  "status": "ok",
  "service": "voice-pipeline",
  "features": [
    "Multi-language detection (EN/HI/CG)",
    "Speech-to-text transcription",
    "Auto-categorization",
    "NLP entity extraction"
  ]
}
```

---

## Test 4: Multi-Language Voice Tests 🌍

### English Test Phrases:
```
"There is a pothole on Station Road"
"The streetlight is not working on GE Road"
"Garbage has not been collected for 3 days"
"Water supply is interrupted in my area"
```

### Hindi Test Phrases:
```
"स्टेशन रोड पर एक गड्ढा है" (pothole on Station Road)
"GE रोड पर स्ट्रीटलाइट काम नहीं कर रही" (streetlight not working)
"3 दिन से कचरा नहीं उठाया गया" (garbage not collected)
```

### Expected Auto-Categorization:

| Input | Category | Priority |
|-------|----------|----------|
| Pothole | road_maintenance | medium |
| Streetlight not working | electricity | high |
| Garbage not collected | sanitation | medium |
| Water supply interrupted | water_supply | high |

---

## Test 5: Error Handling 🚨

### Test Scenarios:

1. **No microphone permission**:
   - Block mic access in browser
   - Expected: "Microphone permission denied" error

2. **No audio (silent recording)**:
   - Record without speaking
   - Expected: "Recording too short" error

3. **Network failure**:
   - Disconnect internet
   - Expected: "Failed to process voice input" error

4. **Invalid API key**:
   - Remove DEEPGRAM_API_KEY
   - Expected: 500 error with message

---

## Test 6: Form Integration 📝

### Steps:
1. Record voice: "Pothole on VIP Road near Magneto Mall"
2. Verify auto-fill:
   - ✅ Description populated
   - ✅ Category = Road Maintenance
   - ✅ Priority = Medium
   - ✅ AI suggestion shows
3. Add photo (optional)
4. Click "Submit Report"
5. Verify success message with AI analysis

### Expected AI Analysis Display:
```
🤖 AI Analysis:
• Category: road_maintenance
• Priority: medium
• Intent: report_issue
💡 Detected report_issue intent from voice input
```

---

## Test 7: Browser Console Tests 🔍

### Open Browser DevTools (F12):

```javascript
// Test VoiceRecorder component directly
// On /user/report page

// 1. Check if MediaRecorder is supported
console.log('MediaRecorder supported:', typeof MediaRecorder !== 'undefined');

// 2. Check microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone error:', err));

// 3. Test voice API directly
const formData = new FormData();
// First record audio via UI, then:
const audioBlob = /* blob from recording */;
formData.append('audio', audioBlob, 'test.webm');
formData.append('language', 'en');

fetch('/api/voice/process', {
  method: 'POST',
  body: formData
})
  .then(r => r.json())
  .then(data => console.log('✅ Voice API result:', data))
  .catch(err => console.error('❌ Voice API error:', err));
```

---

## Test 8: Admin Chatbot 🔧

### Test Admin Chat API:
```powershell
# Start admin server
cd apps\admin-web
npm run dev
# Opens on http://localhost:3002

# Test chat
$body = @{
  message = "Show me traffic statistics"
  language = "en"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

---

## Performance Benchmarks ⏱️

### Expected Timings:
```
Audio Recording: User controlled (1-60s)
Language Detection: ~500ms
Speech-to-Text: ~1-2s
NLP Processing: ~300ms
Categorization: ~100ms
Total Pipeline: ~2-3s
```

### Test Performance:
```javascript
// In browser console on /user/report
// Record voice, then check console logs:
// "Processing time: 2341ms" ← Should be < 5s
```

---

## Troubleshooting Checklist ✔️

### If voice recording doesn't work:
- [ ] Browser supports MediaRecorder (Chrome/Edge/Firefox)
- [ ] HTTPS enabled (or localhost)
- [ ] Microphone permission granted
- [ ] Microphone connected and working
- [ ] No other apps using microphone

### If transcription fails:
- [ ] DEEPGRAM_API_KEY is valid
- [ ] Audio file size < 10MB
- [ ] Spoke clearly (not too fast)
- [ ] Background noise minimal
- [ ] Audio duration > 1 second

### If categorization is wrong:
- [ ] Use specific keywords (pothole, garbage, water)
- [ ] Mention location explicitly
- [ ] Speak in complete sentences
- [ ] Check Google NLP API key

### If chatbot gives generic responses:
- [ ] Traffic data exists in database
- [ ] GROQ_API_KEY is valid
- [ ] Question is clear and specific
- [ ] Language matches input

---

## Quick Debug Commands 🔍

### Check if services are running:
```powershell
# User app
netstat -ano | findstr :3000

# Admin app
netstat -ano | findstr :3002
```

### Check API keys loaded:
```javascript
// In browser console
console.log('API endpoint:', window.location.origin + '/api/voice/process');

// Check env vars (server-side only, won't work in browser)
// Add to route.ts temporarily:
console.log('Keys loaded:', {
  deepgram: !!process.env.DEEPGRAM_API_KEY,
  sarvam: !!process.env.SARVAM_AI_API_KEY,
  groq: !!process.env.GROQ_API_KEY
});
```

### Clear cache and restart:
```powershell
# Stop server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

---

## Success Indicators ✅

### You know it works when:
1. ✅ Mic button turns red when recording
2. ✅ Console shows transcription result
3. ✅ Form fields auto-fill correctly
4. ✅ AI suggestion box appears
5. ✅ No errors in browser console
6. ✅ Report submits successfully
7. ✅ Processing time < 5 seconds

### Demo Script for Stakeholders:
```
1. "I'll show you how citizens can report issues using just their voice"
2. Open /user/report
3. "First, they select their language - English, Hindi, or Chhattisgarhi"
4. Click microphone
5. Speak: "There is a large pothole on Station Road near the traffic signal"
6. Stop recording
7. "Watch how the system automatically:
   - Transcribes the speech
   - Detects it's a road maintenance issue
   - Sets priority to medium
   - Extracts the location
   - Pre-fills the entire form"
8. "The user can add a photo if needed"
9. Click Submit
10. "And they get instant confirmation with AI analysis"
```

---

## Next Testing Phase 🚀

Once voice AI is verified working:
1. Test Google Maps integration
2. Test photo EXIF extraction
3. Test multi-language UI switching
4. Load testing (100 concurrent voice requests)
5. Real-world field testing with citizens

---

**Pro Tip**: Test with actual users speaking in their natural accent and pace. The AI may perform differently than with perfect pronunciation!

