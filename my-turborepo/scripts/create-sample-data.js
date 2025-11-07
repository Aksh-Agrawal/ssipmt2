/**
 * Create Sample Data Script
 * 
 * This script creates sample reports in the database for testing.
 * Run this while logged in to either portal to populate data.
 * 
 * Usage:
 * 1. Open http://localhost:3000 or http://localhost:3002
 * 2. Make sure you're logged in
 * 3. Open browser console (F12)
 * 4. Copy and paste this entire script
 * 5. It will create 10 sample reports automatically
 */

(async function createSampleData() {
  console.log('🚀 Starting sample data creation...\n');

  const sampleReports = [
    {
      description: "Large pothole causing severe vehicle damage on Main Road near City Hospital. Multiple complaints from residents.",
      category: "Potholes",
      priority: "Critical",
      location: { lat: 21.2514, lng: 81.6296 },
      address: "Main Road, Civil Lines, Raipur",
      area: "Civil Lines",
      landmark: "Near City Hospital Main Entrance",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "मुख्य सड़क पर स्ट्रीटलाइट 3 दिन से काम नहीं कर रही है। रात में बहुत अंधेरा हो जाता है।",
      category: "Streetlights",
      priority: "High",
      location: { lat: 21.2497, lng: 81.6295 },
      address: "Station Road, Raipur",
      area: "Station Road",
      landmark: "Bus Stop 12",
      photos: [],
      input_method: "voice",
      input_language: "hi",
      voice_transcription: "मुख्य सड़क पर स्ट्रीटलाइट 3 दिन से काम नहीं कर रही है"
    },
    {
      description: "Garbage not collected for 2 weeks in Sector 5. Creating serious health hazard with foul smell.",
      category: "Garbage",
      priority: "High",
      location: { lat: 21.2450, lng: 81.6340 },
      address: "Sector 5, Devendra Nagar, Raipur",
      area: "Devendra Nagar",
      landmark: "Near Community Center",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "Water supply completely stopped since yesterday morning. Entire colony affected.",
      category: "Water Supply",
      priority: "Critical",
      location: { lat: 21.2380, lng: 81.6420 },
      address: "Shankar Nagar, Raipur",
      area: "Shankar Nagar",
      landmark: "Block C",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "Traffic signal malfunctioning at VIP Road junction causing major congestion during peak hours.",
      category: "Traffic Signal",
      priority: "High",
      location: { lat: 21.2560, lng: 81.6390 },
      address: "VIP Road Junction, Raipur",
      area: "VIP Road",
      landmark: "Near City Mall",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "Broken footpath tiles near bus stand. Senior citizens and children at risk of injury.",
      category: "Other",
      priority: "Medium",
      location: { lat: 21.2500, lng: 81.6300 },
      address: "Bus Stand Road, Raipur",
      area: "Bus Stand",
      landmark: "Platform 3",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "पानी की पाइप लाइन फूट गई है। सड़क पर पानी भर गया है।",
      category: "Water Supply",
      priority: "High",
      location: { lat: 21.2420, lng: 81.6370 },
      address: "Pandri Road, Raipur",
      area: "Pandri",
      landmark: "Petrol Pump के पास",
      photos: [],
      input_method: "voice",
      input_language: "hi",
      voice_transcription: "पानी की पाइप लाइन फूट गई है सड़क पर पानी भर गया है"
    },
    {
      description: "Multiple streetlights not working in colony. Safety concern for residents at night.",
      category: "Streetlights",
      priority: "Medium",
      location: { lat: 21.2350, lng: 81.6450 },
      address: "Kota, Raipur",
      area: "Kota",
      landmark: "Near School",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "Deep pothole on GE Road causing traffic jam. Vehicles having to take detour.",
      category: "Potholes",
      priority: "High",
      location: { lat: 21.2480, lng: 81.6320 },
      address: "GE Road, Raipur",
      area: "GE Road",
      landmark: "Near Magneto Mall",
      photos: [],
      input_method: "text",
      input_language: "en"
    },
    {
      description: "Garbage bins overflowing for days. Stray dogs spreading waste on road.",
      category: "Garbage",
      priority: "Medium",
      location: { lat: 21.2400, lng: 81.6360 },
      address: "Shastri Market, Raipur",
      area: "Shastri Market",
      landmark: "Market Square",
      photos: [],
      input_method: "text",
      input_language: "en"
    }
  ];

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < sampleReports.length; i++) {
    const report = sampleReports[i];
    console.log(`📝 Creating report ${i + 1}/${sampleReports.length}...`);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        successCount++;
        const uniqueId = result.data?.unique_id || result.data?.id?.substring(0, 8);
        console.log(`✅ Created: ${uniqueId} - ${report.description.substring(0, 50)}...`);
        results.push({ success: true, id: uniqueId, description: report.description });
      } else {
        errorCount++;
        console.error(`❌ Failed: ${result.error || 'Unknown error'}`);
        results.push({ success: false, error: result.error, description: report.description });
      }
      
      // Wait 300ms between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error: ${error.message}`);
      results.push({ success: false, error: error.message, description: report.description });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${successCount} reports`);
  console.log(`❌ Failed: ${errorCount} reports`);
  console.log('\n🔄 Refreshing page to show new data...\n');
  
  // Show results table
  console.table(results.map((r, i) => ({
    '#': i + 1,
    Status: r.success ? '✅' : '❌',
    ID: r.id || 'N/A',
    Description: r.description.substring(0, 40) + '...',
    Error: r.error || ''
  })));

  if (successCount > 0) {
    console.log('\n✨ Sample data created successfully!');
    console.log('🔄 Refreshing page in 3 seconds...\n');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } else {
    console.log('\n⚠️ No reports were created. Please check:');
    console.log('   1. Are you logged in?');
    console.log('   2. Is the API server running?');
    console.log('   3. Check browser console for detailed errors');
  }
})();
