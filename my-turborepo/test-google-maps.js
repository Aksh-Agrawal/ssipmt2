#!/usr/bin/env node

/**
 * Google Maps Integration Test
 * Tests the admin traffic map endpoints
 */

const BASE_URL = 'http://localhost:3002';

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`);
      console.log(`   📊 Data:`, JSON.stringify(data).substring(0, 100) + '...');
      return true;
    } else {
      console.log(`   ❌ Failed (${response.status})`);
      console.log(`   Error:`, data.error || data);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🗺️  Google Maps Integration Test\n');
  console.log('=' .repeat(50));
  
  // Test 1: Road Closures API
  await testEndpoint(
    'Road Closures API',
    `${BASE_URL}/api/road-closures`
  );
  
  // Test 2: Traffic Heatmap API
  await testEndpoint(
    'Traffic Heatmap API',
    `${BASE_URL}/api/traffic/heatmap`
  );
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Next Steps:\n');
  console.log('1. Get Google Maps API Key:');
  console.log('   → Visit: https://console.cloud.google.com/');
  console.log('   → Enable: Maps JavaScript API');
  console.log('   → Create API Key with restrictions');
  console.log('');
  console.log('2. Add to .env.local:');
  console.log('   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here');
  console.log('');
  console.log('3. Start admin dev server:');
  console.log('   cd apps/admin-web');
  console.log('   npm run dev');
  console.log('');
  console.log('4. Open in browser:');
  console.log('   http://localhost:3002/admin/traffic-map');
  console.log('');
  console.log('✨ Expected Result:');
  console.log('   - Interactive Google Map centered on Raipur');
  console.log('   - Traffic layer showing live traffic (green/yellow/red roads)');
  console.log('   - Heatmap overlay with your traffic data');
  console.log('   - Markers for road closures from database');
  console.log('   - Click markers to see details');
  console.log('');
}

runTests().catch(console.error);
