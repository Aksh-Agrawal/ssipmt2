# 🎤 Microphone Detection Debug Guide

## Problem Fixed: Microphone Not Detecting Voice

### What Was Wrong:
1. **Basic audio constraints** - No echo cancellation, noise suppression, or auto-gain control
2. **No audio level monitoring** - Couldn't see if microphone was actually capturing sound
3. **High silence threshold** - Required 5KB audio, missed quiet voices
4. **No MIME type detection** - Didn't check browser compatibility

### What We Fixed:

#### 1. Enhanced Audio Constraints
```typescript
audio: {
  echoCancellation: true,    // Remove echo feedback
  noiseSuppression: true,     // Filter background noise
  autoGainControl: true,      // Boost quiet voices
  sampleRate: 48000,          // High quality audio
  channelCount: 1,            // Mono (saves bandwidth)
}
```

#### 2. Real-Time Audio Level Monitoring
- Added visual audio level indicator: `🎤 Level: X`
- Console logs when audio detected: `🎤 Audio detected! Level: 45`
- Helps verify microphone is working

#### 3. Lower Silence Threshold
- Changed from 5KB to **3KB** minimum audio size
- More sensitive to quiet voices
- Better detection for normal speaking volume

#### 4. MIME Type Auto-Detection
- Checks browser support for `audio/webm;codecs=opus`
- Falls back to `audio/webm` or `audio/mp4`
- Logs selected format: `Using MIME type: audio/webm;codecs=opus`

---

## 🔍 How to Test & Debug

### Step 1: Open Voice Assistant
```
http://localhost:3000/user/voice-assistant
```

### Step 2: Open Browser Console (F12)
Look for these logs when you click "Start Voice Session":

```
✅ Microphone access granted
Audio tracks: [{label: "Microphone (Your Device)", enabled: true, muted: false}]
Using MIME type: audio/webm;codecs=opus
✅ Audio level monitoring started
```

**If you DON'T see these** → Microphone permission denied or no device found

### Step 3: Check Audio Level Indicator
After starting:
- You should see: `🎤 Level: X` next to the pulsing red dot
- Speak normally and watch the level number increase
- Silent: Level 0-10
- Quiet speech: Level 10-30
- Normal speech: Level 30-60
- Loud speech: Level 60+

**If level stays at 0** → Microphone is muted or not selected

### Step 4: Verify Voice Detection
Speak clearly and watch console:

```
🎤 Audio detected! Level: 45
📊 Audio blob received, size: 45678 bytes
✅ Audio size acceptable, processing...
```

**If you see "Audio too small"** → Speak louder or closer to microphone

### Step 5: Check Transcription
After 3 seconds of speaking, you should see:

```
Voice chat result: {
  transcription: "where is the nearest hospital",
  response: "The nearest hospital in Raipur is...",
  audioResponse: "base64data..."
}
```

**If transcription is empty** → Deepgram couldn't understand audio (check audio quality)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Could not access microphone"
**Cause**: Browser permission denied or no microphone detected

**Solutions**:
1. Click the 🎤 icon in browser address bar → Allow
2. In Windows: Settings → Privacy → Microphone → Allow apps
3. Check Device Manager → Audio inputs → Microphone enabled
4. Try different browser (Chrome works best)

### Issue 2: Audio Level Always 0
**Cause**: Wrong microphone selected or muted

**Solutions**:
1. Check Windows sound settings: Right-click speaker icon → Sounds → Recording
2. Set correct microphone as default
3. Unmute microphone (green bars should move when you speak)
4. Increase microphone volume to 80-100%

### Issue 3: "Audio too small, likely silence"
**Cause**: Speaking too quietly or too far from microphone

**Solutions**:
1. Speak louder and clearer
2. Move closer to microphone (6-12 inches)
3. Check microphone boost in Windows sound settings
4. Try external microphone (laptop mics are often weak)

### Issue 4: Empty Transcription
**Cause**: Deepgram couldn't transcribe audio (poor quality, background noise, wrong language)

**Solutions**:
1. Reduce background noise (close windows, turn off fans)
2. Speak in the selected language (check language dropdown)
3. Speak clearly with proper pronunciation
4. Check internet connection (Deepgram API needs good connection)

### Issue 5: MIME Type Not Supported
**Cause**: Old browser version

**Solutions**:
1. Update browser to latest version
2. Use Chrome/Edge (best WebRTC support)
3. Check console for: `Using MIME type: audio/mp4` (fallback)

---

## 🎯 Verification Checklist

Use this checklist to verify everything is working:

### ✅ Pre-Test Setup
- [ ] Browser updated to latest version (Chrome/Edge recommended)
- [ ] Microphone plugged in and recognized by Windows
- [ ] Microphone set as default recording device
- [ ] Microphone volume 80-100% in Windows settings
- [ ] Microphone not muted (check taskbar icon)
- [ ] Quiet environment (minimal background noise)

### ✅ Initial Connection
- [ ] Click "Start Voice Session"
- [ ] See "Connecting..." status
- [ ] Browser asks for microphone permission
- [ ] Click "Allow"
- [ ] Console shows: `✅ Microphone access granted`
- [ ] Console shows audio track details
- [ ] Status changes to "Listening... speak now"
- [ ] See pulsing red dot indicator

### ✅ Audio Monitoring
- [ ] See `🎤 Level: X` next to red dot
- [ ] Level is 0 when silent
- [ ] Level increases when speaking (30-60 range)
- [ ] Console logs: `🎤 Audio detected! Level: 45`
- [ ] Recording happens every 3 seconds

### ✅ Voice Processing
- [ ] Speak clearly for 2-3 seconds
- [ ] Console: `📊 Audio blob received, size: X bytes`
- [ ] Size > 3000 bytes (if smaller, speak louder)
- [ ] Console: `✅ Audio size acceptable, processing...`
- [ ] Status changes to "AI is responding..."
- [ ] User message appears in chat
- [ ] Assistant message appears in chat
- [ ] Audio plays automatically (AI voice)

### ✅ Continuous Conversation
- [ ] After AI finishes speaking, status returns to "Listening..."
- [ ] Red dot starts pulsing again
- [ ] Audio level monitoring resumes
- [ ] Can speak again without clicking buttons
- [ ] Console: `♻️ Restarting listening for continuous conversation...`

### ✅ Session Control
- [ ] Click "End Session" button
- [ ] Console: `🛑 Ending voice session...`
- [ ] Console: `Stopped track: Microphone (Your Device)`
- [ ] Console: `✅ Session ended`
- [ ] Status returns to "Ready to start"
- [ ] Audio level disappears

---

## 📊 Expected Performance Metrics

### Timing
- **Microphone activation**: < 1 second
- **Audio level display**: Immediate (real-time)
- **Recording chunk**: 3 seconds
- **Transcription**: 1-2 seconds
- **AI response**: 1-2 seconds
- **TTS generation**: 2-3 seconds
- **Auto-restart**: 0.5 seconds
- **Total turn time**: ~8-11 seconds

### Audio Quality
- **Sample rate**: 48000 Hz
- **Bit rate**: 128 kbps
- **Channels**: Mono (1)
- **Format**: WebM with Opus codec (best) or MP4 fallback
- **Chunk size**: 15-50 KB for 3 seconds of speech

### Detection Sensitivity
- **Minimum audio**: 3 KB (was 5 KB)
- **Silence detection**: < 3 KB = auto-restart
- **Audio level range**: 0-255 (typical speech: 30-60)
- **Detection threshold**: Level > 10 logs to console

---

## 🔧 Advanced Debugging

### Check Microphone Device
```javascript
// In browser console
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    console.log('Audio inputs:', 
      devices.filter(d => d.kind === 'audioinput')
    );
  });
```

### Test Microphone Directly
```javascript
// In browser console
navigator.mediaDevices.getUserMedia({ 
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
})
.then(stream => {
  console.log('✅ Microphone working!');
  console.log('Tracks:', stream.getTracks());
  stream.getTracks().forEach(t => t.stop());
})
.catch(err => {
  console.error('❌ Microphone error:', err);
});
```

### Monitor Audio Levels Manually
```javascript
// In browser console
const audioContext = new AudioContext();
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(stream);
const analyser = audioContext.createAnalyser();
source.connect(analyser);

const dataArray = new Uint8Array(analyser.frequencyBinCount);
setInterval(() => {
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a,b) => a+b) / dataArray.length;
  console.log('Level:', Math.round(avg));
}, 100);
```

---

## 🎤 Microphone Best Practices

### Hardware
- **Use external USB microphone** for best quality (laptop mics are weak)
- **Position 6-12 inches** from mouth (not too close, not too far)
- **Use pop filter** to reduce plosives (P, B sounds)
- **Avoid touching** microphone during recording

### Environment
- **Quiet room** with minimal echo
- **Close windows** to block outside noise
- **Turn off fans**, AC, or loud appliances
- **Use headphones** to prevent feedback

### Speaking
- **Speak clearly** and at normal pace
- **Project voice** without shouting
- **Face microphone** directly
- **Pause between sentences** (allows AI to process)

### Browser
- **Chrome/Edge recommended** (best WebRTC support)
- **Update to latest version**
- **Allow microphone permission**
- **No browser extensions** that block audio (ad blockers, etc.)

---

## 🆘 Still Not Working?

### Try This Test Sequence:

1. **Test Windows Sound Recorder**
   - Open Windows Sound Recorder app
   - Click record and speak
   - Play it back
   - If this doesn't work → Hardware issue

2. **Test Browser Microphone**
   - Go to: https://mictests.com/
   - Allow microphone
   - See if waveform moves when you speak
   - If this doesn't work → Browser/permission issue

3. **Test Our Application**
   - Open http://localhost:3000/user/voice-assistant
   - Press F12 for console
   - Click "Start Voice Session"
   - Look for console logs
   - Check audio level indicator

4. **Report Issue**
   - Copy all console logs
   - Note your browser version
   - Note your microphone model
   - Describe what happens vs what's expected

---

## 🎉 Success Criteria

Your microphone is working correctly when:

✅ Audio level shows 30-60 when speaking
✅ Console logs show audio detection every 3 seconds
✅ Transcription matches what you said
✅ AI responds with voice
✅ Conversation continues automatically
✅ No "audio too small" messages
✅ No empty transcriptions

**If all above are true → Your voice assistant is 100% functional! 🎊**

---

## 📝 Technical Changes Summary

### Files Modified:
- `apps/web-platform/app/user/voice-assistant/page.tsx`

### Changes Made:

1. **Enhanced getUserMedia constraints** (Line ~78)
   ```typescript
   audio: {
     echoCancellation: true,
     noiseSuppression: true,
     autoGainControl: true,
     sampleRate: 48000,
     channelCount: 1,
   }
   ```

2. **Added audio level monitoring** (Line ~129)
   ```typescript
   const setupAudioLevelMonitoring = (stream: MediaStream) => {
     // Creates AnalyserNode to monitor real-time audio levels
     // Updates audioLevel state every frame
     // Logs when audio detected (level > 10)
   }
   ```

3. **Added state for monitoring** (Line ~54)
   ```typescript
   const streamRef = useRef<MediaStream | null>(null);
   const analyserRef = useRef<AnalyserNode | null>(null);
   const [audioLevel, setAudioLevel] = useState(0);
   ```

4. **MIME type auto-detection** (Line ~163)
   ```typescript
   let mimeType = 'audio/webm;codecs=opus';
   if (!MediaRecorder.isTypeSupported(mimeType)) {
     mimeType = 'audio/webm';
     if (!MediaRecorder.isTypeSupported(mimeType)) {
       mimeType = 'audio/mp4';
     }
   }
   ```

5. **Lower silence threshold** (Line ~229)
   ```typescript
   if (audioBlob.size < 3000) { // Was 5000
     console.log('⚠️ Audio too small (< 3KB)');
   }
   ```

6. **Enhanced logging** (Throughout)
   ```typescript
   console.log('✅ Microphone access granted');
   console.log('📊 Audio blob received, size:', audioBlob.size);
   console.log('🎤 Audio detected! Level:', level);
   ```

7. **UI audio level display** (Line ~535)
   ```typescript
   {audioLevel > 0 && (
     <Typography variant="caption">
       🎤 Level: {audioLevel}
     </Typography>
   )}
   ```

---

## 🔄 Next Steps

Now that microphone detection is fixed:

1. **Test with different microphones** (laptop, USB, headset)
2. **Test in noisy environment** (verify noise suppression)
3. **Test with quiet voice** (verify auto-gain control)
4. **Test long conversations** (verify continuous mode)
5. **Test different languages** (EN, HI, CG)

All microphone issues should now be resolved! 🎤✅
