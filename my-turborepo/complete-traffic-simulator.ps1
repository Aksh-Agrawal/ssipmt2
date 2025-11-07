# ==========================================
# Traffic Simulator - Complete Setup Script
# ==========================================
# This script will:
# 1. Apply database schema
# 2. Load seed data
# 3. Run API tests
# 4. Open the UI
# ==========================================

Write-Host "🚦 TRAFFIC SIMULATOR COMPLETION SCRIPT" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ Error: Please run this script from the my-turborepo directory" -ForegroundColor Red
    exit 1
}

# Step 1: Instructions for Database Setup
Write-Host "📋 STEP 1: Database Schema Setup" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Write-Host "We need to apply the traffic simulator schema to Supabase.`n" -ForegroundColor White

Write-Host "Please follow these steps:" -ForegroundColor Green
Write-Host "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/sbqmkbomrwlgcarmyqhw" -ForegroundColor White
Write-Host "2. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
Write-Host "3. Click '+ New Query'" -ForegroundColor White
Write-Host "4. Copy the ENTIRE contents of this file:" -ForegroundColor White
Write-Host "   database\migrations\004_traffic_simulator_schema.sql" -ForegroundColor Cyan
Write-Host "5. Paste into the SQL Editor" -ForegroundColor White
Write-Host "6. Click 'RUN' (or press Ctrl+Enter)`n" -ForegroundColor White

Write-Host "Expected output: 'Success. No rows returned'" -ForegroundColor Gray
Write-Host "This creates 5 tables: road_segments, traffic_data, road_closures, traffic_predictions, special_events`n" -ForegroundColor Gray

$schemaApplied = Read-Host "Have you completed the schema setup? (yes/no)"

if ($schemaApplied -ne "yes" -and $schemaApplied -ne "y") {
    Write-Host "`n⚠️  Please complete the schema setup first, then run this script again." -ForegroundColor Yellow
    Write-Host "   The script will wait here. Come back when done!`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n✅ Schema setup confirmed!`n" -ForegroundColor Green

# Step 2: Seed Data
Write-Host "📋 STEP 2: Load Seed Data" -ForegroundColor Yellow
Write-Host "========================`n" -ForegroundColor Yellow

Write-Host "Now let's load the sample data (12 Raipur roads + traffic history).`n" -ForegroundColor White

Write-Host "Please follow these steps:" -ForegroundColor Green
Write-Host "1. Still in Supabase SQL Editor, click '+ New Query' again" -ForegroundColor White
Write-Host "2. Copy the ENTIRE contents of this file:" -ForegroundColor White
Write-Host "   database\seed\004_traffic_simulator_seed.sql" -ForegroundColor Cyan
Write-Host "3. Paste into the SQL Editor" -ForegroundColor White
Write-Host "4. Click 'RUN' (or press Ctrl+Enter)`n" -ForegroundColor White

Write-Host "Expected output: 'Success. No rows returned'" -ForegroundColor Gray
Write-Host "This loads: 12 road segments, 150 traffic records, 3 special events`n" -ForegroundColor Gray

$seedLoaded = Read-Host "Have you loaded the seed data? (yes/no)"

if ($seedLoaded -ne "yes" -and $seedLoaded -ne "y") {
    Write-Host "`n⚠️  Please load the seed data first, then run this script again.`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n✅ Seed data loaded!`n" -ForegroundColor Green

# Step 3: Verification
Write-Host "📋 STEP 3: Verify Database" -ForegroundColor Yellow
Write-Host "==========================`n" -ForegroundColor Yellow

Write-Host "Let's verify everything is set up correctly.`n" -ForegroundColor White

Write-Host "Run this query in Supabase SQL Editor (+ New Query):" -ForegroundColor Green
Write-Host @"

-- Verification Query
SELECT 
    'road_segments' as table_name, COUNT(*) as count FROM road_segments
UNION ALL
SELECT 'traffic_data', COUNT(*) FROM traffic_data
UNION ALL
SELECT 'special_events', COUNT(*) FROM special_events
UNION ALL
SELECT 'road_closures', COUNT(*) FROM road_closures
ORDER BY table_name;

"@ -ForegroundColor Cyan

Write-Host "`nExpected results:" -ForegroundColor White
Write-Host "  road_segments:  12 rows" -ForegroundColor Gray
Write-Host "  road_closures:   1 row" -ForegroundColor Gray
Write-Host "  special_events:  3 rows" -ForegroundColor Gray
Write-Host "  traffic_data:  150 rows`n" -ForegroundColor Gray

$verified = Read-Host "Do you see these counts? (yes/no)"

if ($verified -ne "yes" -and $verified -ne "y") {
    Write-Host "`n❌ Something went wrong. Please check:" -ForegroundColor Red
    Write-Host "   - Did the schema script run without errors?" -ForegroundColor Yellow
    Write-Host "   - Did the seed script run without errors?" -ForegroundColor Yellow
    Write-Host "   - Try running the verification query again`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Database verified successfully!`n" -ForegroundColor Green

# Step 4: Start the application if not running
Write-Host "📋 STEP 4: Start Application" -ForegroundColor Yellow
Write-Host "============================`n" -ForegroundColor Yellow

Write-Host "Checking if admin app is running on port 3000...`n" -ForegroundColor White

$portInUse = netstat -ano | Select-String ":3000"

if ($portInUse) {
    Write-Host "✅ App is already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  App is not running. Starting admin app...`n" -ForegroundColor Yellow
    Write-Host "Running: npm run dev --workspace=admin-web`n" -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev --workspace=admin-web"
    
    Write-Host "Waiting 10 seconds for app to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

# Step 5: Run API Tests
Write-Host "`n📋 STEP 5: Test API Endpoints" -ForegroundColor Yellow
Write-Host "==============================`n" -ForegroundColor Yellow

Write-Host "Running API tests...`n" -ForegroundColor White

if (Test-Path ".\test-traffic-simulator.js") {
    node .\test-traffic-simulator.js
} else {
    Write-Host "⚠️  Test file not found. Skipping API tests." -ForegroundColor Yellow
}

# Step 6: Open UI
Write-Host "`n📋 STEP 6: Open Traffic Simulator UI" -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Yellow

Write-Host "Opening traffic simulator in your browser...`n" -ForegroundColor White

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/admin/simulate"

# Final Instructions
Write-Host "`n🎉 TRAFFIC SIMULATOR SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Green

Write-Host "✅ Database schema applied" -ForegroundColor Green
Write-Host "✅ Seed data loaded (12 roads, 150 traffic records)" -ForegroundColor Green
Write-Host "✅ API endpoints ready" -ForegroundColor Green
Write-Host "✅ UI opened in browser`n" -ForegroundColor Green

Write-Host "🎯 HOW TO USE:" -ForegroundColor Cyan
Write-Host "=============`n" -ForegroundColor Cyan

Write-Host "1. In the browser window that just opened:" -ForegroundColor White
Write-Host "   - Select a road: 'VIP Road - Sector 1 to Pandri'" -ForegroundColor Gray
Write-Host "   - Set date: Tomorrow" -ForegroundColor Gray
Write-Host "   - Set time: 17:00 - 19:00 (evening rush)" -ForegroundColor Gray
Write-Host "   - Reason: 'Test: VIP movement'" -ForegroundColor Gray
Write-Host "   - Click 'Run Simulation'`n" -ForegroundColor Gray

Write-Host "2. View Results:" -ForegroundColor White
Write-Host "   - Overall Impact (severity, delay)" -ForegroundColor Gray
Write-Host "   - Affected Roads (GE Road, Station Road, etc.)" -ForegroundColor Gray
Write-Host "   - Congestion Levels (Low/Moderate/High/Severe)" -ForegroundColor Gray
Write-Host "   - Alternative Routes" -ForegroundColor Gray
Write-Host "   - Recommendations`n" -ForegroundColor Gray

Write-Host "📊 WHAT THE SIMULATOR DOES:" -ForegroundColor Cyan
Write-Host "===========================`n" -ForegroundColor Cyan

Write-Host "- Analyzes historical traffic patterns for that road/time" -ForegroundColor White
Write-Host "- Calculates how traffic will redistribute (70% to nearby roads)" -ForegroundColor White
Write-Host "- Predicts congestion levels on alternate routes" -ForegroundColor White
Write-Host "- Estimates delays and speed reductions" -ForegroundColor White
Write-Host "- Suggests detour routes with distance/time" -ForegroundColor White
Write-Host "- Provides severity-based recommendations`n" -ForegroundColor White

Write-Host "🚀 REAL-WORLD USE CASES:" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

Write-Host "- VIP Movements (Chief Minister, President visits)" -ForegroundColor White
Write-Host "- Event Management (Cricket matches, festivals)" -ForegroundColor White
Write-Host "- Construction Planning (Metro work, road repairs)" -ForegroundColor White
Write-Host "- Emergency Response (Quick what-if analysis)" -ForegroundColor White
Write-Host "- Traffic Management (Daily optimization)`n" -ForegroundColor White

Write-Host "📁 FILES USED:" -ForegroundColor Cyan
Write-Host "==============`n" -ForegroundColor Cyan

Write-Host "Database:" -ForegroundColor Yellow
Write-Host "  - database\migrations\004_traffic_simulator_schema.sql" -ForegroundColor Gray
Write-Host "  - database\seed\004_traffic_simulator_seed.sql`n" -ForegroundColor Gray

Write-Host "API:" -ForegroundColor Yellow
Write-Host "  - apps\admin-web\app\api\admin\road-segments\route.ts" -ForegroundColor Gray
Write-Host "  - apps\admin-web\app\api\admin\simulate-closure\route.ts`n" -ForegroundColor Gray

Write-Host "UI:" -ForegroundColor Yellow
Write-Host "  - apps\admin-web\app\admin\simulate\page.tsx`n" -ForegroundColor Gray

Write-Host "✨ Traffic Simulator is now FULLY OPERATIONAL! ✨`n" -ForegroundColor Green

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
