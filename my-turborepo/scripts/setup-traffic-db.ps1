# Traffic Simulator Database Setup Script
# This script helps you apply the SQL migrations to Supabase

Write-Host ""
Write-Host "🚦 TRAFFIC SIMULATOR DATABASE SETUP" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL files exist
$schemaFile = "database\migrations\004_traffic_simulator_schema.sql"
$seedFile = "database\seed\004_traffic_simulator_seed.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ Schema file not found: $schemaFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $seedFile)) {
    Write-Host "❌ Seed file not found: $seedFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found schema file: $schemaFile" -ForegroundColor Green
Write-Host "✅ Found seed file: $seedFile" -ForegroundColor Green
Write-Host ""

# Read the SQL content
Write-Host "📄 Reading SQL files..." -ForegroundColor Yellow
$schemaSQL = Get-Content $schemaFile -Raw
$seedSQL = Get-Content $seedFile -Raw

Write-Host "   Schema: $($schemaSQL.Length) characters" -ForegroundColor Gray
Write-Host "   Seed Data: $($seedSQL.Length) characters" -ForegroundColor Gray
Write-Host ""

# Instructions for manual setup
Write-Host "📋 SETUP INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Since we need to run these SQL scripts in Supabase, please follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  Open Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/sbqmkbomrwlgcarmyqhw" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Click 'SQL Editor' in the left sidebar" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Click 'New Query'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Copy the SCHEMA SQL:" -ForegroundColor Yellow
Write-Host "   File: $schemaFile" -ForegroundColor Gray
Write-Host "   (Opening file in notepad...)" -ForegroundColor Gray
Start-Process notepad.exe -ArgumentList $schemaFile
Start-Sleep -Seconds 2
Write-Host ""
Write-Host "5️⃣  Paste into Supabase SQL Editor and click 'RUN'" -ForegroundColor Yellow
Write-Host ""
Write-Host "6️⃣  Create another New Query" -ForegroundColor Yellow
Write-Host ""
Write-Host "7️⃣  Copy the SEED DATA SQL:" -ForegroundColor Yellow
Write-Host "   File: $seedFile" -ForegroundColor Gray
Write-Host "   (Opening file in notepad...)" -ForegroundColor Gray
Start-Process notepad.exe -ArgumentList $seedFile
Start-Sleep -Seconds 2
Write-Host ""
Write-Host "8️⃣  Paste into Supabase SQL Editor and click 'RUN'" -ForegroundColor Yellow
Write-Host ""

# Verification query
Write-Host "✅ VERIFICATION QUERY (run this after setup):" -ForegroundColor Green
Write-Host ""
Write-Host "Run the verification queries in: database\verify-traffic-simulator.sql" -ForegroundColor Gray
Write-Host ""

# Expected results
Write-Host "📊 EXPECTED RESULTS:" -ForegroundColor Cyan
Write-Host "   road_segments: 12 rows" -ForegroundColor Gray
Write-Host "   traffic_data: 150 rows" -ForegroundColor Gray
Write-Host "   road_closures: 1 row" -ForegroundColor Gray
Write-Host "   special_events: 3 rows" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 After setup, test the simulator at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/admin/simulate" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
