/**
 * Microphone Test Script
 * Tests if the voice-chat API endpoint is working properly
 */

const fs = require('fs');
const path = require('path');

async function testVoiceAPI() {
  console.log('🧪 Starting Voice API Test...\n');

  // Test 1: Check if API endpoint is accessible
  console.log('Test 1: Checking API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/voice-chat', {
      method: 'GET',
    });
    console.log('  Status:', response.status);
    if (response.status === 405) {
      console.log('  ✅ Endpoint exists (405 = Method Not Allowed for GET, which is expected)');
    } else {
      console.log('  ℹ️  Endpoint responded with:', response.status);
    }
  } catch (err) {
    console.error('  ❌ Cannot reach API:', err.message);
    console.error('  Make sure the server is running on port 3000');
    return;
  }

  // Test 2: Check environment variables
  console.log('\nTest 2: Checking environment variables...');
  const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasDeepgram = envContent.includes('DEEPGRAM_API_KEY');
    const hasCartesia = envContent.includes('CARTESIA_API_KEY');
    const hasGemini = envContent.includes('GEMINI_API_KEY');
    const hasSarvam = envContent.includes('SARVAM_API_KEY');

    console.log('  Deepgram API Key:', hasDeepgram ? '✅ Found' : '❌ Missing');
    console.log('  Cartesia API Key:', hasCartesia ? '✅ Found' : '❌ Missing');
    console.log('  Gemini API Key:', hasGemini ? '✅ Found' : '❌ Missing');
    console.log('  Sarvam API Key:', hasSarvam ? '✅ Found' : '❌ Missing');

    if (!hasDeepgram || !hasCartesia || !hasGemini) {
      console.log('\n  ⚠️  Some API keys are missing. Voice features may not work.');
    }
  } catch (err) {
    console.error('  ❌ Cannot read .env.local:', err.message);
  }

  // Test 3: Test with sample audio (if you have one)
  console.log('\nTest 3: Testing audio file upload...');
  const testAudioPath = path.join(__dirname, 'test-audio.webm');
  
  if (fs.existsSync(testAudioPath)) {
    console.log('  Found test audio file');
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(testAudioPath));
      formData.append('language', 'en');

      const response = await fetch('http://localhost:3000/api/voice-chat', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('  Response:', result);
      
      if (result.transcription) {
        console.log('  ✅ Transcription:', result.transcription);
      }
      if (result.response) {
        console.log('  ✅ AI Response:', result.response.substring(0, 100) + '...');
      }
      if (result.audioResponse) {
        console.log('  ✅ TTS Audio: Received', result.audioResponse.length, 'characters');
      }
    } catch (err) {
      console.error('  ❌ API test failed:', err.message);
    }
  } else {
    console.log('  ℹ️  No test audio file found (optional)');
    console.log('  To test with audio, record a file and save as test-audio.webm');
  }

  // Test 4: Check browser compatibility simulation
  console.log('\nTest 4: Simulating browser checks...');
  console.log('  MediaRecorder API: ✅ (browser only)');
  console.log('  getUserMedia API: ✅ (browser only)');
  console.log('  WebRTC Support: ✅ (browser only)');
  console.log('  Note: These APIs only work in the browser, not in Node.js');

  console.log('\n✅ Test Complete!');
  console.log('\nNext Steps:');
  console.log('1. Open http://localhost:3000/user/voice-assistant in Chrome');
  console.log('2. Open DevTools (F12)');
  console.log('3. Click "Test Mic" button');
  console.log('4. Check console logs for detailed diagnostics');
}

// Run the test
testVoiceAPI().catch(console.error);
