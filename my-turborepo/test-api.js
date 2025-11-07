#!/usr/bin/env node

/**
 * Simple API Health Check
 */

console.log('🧪 Voice API Health Check\n');

// Test API endpoint
fetch('http://localhost:3000/api/voice-chat', {
  method: 'OPTIONS',
})
  .then(response => {
    console.log('✅ API Endpoint Status:', response.status);
    if (response.status === 200 || response.status === 405) {
      console.log('   Voice API is reachable!\n');
    }
  })
  .catch(err => {
    console.error('❌ Cannot reach API:', err.message);
    console.error('   Make sure server is running: npm run dev --workspace=web-platform\n');
  });

// Check environment file
const fs = require('fs');
const path = require('path');

console.log('📋 Environment Check:\n');

const envPath = path.join(__dirname, 'apps', 'web-platform', '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const apiKeys = {
    'DEEPGRAM_API_KEY': false,
    'CARTESIA_API_KEY': false,
    'GEMINI_API_KEY': false,
    'SARVAM_API_KEY': false,
  };
  
  lines.forEach(line => {
    Object.keys(apiKeys).forEach(key => {
      if (line.includes(key) && !line.startsWith('#')) {
        apiKeys[key] = true;
      }
    });
  });
  
  console.log('\nAPI Keys:');
  console.log('  Deepgram (STT):', apiKeys.DEEPGRAM_API_KEY ? '✅' : '❌');
  console.log('  Cartesia (TTS):', apiKeys.CARTESIA_API_KEY ? '✅' : '❌');
  console.log('  Gemini (AI):', apiKeys.GEMINI_API_KEY ? '✅' : '❌');
  console.log('  Sarvam (Lang):', apiKeys.SARVAM_API_KEY ? '✅' : '❌');
  
  const allPresent = Object.values(apiKeys).every(v => v);
  if (allPresent) {
    console.log('\n✅ All API keys configured!');
  } else {
    console.log('\n⚠️  Some API keys missing - voice features may not work');
  }
} else {
  console.log('❌ .env.local file not found!');
}

console.log('\n' + '='.repeat(60));
console.log('Next: Test in Browser');
console.log('='.repeat(60));
console.log('1. Open: http://localhost:3000/user/voice-assistant');
console.log('2. Press F12 for console');
console.log('3. Click "Test Mic" button');
console.log('4. Allow microphone access');
console.log('5. Check console for detailed logs');
console.log('='.repeat(60) + '\n');
