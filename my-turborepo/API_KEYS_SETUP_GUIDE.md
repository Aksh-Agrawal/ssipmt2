# 🔑 API Keys Setup Guide - Civic Voice Platform

**Last Updated**: November 6, 2025

This guide helps you obtain and configure all API keys needed for the Civic Voice platform.

---

## 📋 Quick Overview

| Service | Priority | Cost | Setup Time | Used For |
|---------|----------|------|------------|----------|
| **Clerk** | ✅ REQUIRED | Free tier | 5 min | Authentication |
| **Supabase** | ✅ REQUIRED | Free tier | 10 min | Database |
| **Groq** | ✅ REQUIRED | Free tier | 5 min | AI Chatbot |
| **Deepgram** | 🔴 CRITICAL | Free $200 credit | 10 min | Voice transcription |
| **SARVAM AI** | 🟠 RECOMMENDED | Contact for pricing | 15 min | Language detection |
| **Cartesia TTS** | 🟡 OPTIONAL | Free tier | 10 min | Voice responses |
| **Google Cloud** | 🟡 OPTIONAL | Free $300 credit | 20 min | Advanced NLP |
| **Twilio** | ⏳ FUTURE | Pay-as-you-go | 15 min | SMS notifications |
| **WhatsApp** | ⏳ FUTURE | Contact for pricing | 30 min | WhatsApp alerts |

**Total Setup Time**: 30-60 minutes for full functionality

---

## ✅ REQUIRED APIs (Already Configured)

### 1. Clerk Authentication ✅
**Status**: Already configured  
**Used For**: User and admin authentication  
**Current Keys**: Active in both portals

### 2. Supabase Database ✅
**Status**: Already configured  
**Used For**: PostgreSQL database with PostGIS  
**Current Keys**: Active in both portals

### 3. Groq AI ✅
**Status**: Already configured  
**Used For**: AI chatbot and auto-categorization  
**Current Keys**: Active in both portals

---

## 🔴 CRITICAL: Voice Pipeline APIs (Setup Required)

### 1. Deepgram (Speech-to-Text) 🎤

**Priority**: CRITICAL - Enables voice reporting and voice chatbot

**Steps to Get API Key**:

1. **Go to**: https://deepgram.com
2. **Sign up** with email or GitHub
3. **Get $200 free credit** (no credit card required)
4. **Create API Key**:
   - Dashboard → API Keys → Create New Key
   - Name it: "Civic Voice Platform"
   - Copy the key (starts with `...`)

5. **Add to `.env.local`**:
   ```bash
   # In apps/web-platform/.env.local
   DEEPGRAM_API_KEY=your_deepgram_key_here
   
   # In apps/admin-web/.env.local (optional)
   DEEPGRAM_API_KEY=your_deepgram_key_here
   ```

6. **Restart servers**:
   ```bash
   # Stop servers (Ctrl+C), then restart:
   npm run dev --workspace=web-platform
   npm run dev --workspace=admin-web
   ```

**Testing**:
- Go to http://localhost:3000/user/report
- Click microphone icon
- Speak: "There is a pothole on Main Road"
- Should see transcription appear! 🎉

**Pricing**:
- $200 free credit
- Then $0.0043/minute (~$0.26/hour)
- Very affordable for development

---

### 2. SARVAM AI (Language Detection) 🌐

**Priority**: RECOMMENDED - Auto-detects Hindi/Chhattisgarhi/English

**Steps to Get API Key**:

1. **Go to**: https://www.sarvam.ai/
2. **Contact them**: hello@sarvam.ai
   - Subject: "API Access for Civic Voice Platform"
   - Mention: Government civic reporting platform for Raipur, India
   - Request: Language detection API access
3. **Wait for response** (usually 1-2 business days)
4. **Get API key** from their team

5. **Add to `.env.local`**:
   ```bash
   SARVAM_API_KEY=your_sarvam_key_here
   ```

**Current Workaround**:
- System uses language selector (EN/HI/CG dropdown)
- Auto-detection not critical for MVP

**Pricing**:
- Contact SARVAM for pricing
- Usually has free tier for development

---

### 3. Cartesia TTS (Text-to-Speech) 🔊

**Priority**: OPTIONAL - Enables voice responses in chatbot

**Steps to Get API Key**:

1. **Go to**: https://cartesia.ai/
2. **Sign up** for early access
3. **Create API Key**:
   - Dashboard → API Keys → Create New
   - Copy the key

4. **Add to `.env.local`**:
   ```bash
   CARTESIA_API_KEY=your_cartesia_key_here
   ```

**Current Workaround**:
- Chatbot returns text responses only
- Voice input works, but no voice output yet

**Pricing**:
- Free tier available
- Contact for production pricing

---

## 🟡 OPTIONAL: Advanced Features

### 4. Google Cloud NLP (Entity Extraction)

**Priority**: OPTIONAL - Extracts locations, categories from voice

**Steps to Get API Key**:

1. **Go to**: https://console.cloud.google.com/
2. **Create Project**:
   - Click "Select Project" → New Project
   - Name: "Civic Voice Platform"
   
3. **Enable Natural Language API**:
   - Navigate to: APIs & Services → Library
   - Search: "Natural Language API"
   - Click "Enable"

4. **Create API Key**:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy the key

5. **Add to `.env.local`**:
   ```bash
   GOOGLE_CLOUD_API_KEY=your_google_cloud_key_here
   ```

6. **Get $300 free credit** (no charge until you upgrade)

**Current Workaround**:
- Using Groq LLM for entity extraction
- Google Cloud NLP would be more accurate

**Pricing**:
- $300 free credit
- Then $1 per 1,000 requests

---

## ⏳ FUTURE: Notification System

### 5. Twilio (SMS Notifications)

**Priority**: FUTURE - Not needed for MVP

**Steps** (when ready):
1. Go to: https://www.twilio.com
2. Sign up → Get phone number
3. Get Account SID and Auth Token
4. Add to `.env.local`

### 6. WhatsApp Business API

**Priority**: FUTURE - Not needed for MVP

**Steps** (when ready):
1. Apply at: https://business.whatsapp.com/
2. Wait for approval (can take weeks)
3. Get API credentials
4. Add to `.env.local`

---

## 🚀 Quick Start (Minimum Viable Product)

**To get voice working now, you only need**:

1. **Deepgram API Key** (10 minutes)
   - Sign up → Get $200 credit → Copy key
   - Add to `.env.local`
   - Restart server
   - Test voice reporting ✅

**That's it!** Voice transcription will work immediately.

**Optional enhancements**:
- SARVAM AI - Auto language detection (can skip, use dropdown)
- Cartesia TTS - Voice responses (can skip, use text)
- Google NLP - Advanced extraction (can skip, Groq works)

---

## 📝 Environment Files Status

### User Portal (`apps/web-platform/.env.local`)
```bash
✅ CLERK_SECRET_KEY - Configured
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Configured
✅ SUPABASE_SERVICE_ROLE_KEY - Configured
✅ GROQ_API_KEY - Configured
❌ DEEPGRAM_API_KEY - NEEDS SETUP
❌ SARVAM_API_KEY - Optional
❌ CARTESIA_API_KEY - Optional
```

### Admin Portal (`apps/admin-web/.env.local`)
```bash
✅ CLERK_SECRET_KEY - Configured
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Configured
✅ SUPABASE_SERVICE_ROLE_KEY - Configured
✅ GROQ_API_KEY - Configured
❌ DEEPGRAM_API_KEY - Optional (for admin voice)
❌ CARTESIA_API_KEY - Optional
```

---

## 🧪 Testing Voice Without API Keys

**Good news**: The platform works in "mock mode" without API keys!

**Mock Mode Features**:
- ✅ Audio recording works
- ✅ Returns sample transcription
- ✅ Report submission works
- ✅ Chatbot responds
- ⚠️ Transcription is hardcoded (not real)

**To Enable Real Voice**:
Just add Deepgram API key and restart! 🎤

---

## 🆘 Troubleshooting

### "Voice not transcribing"
- Check: Is `DEEPGRAM_API_KEY` in `.env.local`?
- Check: Did you restart the server after adding key?
- Check: Console logs for "Using mock transcription"

### "API key invalid"
- Check: No spaces before/after the key
- Check: Key is complete (no truncation)
- Try: Regenerate key in dashboard

### "Voice recording not starting"
- Check: Browser permissions for microphone
- Check: HTTPS or localhost (required for audio)
- Try: Different browser (Chrome/Edge recommended)

---

## 📞 Support Contacts

| Service | Support | Response Time |
|---------|---------|---------------|
| **Deepgram** | support@deepgram.com | 24-48 hours |
| **SARVAM AI** | hello@sarvam.ai | 1-2 business days |
| **Cartesia** | support@cartesia.ai | 24-48 hours |
| **Google Cloud** | Cloud Console Support | Instant chat |

---

## ✅ Next Steps

1. **[Priority 1]** Get Deepgram API key (10 min) → Enable voice
2. **[Priority 2]** Test voice recording on both portals
3. **[Priority 3]** (Optional) Get SARVAM AI for language detection
4. **[Priority 4]** (Optional) Get Cartesia for voice responses

**After voice works**, move to:
- Traffic simulator backend
- Connect mock data to real APIs
- Notification system

---

**Generated**: November 6, 2025  
**Platform Progress**: 80% complete, voice 70% functional  
**Estimated Time to 100%**: 40-50 hours
