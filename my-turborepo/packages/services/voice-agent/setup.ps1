# Setup script for Pipecat Voice AI Service
# Run this to install dependencies and configure the service

Write-Host "🚀 Setting up Pipecat Voice AI Service..." -ForegroundColor Green
Write-Host ""

# Check Python version
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found $pythonVersion" -ForegroundColor Green

# Create virtual environment
Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists, skipping..." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "⬆️  Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install dependencies
Write-Host "📥 Installing Python dependencies..." -ForegroundColor Cyan
Write-Host "⏳ This may take a few minutes..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found!" -ForegroundColor Yellow
    Write-Host "📝 Creating template .env file..." -ForegroundColor Cyan
    
    @"
# Daily.co WebRTC Transport
DAILY_API_KEY=your_daily_api_key_here

# Speech-to-Text (Deepgram)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Language Model (Groq recommended for speed)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Or use Gemini instead:
# GEMINI_API_KEY=your_gemini_api_key_here

# Text-to-Speech (Cartesia)
CARTESIA_API_KEY=your_cartesia_api_key_here

# Optional: Supabase for database access
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8001
LOG_LEVEL=INFO
LOG_DIR=logs
"@ | Out-File -FilePath ".env" -Encoding utf8
    
    Write-Host "✅ Template .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and add your API keys!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required API keys:" -ForegroundColor Cyan
    Write-Host "  1. DAILY_API_KEY - Get from https://dashboard.daily.co" -ForegroundColor White
    Write-Host "  2. DEEPGRAM_API_KEY - Get from https://console.deepgram.com" -ForegroundColor White
    Write-Host "  3. GROQ_API_KEY - Get from https://console.groq.com" -ForegroundColor White
    Write-Host "  4. CARTESIA_API_KEY - Get from https://play.cartesia.ai" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "✅ Created logs directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env file with your API keys" -ForegroundColor White
Write-Host "  2. Run: python api.py" -ForegroundColor White
Write-Host "  3. Test: curl http://localhost:8001/health" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Cyan
