# Clerk Setup Verification Script
# Run this after you've added your Clerk keys to .env.local files

Write-Host "🔍 Checking Clerk Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local files exist
$webPlatformEnv = "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform\.env.local"
$adminWebEnv = "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web\.env.local"

Write-Host "📁 Checking for environment files..." -ForegroundColor Yellow

if (Test-Path $webPlatformEnv) {
    Write-Host "✅ User Portal .env.local found" -ForegroundColor Green
    
    # Check if it has Clerk keys
    $content = Get-Content $webPlatformEnv -Raw
    if ($content -match "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_") {
        Write-Host "   ✅ Has Clerk publishable key" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing or invalid Clerk publishable key" -ForegroundColor Red
    }
    
    if ($content -match "CLERK_SECRET_KEY=sk_test_") {
        Write-Host "   ✅ Has Clerk secret key" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing or invalid Clerk secret key" -ForegroundColor Red
    }
} else {
    Write-Host "❌ User Portal .env.local NOT FOUND" -ForegroundColor Red
    Write-Host "   Create it at: $webPlatformEnv" -ForegroundColor Yellow
}

Write-Host ""

if (Test-Path $adminWebEnv) {
    Write-Host "✅ Admin Portal .env.local found" -ForegroundColor Green
    
    # Check if it has Clerk keys
    $content = Get-Content $adminWebEnv -Raw
    if ($content -match "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_") {
        Write-Host "   ✅ Has Clerk publishable key" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing or invalid Clerk publishable key" -ForegroundColor Red
    }
    
    if ($content -match "CLERK_SECRET_KEY=sk_test_") {
        Write-Host "   ✅ Has Clerk secret key" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing or invalid Clerk secret key" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Admin Portal .env.local NOT FOUND" -ForegroundColor Red
    Write-Host "   Create it at: $adminWebEnv" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. If files are missing, create them using the templates in CLERK_SETUP_GUIDE.md"
Write-Host "2. Add your Clerk keys from https://dashboard.clerk.com/"
Write-Host "3. Run this script again to verify"
Write-Host "4. Start your applications with: npm run dev --workspace=web-platform"
Write-Host ""
Write-Host "📚 Full guide: CLERK_SETUP_GUIDE.md" -ForegroundColor Green
