#!/usr/bin/env node

/**
 * Voice AI Pipeline - Terminal Testing Script
 * Tests each component separately to find errors before browser testing
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, icon, message) {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

async function testEnvironmentVariables() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '📋', 'TEST 1: Environment Variables');
  console.log('='.repeat(60));

  const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('red', '❌', '.env.local file not found!');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const requiredKeys = {
    'DEEPGRAM_API_KEY': { found: false, value: null },
    'CARTESIA_API_KEY': { found: false, value: null },
    'GEMINI_API_KEY': { found: false, value: null },
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': { found: false, value: null },
  };
  
  lines.forEach(line => {
    Object.keys(requiredKeys).forEach(key => {
      if (line.startsWith(key) && !line.startsWith('#')) {
        requiredKeys[key].found = true;
        const value = line.split('=')[1]?.trim();
        requiredKeys[key].value = value?.substring(0, 20) + '...';
      }
    });
  });
  
  let allFound = true;
  Object.entries(requiredKeys).forEach(([key, data]) => {
    if (data.found) {
      log('green', '✅', `${key}: ${data.value}`);
    } else {
      log('red', '❌', `${key}: MISSING`);
      allFound = false;
    }
  });

  if (allFound) {
    log('green', '✅', 'All API keys configured');
    return true;
  } else {
    log('red', '❌', 'Some API keys missing - add them to .env.local');
    return false;
  }
}

async function testServerRunning() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🌐', 'TEST 2: Server Health Check');
  console.log('='.repeat(60));

  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'HEAD',
    });
    
    if (response.ok || response.status === 404) {
      log('green', '✅', `Server is running (status: ${response.status})`);
      return true;
    } else {
      log('yellow', '⚠️', `Server responded with: ${response.status}`);
      return true;
    }
  } catch (err) {
    log('red', '❌', 'Server not running on port 3000');
    log('yellow', 'ℹ️', 'Start server with: cd my-turborepo && npm run dev --workspace=web-platform');
    return false;
  }
}

async function testDeepgramAPI() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🎧', 'TEST 3: Deepgram API (Speech-to-Text)');
  console.log('='.repeat(60));

  const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKeyLine = envContent.split('\n').find(l => l.startsWith('DEEPGRAM_API_KEY='));
  
  if (!apiKeyLine) {
    log('red', '❌', 'DEEPGRAM_API_KEY not found');
    return false;
  }

  const apiKey = apiKeyLine.split('=')[1]?.trim();
  
  // Test with a small audio file (we'll use a pre-recorded sample if available)
  log('blue', 'ℹ️', 'Testing Deepgram API with mock request...');
  
  try {
    // Just test if the API key is valid by making a simple request
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    if (response.ok) {
      log('green', '✅', 'Deepgram API key is valid');
      return true;
    } else if (response.status === 401) {
      log('red', '❌', 'Deepgram API key is invalid (401 Unauthorized)');
      return false;
    } else {
      log('yellow', '⚠️', `Deepgram API responded with: ${response.status}`);
      return false;
    }
  } catch (err) {
    log('red', '❌', `Deepgram API test failed: ${err.message}`);
    return false;
  }
}

async function testGeminiAPI() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🤖', 'TEST 4: Gemini AI API');
  console.log('='.repeat(60));

  const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKeyLine = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
  
  if (!apiKeyLine) {
    log('red', '❌', 'GEMINI_API_KEY not found');
    return false;
  }

  const apiKey = apiKeyLine.split('=')[1]?.trim();
  
  log('blue', 'ℹ️', 'Testing Gemini API with simple request...');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('Say "Hello" in one word');
    const response = await result.response;
    const text = response.text();
    
    log('green', '✅', `Gemini API working (gemini-2.5-flash) - Response: "${text.trim()}"`);
    return true;
  } catch (err) {
    log('red', '❌', `Gemini API test failed: ${err.message}`);
    if (err.message.includes('404')) {
      log('yellow', 'ℹ️', 'Model not found. API key might be invalid or model name incorrect.');
    }
    return false;
  }
}

async function testCartesiaAPI() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🔊', 'TEST 5: Cartesia API (Text-to-Speech)');
  console.log('='.repeat(60));

  const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKeyLine = envContent.split('\n').find(l => l.startsWith('CARTESIA_API_KEY='));
  
  if (!apiKeyLine) {
    log('red', '❌', 'CARTESIA_API_KEY not found');
    return false;
  }

  const apiKey = apiKeyLine.split('=')[1]?.trim();
  
  log('blue', 'ℹ️', 'Testing Cartesia API with simple TTS request...');
  
  try {
    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-english',
        transcript: 'Hello, this is a test.',
        voice: {
          mode: 'id',
          id: '79a125e8-cd45-4c13-8a67-188112f4dd22',
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100,
        },
      }),
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      log('green', '✅', `Cartesia API working - Generated ${audioBuffer.byteLength} bytes of audio`);
      return true;
    } else {
      const errorText = await response.text();
      log('red', '❌', `Cartesia API failed: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (err) {
    log('red', '❌', `Cartesia API test failed: ${err.message}`);
    return false;
  }
}

async function testVoiceChatEndpoint() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🎤', 'TEST 6: Voice Chat API Endpoint');
  console.log('='.repeat(60));

  try {
    const response = await fetch('http://localhost:3000/api/voice-chat', {
      method: 'OPTIONS',
    });
    
    log('green', '✅', `Voice chat endpoint accessible (status: ${response.status})`);
    return true;
  } catch (err) {
    log('red', '❌', `Cannot reach voice chat endpoint: ${err.message}`);
    return false;
  }
}

async function testGeminiChatEndpoint() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '💬', 'TEST 7: Gemini Chat API Endpoint');
  console.log('='.repeat(60));

  try {
    const response = await fetch('http://localhost:3000/api/gemini-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello',
        conversationHistory: [],
        language: 'en',
      }),
    });

    if (response.status === 401) {
      log('yellow', '⚠️', 'Endpoint requires authentication (expected)');
      log('green', '✅', 'Gemini chat endpoint is working (auth required)');
      return true;
    } else if (response.ok) {
      const result = await response.json();
      log('green', '✅', `Gemini chat endpoint working - Response: "${result.response?.substring(0, 50)}..."`);
      return true;
    } else {
      log('yellow', '⚠️', `Endpoint responded with: ${response.status}`);
      return false;
    }
  } catch (err) {
    log('red', '❌', `Cannot reach gemini-chat endpoint: ${err.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  log('cyan', '🧪', '═══════════════════════════════════════════════════════════');
  log('cyan', '🎯', '           VOICE AI PIPELINE - TERMINAL TESTS              ');
  log('cyan', '🧪', '═══════════════════════════════════════════════════════════');
  
  const results = {
    environment: await testEnvironmentVariables(),
    server: await testServerRunning(),
    deepgram: false,
    gemini: false,
    cartesia: false,
    voiceEndpoint: false,
    geminiEndpoint: false,
  };

  if (!results.environment) {
    log('red', '❌', '\nCannot proceed without API keys. Fix .env.local first.');
    return;
  }

  if (!results.server) {
    log('red', '❌', '\nCannot proceed without server running. Start the server first.');
    return;
  }

  // Test external APIs
  results.deepgram = await testDeepgramAPI();
  results.gemini = await testGeminiAPI();
  results.cartesia = await testCartesiaAPI();
  
  // Test internal endpoints
  results.voiceEndpoint = await testVoiceChatEndpoint();
  results.geminiEndpoint = await testGeminiChatEndpoint();

  // Summary
  console.log('\n' + '='.repeat(60));
  log('cyan', '📊', 'TEST SUMMARY');
  console.log('='.repeat(60));

  const tests = [
    ['Environment Variables', results.environment],
    ['Server Running', results.server],
    ['Deepgram API (STT)', results.deepgram],
    ['Gemini API (AI)', results.gemini],
    ['Cartesia API (TTS)', results.cartesia],
    ['Voice Chat Endpoint', results.voiceEndpoint],
    ['Gemini Chat Endpoint', results.geminiEndpoint],
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(([name, result]) => {
    if (result) {
      log('green', '✅', name);
      passed++;
    } else {
      log('red', '❌', name);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(60));
  log('cyan', '🎯', `RESULTS: ${passed}/${tests.length} tests passed`);
  console.log('='.repeat(60));

  if (failed === 0) {
    log('green', '🎉', 'ALL TESTS PASSED! Ready for browser testing.');
    console.log('\nNext steps:');
    console.log('1. Open: http://localhost:3000/user/voice-assistant');
    console.log('2. Click "Test Mic" button');
    console.log('3. Click "Start Voice Session"');
    console.log('4. Speak: "Where is the nearest hospital?"');
    console.log('5. Watch terminal logs for API calls');
  } else {
    log('red', '❌', `${failed} test(s) failed. Fix these before browser testing:`);
    tests.forEach(([name, result]) => {
      if (!result) {
        console.log(`   - ${name}`);
      }
    });
  }

  console.log('\n');
}

// Run all tests
runAllTests().catch(console.error);
