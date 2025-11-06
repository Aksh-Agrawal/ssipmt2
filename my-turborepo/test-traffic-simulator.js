/**
 * Test Traffic Simulator API Endpoints
 * Run after database setup is complete
 */

const API_BASE = 'http://localhost:3000/api/admin';

console.log('🚦 TRAFFIC SIMULATOR API TESTS');
console.log('===============================\n');

async function testRoadSegments() {
  console.log('📍 Test 1: GET /api/admin/road-segments');
  console.log('   Fetching available road segments...');
  
  try {
    const response = await fetch(`${API_BASE}/road-segments`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success! Found ${data.segments?.length || 0} road segments`);
      
      if (data.segments && data.segments.length > 0) {
        console.log('\n   Sample segments:');
        data.segments.slice(0, 3).forEach(seg => {
          console.log(`   - ${seg.road_name}: ${seg.start_point} → ${seg.end_point} (${seg.length_km} km)`);
        });
      }
      
      return data.segments;
    } else {
      console.log(`   ❌ Failed: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function testSimulation(segments) {
  console.log('\n🔮 Test 2: POST /api/admin/simulate-closure');
  console.log('   Running traffic simulation...');
  
  if (!segments || segments.length === 0) {
    console.log('   ⚠️  Skipped: No segments available');
    return;
  }
  
  // Use first VIP Road segment for simulation
  const testSegment = segments.find(s => s.road_name === 'VIP Road') || segments[0];
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];
  
  const simulationRequest = {
    road_segment_id: testSegment.id,
    closure_reason: 'Test: VIP movement - Chief Minister visit',
    closure_date: dateString,
    start_time: '17:00',
    end_time: '19:00'
  };
  
  console.log(`   Closing: ${testSegment.road_name} (${testSegment.start_point} → ${testSegment.end_point})`);
  console.log(`   Time: ${dateString} 17:00-19:00 (evening rush)`);
  
  try {
    const response = await fetch(`${API_BASE}/simulate-closure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulationRequest)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Simulation complete!\n');
      
      // Display results
      console.log('   📊 OVERALL IMPACT:');
      console.log(`   - Severity: ${data.overall_impact.severity.toUpperCase()}`);
      console.log(`   - Affected segments: ${data.overall_impact.total_affected_segments}`);
      console.log(`   - Average delay: ${data.overall_impact.avg_delay_minutes} minutes`);
      console.log(`   - Recommendation: ${data.overall_impact.recommendation}`);
      
      if (data.affected_segments && data.affected_segments.length > 0) {
        console.log('\n   🚗 AFFECTED ROADS:');
        data.affected_segments.slice(0, 3).forEach(seg => {
          console.log(`   - ${seg.name}`);
          console.log(`     Congestion: ${seg.predicted_congestion.toUpperCase()}`);
          console.log(`     Speed: ${seg.normal_speed} → ${seg.predicted_speed} km/h`);
          console.log(`     Delay: +${seg.predicted_delay_minutes} min`);
        });
      }
      
      if (data.alternative_routes && data.alternative_routes.length > 0) {
        console.log('\n   🗺️  ALTERNATIVE ROUTES:');
        data.alternative_routes.forEach(route => {
          console.log(`   - ${route.route}`);
          console.log(`     Distance: ${route.distance_km} km, Time: ${route.estimated_time_minutes} min`);
          console.log(`     Traffic increase: ${route.traffic_increase}`);
        });
      }
      
      console.log(`\n   🆔 Simulation ID: ${data.simulation_id}`);
      
      return data;
    } else {
      console.log(`   ❌ Failed: ${data.error || 'Unknown error'}`);
      if (data.details) {
        console.log(`   Details: ${data.details}`);
      }
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('⚡ Starting API tests...\n');
  console.log('Make sure:');
  console.log('1. Database schema is applied in Supabase');
  console.log('2. Seed data is loaded');
  console.log('3. Admin app is running on http://localhost:3000\n');
  
  // Small delay to let user read
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 1: Load road segments
  const segments = await testRoadSegments();
  
  // Test 2: Run simulation
  if (segments && segments.length > 0) {
    await testSimulation(segments);
  }
  
  console.log('\n✅ Tests complete!');
  console.log('\n🎯 Next steps:');
  console.log('1. Open http://localhost:3000/admin/simulate in browser');
  console.log('2. Select a road segment');
  console.log('3. Set closure details');
  console.log('4. Click "Run Simulation"');
  console.log('5. View the results!\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
