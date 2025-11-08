# Pipecat Voice AI Service

WebRTC-based voice assistant using Pipecat framework for real-time voice conversations.

## 🏗️ Architecture

```
User Browser (Daily.co Client)
    ↓ WebRTC
Daily.co Room
    ↓ WebRTC
Pipecat Bot (Python)
    ├── Silero VAD (Voice Activity Detection)
    ├── Deepgram STT (Speech-to-Text)
    ├── Groq/Gemini LLM (Language Model)
    └── Cartesia TTS (Text-to-Speech)
```

## 📋 Prerequisites

- Python 3.11+
- Daily.co API Key
- Deepgram API Key
- Groq API Key (or Gemini API Key)
- Cartesia API Key

## 🚀 Installation

### 1. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
# Daily.co WebRTC Transport
DAILY_API_KEY=your_daily_api_key_here

# Speech-to-Text (Deepgram)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Language Model (Groq recommended)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Or use Gemini instead:
# GEMINI_API_KEY=your_gemini_api_key_here

# Text-to-Speech (Cartesia)
CARTESIA_API_KEY=your_cartesia_api_key_here

# Optional: Supabase for database access
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🎯 Running the Service

### Option 1: Run API Server (Recommended)

```bash
# Start the FastAPI server
python api.py

# Server runs on http://localhost:8001
# Endpoints:
# - POST /voice/connect - Create voice session
# - GET /voice/status - Check active sessions
# - GET /health - Health check
```

### Option 2: Run Bot Directly (Testing)

```bash
# You need to manually create a Daily.co room first
python pipecat_bot.py -u <room_url> -t <token> -l en
```

## 🧪 Testing

### 1. Test Health Check

```bash
curl http://localhost:8001/health
```

### 2. Create Voice Session

```bash
curl -X POST http://localhost:8001/voice/connect \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

Response:
```json
{
  "room_url": "https://your-domain.daily.co/room-name",
  "token": "eyJ...",
  "bot_id": "bot_1234567890",
  "language": "en"
}
```

### 3. Join the Room

Use the `room_url` and `token` to connect from the frontend using Daily.co client SDK.

## 🎙️ Supported Languages

- `en` - English
- `hi` - Hindi (हिंदी)
- `cg` - Chhattisgarhi (छत्तीसगढ़ी)

## 📊 Features

- ✅ **Real-time WebRTC** - Sub-2-second latency
- ✅ **Voice Activity Detection** - Automatic speech detection
- ✅ **Multilingual** - English, Hindi, Chhattisgarhi
- ✅ **Interruption Support** - User can interrupt bot
- ✅ **Context Management** - Maintains conversation history
- ✅ **Civic Engagement** - Specialized for Smart City queries

## 🔧 Configuration Options

Edit `config.py` to customize:

- VAD parameters (confidence, volume thresholds)
- TTS voice and model
- Logging settings
- API server host/port

## 📝 Logs

Logs are saved to `logs/` directory:
- `pipecat_voice_*.log` - Bot session logs
- API logs to stderr

## 🐛 Troubleshooting

### Bot subprocess dies immediately

Check logs in `logs/pipecat_voice_*.log` for errors.

### No audio output

- Verify Cartesia API key is valid
- Check browser microphone/speaker permissions
- Ensure Daily.co room is active

### Connection issues

- Verify Daily.co API key is valid
- Check network firewall settings
- Test with `/health` endpoint

## 📚 API Documentation

Visit http://localhost:8001/docs for interactive API documentation (Swagger UI).

## 🚀 Deployment

For production deployment:

1. Use a process manager (PM2, supervisor)
2. Set up HTTPS reverse proxy (nginx)
3. Configure environment variables properly
4. Enable logging and monitoring
5. Set up automatic restarts

Example with PM2:
```bash
pm2 start api.py --name voice-ai --interpreter python
pm2 save
pm2 startup
```

## 🔐 Security

- Never commit API keys to version control
- Use environment variables for all secrets
- Implement rate limiting in production
- Use HTTPS for all connections
- Validate user inputs

## 📈 Performance

- Latency: <2 seconds end-to-end
- Concurrent sessions: Limited by Daily.co plan
- Memory: ~200MB per bot instance
- CPU: Minimal (most processing is API calls)

## 🆘 Support

For issues:
1. Check logs in `logs/` directory
2. Verify all API keys are set
3. Test with `/health` endpoint
4. Review Pipecat documentation: https://docs.pipecat.ai/
