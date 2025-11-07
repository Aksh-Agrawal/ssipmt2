# 🎤 Browser Console Test Commands

## Copy and paste these commands into your browser console (F12) to test

### Test 1: Check if getUserMedia is supported
```javascript
console.log('Test 1: Browser Support Check');
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('✅ Browser supports microphone access');
} else {
  console.error('❌ Browser does NOT support microphone access');
  console.log('Please use Chrome or Edge browser');
}
```

---

### Test 2: List all available microphones
```javascript
console.log('Test 2: Available Microphones');
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const mics = devices.filter(d => d.kind === 'audioinput');
    console.log(`Found ${mics.length} microphone(s):`);
    mics.forEach((mic, i) => {
      console.log(`  ${i + 1}. ${mic.label || 'Microphone ' + (i + 1)}`);
      console.log(`     ID: ${mic.deviceId.substring(0, 20)}...`);
    });
    if (mics.length === 0) {
      console.error('❌ No microphones found!');
    }
  })
  .catch(err => console.error('Error:', err));
```

---

### Test 3: Test basic microphone access
```javascript
console.log('Test 3: Basic Microphone Access Test');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access GRANTED!');
    console.log('Stream:', stream);
    console.log('Audio tracks:', stream.getAudioTracks());
    stream.getAudioTracks().forEach(track => {
      console.log('  Track label:', track.label);
      console.log('  Track enabled:', track.enabled);
      console.log('  Track muted:', track.muted);
      console.log('  Track settings:', track.getSettings());
    });
    // Stop the stream
    stream.getTracks().forEach(t => t.stop());
    console.log('✅ Test complete - microphone is working!');
  })
  .catch(err => {
    console.error('❌ Microphone access DENIED!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    if (err.name === 'NotAllowedError') {
      console.log('Fix: Click "Allow" when browser asks for permission');
    } else if (err.name === 'NotFoundError') {
      console.log('Fix: Connect a microphone or check Device Manager');
    } else if (err.name === 'NotReadableError') {
      console.log('Fix: Close other apps using the microphone');
    }
  });
```

---

### Test 4: Test microphone with audio level monitoring (3 seconds)
```javascript
console.log('Test 4: Audio Level Monitor (speak now for 3 seconds)');
navigator.mediaDevices.getUserMedia({ 
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
})
  .then(stream => {
    console.log('✅ Recording started - SPEAK NOW!');
    
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let maxLevel = 0;
    let count = 0;
    
    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const level = Math.round(dataArray.reduce((a,b) => a+b) / dataArray.length);
      
      if (level > maxLevel) maxLevel = level;
      
      const bar = '█'.repeat(Math.floor(level / 5));
      const emoji = level > 10 ? '🎤 VOICE!' : '🔇 silence';
      
      console.log(`[${count}] Level: ${level.toString().padStart(3)} ${bar} ${emoji}`);
      
      count++;
      if (count < 30) {
        setTimeout(checkLevel, 100);
      } else {
        console.log('\n✅ Test complete!');
        console.log(`Max level: ${maxLevel}`);
        if (maxLevel < 10) {
          console.warn('⚠️  Level too low! Check:');
          console.log('  - Microphone volume in Windows settings');
          console.log('  - Speak louder or closer to mic');
          console.log('  - Unmute microphone');
        } else if (maxLevel < 30) {
          console.log('⚠️  Level is low but detected. Speak louder.');
        } else {
          console.log('✅ Microphone working perfectly!');
        }
        stream.getTracks().forEach(t => t.stop());
      }
    };
    
    checkLevel();
  })
  .catch(err => {
    console.error('❌ Test failed:', err.name, err.message);
  });
```

---

### Test 5: Test voice recording (3 seconds)
```javascript
console.log('Test 5: Voice Recording Test (3 seconds)');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Recording... SPEAK NOW for 3 seconds!');
    
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
        console.log('  Chunk received:', e.data.size, 'bytes');
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log('✅ Recording complete!');
      console.log('  Total size:', audioBlob.size, 'bytes');
      
      if (audioBlob.size < 3000) {
        console.warn('⚠️  Recording too small - likely silence or mic issue');
      } else if (audioBlob.size < 10000) {
        console.log('✅ Recording size acceptable (quiet voice)');
      } else {
        console.log('✅ Recording size good (normal voice detected)');
      }
      
      stream.getTracks().forEach(t => t.stop());
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);
  })
  .catch(err => {
    console.error('❌ Recording failed:', err.name, err.message);
  });
```

---

### Test 6: Test the actual API endpoint
```javascript
console.log('Test 6: API Endpoint Test');
fetch('/api/voice-chat', {
  method: 'OPTIONS',
})
  .then(response => {
    console.log('✅ API Status:', response.status);
    console.log('✅ Voice API is accessible!');
  })
  .catch(err => {
    console.error('❌ API not accessible:', err.message);
  });
```

---

### Test 7: Full pipeline test (with mock audio)
```javascript
console.log('Test 7: Full Pipeline Test');
console.log('Recording 3 seconds of audio then sending to API...');

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('🎙️ Recording started...');
    
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      console.log('🔄 Sending to API...');
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', 'en');
      
      try {
        const response = await fetch('/api/voice-chat', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        console.log('✅ API Response:');
        console.log('  Transcription:', result.transcription || 'None');
        console.log('  AI Response:', result.response?.substring(0, 100) || 'None');
        console.log('  TTS Audio:', result.audioResponse ? 'Received' : 'None');
        
        if (result.transcription) {
          console.log('✅ Full pipeline working!');
        } else {
          console.warn('⚠️  No transcription - speak louder or check audio');
        }
      } catch (err) {
        console.error('❌ API call failed:', err.message);
      }
      
      stream.getTracks().forEach(t => t.stop());
    };
    
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 3000);
  })
  .catch(err => {
    console.error('❌ Test failed:', err.name, err.message);
  });
```

---

## 🎯 Run All Tests At Once

```javascript
// Copy this entire block and paste into console
(async function runAllTests() {
  console.log('🧪 Running All Microphone Tests...\n');
  console.log('='.repeat(60));
  
  // Test 1
  console.log('\n1️⃣ Browser Support');
  if (navigator.mediaDevices?.getUserMedia) {
    console.log('   ✅ Supported');
  } else {
    console.error('   ❌ Not supported - use Chrome/Edge');
    return;
  }
  
  // Test 2
  console.log('\n2️⃣ Available Devices');
  const devices = await navigator.mediaDevices.enumerateDevices();
  const mics = devices.filter(d => d.kind === 'audioinput');
  console.log(`   Found ${mics.length} microphone(s)`);
  mics.forEach((m, i) => console.log(`   ${i+1}. ${m.label || 'Microphone'}`));
  
  if (mics.length === 0) {
    console.error('   ❌ No microphones found!');
    return;
  }
  
  // Test 3
  console.log('\n3️⃣ Microphone Access');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('   ✅ Access granted');
    console.log('   Device:', stream.getAudioTracks()[0].label);
    stream.getTracks().forEach(t => t.stop());
  } catch (err) {
    console.error('   ❌ Access denied:', err.name);
    console.log('   Fix: Click "Allow" when browser asks');
    return;
  }
  
  // Test 4
  console.log('\n4️⃣ API Endpoint');
  try {
    const response = await fetch('/api/voice-chat', { method: 'OPTIONS' });
    console.log('   ✅ API accessible (status:', response.status + ')');
  } catch (err) {
    console.error('   ❌ API not accessible');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All basic tests passed!');
  console.log('\nNow try the "Test Mic" button on the page');
  console.log('or run Test 7 above for full pipeline test');
  console.log('='.repeat(60));
})();
```

---

## 📝 How to Use

1. **Open the page**: http://localhost:3000/user/voice-assistant
2. **Press F12** to open browser console
3. **Copy any test above** and paste into console
4. **Press Enter** to run
5. **Watch the output** for results

Start with **Test 3** (Basic Microphone Access) to verify your mic works!
