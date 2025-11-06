# 🤖 AI Agent Sequence for Civic Voice Platform

## Overview
This document outlines the sequence of AI agents and services used in the Civic Voice platform for processing voice queries, generating responses, and managing civic information.

---

## 🎙️ Voice Query Processing Pipeline

### Agent Sequence for Incoming Voice Queries

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER SPEAKS (Audio Input)                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 1: Language Detection (SARVAM AI)                         │
│ ─────────────────────────────────────────────────────────────── │
│ • Input: Raw audio buffer                                       │
│ • Process: Analyze audio to detect language                     │
│ • Output: Language code ('en', 'hi', 'cg')                     │
│ • Fallback: Default to 'en' if detection fails                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 2: Speech-to-Text (Deepgram STT)                          │
│ ─────────────────────────────────────────────────────────────── │
│ • Input: Audio buffer + detected language                       │
│ • Process: Transcribe speech using language-specific model     │
│ • Models: English, Hindi, Chhattisgarhi                        │
│ • Output: Transcribed text string                              │
│ • Features: Real-time streaming, punctuation, formatting       │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 3: NLP Processing (Google Cloud Natural Language)         │
│ ─────────────────────────────────────────────────────────────── │
│ • Input: Transcribed text                                       │
│ • Process 1: Extract Intent                                     │
│   - traffic: Traffic-related queries                            │
│   - garbage: Waste management queries                           │
│   - roadwork: Construction/closure updates                      │
│   - emergency: Emergency contact information                    │
│   - general: General civic information                          │
│ • Process 2: Extract Entities                                   │
│   - Location: "Station Road", "VIP Road", "Downtown"           │
│   - Time: "today", "tomorrow", "this week"                     │
│   - Category: "pothole", "streetlight", "water"               │
│ • Process 3: Extract Keywords                                   │
│   - Key terms for knowledge base search                         │
│ • Output: Intent + Entities + Keywords (structured JSON)        │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 4: Intent Router (Custom Logic)                           │
│ ─────────────────────────────────────────────────────────────── │
│ • Input: Intent + Entities from NLP                             │
│ • Decision Tree:                                                │
│   ┌─ Intent: "traffic" → Call Traffic API (Agent 5A)           │
│   ├─ Intent: "garbage" → Search Knowledge Base (Agent 5B)      │
│   ├─ Intent: "roadwork" → Query Events DB (Agent 5C)          │
│   ├─ Intent: "emergency" → Return Emergency Contacts           │
│   └─ Intent: "general" → Search Knowledge Base + LLM          │
│ • Output: Route to appropriate data source                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌──────────────────────┬──────────────┬──────────────────────────┐
│                      │              │                          │
│  AGENT 5A:           │  AGENT 5B:   │  AGENT 5C:              │
│  Traffic API         │  Knowledge   │  Events Database         │
│  (Google Maps)       │  Base Search │  (PostgreSQL)            │
│  ──────────────────  │  ─────────── │  ─────────────────────── │
│  • Real-time traffic │  • Redis     │  • Road closures         │
│  • Congestion levels │  • Vector    │  • Construction schedule │
│  • Travel time       │    search    │  • Event data            │
│  • Alternative routes│  • Semantic  │  • Historical patterns   │
│                      │    matching  │                          │
└──────────────────────┴──────┬───────┴──────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 6: Response Generation (Groq LLM)                         │
│ ─────────────────────────────────────────────────────────────── │
│ • Model: llama-3.1-70b-versatile                               │
│ • Input: Retrieved data + user context + language preference   │
│ • System Prompt:                                                │
│   "You are a helpful civic assistant for Raipur city.          │
│    Provide clear, concise answers about traffic, civic         │
│    services, and city information. Respond in {language}."     │
│ • Process:                                                      │
│   1. Format data into natural language                         │
│   2. Add context (time, location)                              │
│   3. Ensure language consistency                               │
│   4. Keep responses conversational                             │
│ • Output: Natural language response text                        │
│ • Fallback: Template-based response if LLM fails              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT 7: Text-to-Speech (Criteria TTS / Cartesia)               │
│ ─────────────────────────────────────────────────────────────── │
│ • Input: Response text + language                               │
│ • Voice Selection:                                              │
│   - English: Natural English voice                              │
│   - Hindi: Native Hindi voice                                   │
│   - Chhattisgarhi: Regional Chhattisgarhi voice                │
│ • Process: Synthesize speech with natural intonation           │
│ • Output: Audio buffer (streaming)                              │
│ • Format: PCM 16kHz, mono                                       │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     AUDIO OUTPUT TO USER                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Agent Details

### AGENT 1: SARVAM AI (Language Detection)
**Purpose**: Detect the language of incoming audio  
**Service**: SARVAM AI Language Detection API  
**API Endpoint**: `POST /api/v1/language-detect`  
**Input**: Audio buffer (WAV, MP3, or raw PCM)  
**Output**: Language code (`en`, `hi`, `cg`, etc.)  
**Latency**: ~100-200ms  
**Fallback**: Default to English (`en`)  

**Implementation File**: `packages/services/agent/src/sarvamAiService.ts`

---

### AGENT 2: Deepgram (Speech-to-Text)
**Purpose**: Convert speech to text with high accuracy  
**Service**: Deepgram STT API  
**API Endpoint**: `wss://api.deepgram.com/v1/listen`  
**Features**:
- Real-time streaming
- Multi-language support
- Automatic punctuation
- Speaker diarization

**Models**:
- English: `nova-2`
- Hindi: `nova-2-hindi`
- General: `nova-2-general`

**Input**: Audio stream + language parameter  
**Output**: Transcribed text with confidence scores  
**Latency**: ~200-500ms  

**Implementation File**: `packages/services/agent/src/deepgramSttService.ts`

---

### AGENT 3: Google Cloud NLP (Natural Language Processing)
**Purpose**: Extract intent, entities, and keywords  
**Service**: Google Cloud Natural Language API  
**API Endpoint**: `POST https://language.googleapis.com/v1/documents:analyzeEntities`  

**Functions**:
1. **Intent Classification**:
   - Uses sentiment + entity analysis
   - Custom rules for civic domain

2. **Entity Extraction**:
   - Locations (roads, landmarks)
   - Temporal expressions (today, tomorrow)
   - Categories (garbage, traffic, roads)

3. **Keyword Extraction**:
   - Salient terms for search
   - Ranking by relevance

**Input**: Text string (transcription)  
**Output**: JSON with intent, entities, keywords  
**Latency**: ~300-500ms  

**Implementation File**: `packages/services/agent/src/nlpService.ts`

---

### AGENT 4: Intent Router (Custom Logic)
**Purpose**: Route queries to appropriate data sources  
**Service**: Custom Node.js routing logic  
**Decision Logic**:

```typescript
if (intent === 'traffic') {
  return await getTrafficData(entities.location);
} else if (intent === 'garbage' || intent === 'schedule') {
  return await searchKnowledgeBase(keywords);
} else if (intent === 'roadwork' || intent === 'closure') {
  return await queryEventsDatabase(entities.location);
} else {
  return await searchKnowledgeBase(keywords) + await generateLLMResponse();
}
```

**Implementation File**: `packages/services/agent/src/pipecatProcessors.ts`

---

### AGENT 5A: Traffic API (Google Maps)
**Purpose**: Real-time traffic information  
**Service**: Google Maps Traffic API  
**API Endpoint**: `https://maps.googleapis.com/maps/api/directions/json`  

**Data Returned**:
- Current traffic conditions
- Travel time estimates
- Congestion levels
- Alternative routes

**Implementation File**: `packages/services/agent/src/trafficService.ts`

---

### AGENT 5B: Knowledge Base Search (Redis + Vector Search)
**Purpose**: Search civic information knowledge base  
**Service**: Upstash Redis + OpenAI Embeddings  

**Process**:
1. Generate query embedding (OpenAI text-embedding-3-small)
2. Semantic search in Redis vector database
3. Retrieve top-k relevant articles
4. Rank by relevance

**Data Sources**:
- Garbage collection schedules
- Water supply timings
- Emergency contacts
- Municipal services info

**Implementation Files**:
- `packages/services/agent/src/vectorSearch.ts`
- `packages/services/knowledge/src/index.ts`

---

### AGENT 5C: Events Database (PostgreSQL)
**Purpose**: Query planned events and road closures  
**Service**: Supabase (PostgreSQL)  
**Tables**: `traffic_events`, `reports`  

**Query Types**:
- Active road closures
- Upcoming construction
- Historical incident data

**Implementation**: Direct Supabase queries in API routes

---

### AGENT 6: Groq LLM (Response Generation)
**Purpose**: Generate natural, conversational responses  
**Service**: Groq Cloud (llama-3.1-70b-versatile)  
**API Endpoint**: `https://api.groq.com/openai/v1/chat/completions`  

**Configuration**:
```typescript
{
  model: "llama-3.1-70b-versatile",
  temperature: 0.7,
  max_tokens: 300,
  top_p: 0.9
}
```

**System Prompt** (Dynamic based on language):
```
You are a helpful civic information assistant for Raipur, India.
Provide clear, accurate answers about traffic, civic services, and city information.
Be concise but friendly. Always respond in {language}.
```

**Fallback**: Template-based responses if API fails

**Implementation File**: `packages/services/agent/src/llmService.ts`

---

### AGENT 7: Criteria TTS (Text-to-Speech)
**Purpose**: Convert response text to natural speech  
**Service**: Cartesia TTS API  
**API Endpoint**: `wss://api.cartesia.ai/tts/websocket`  

**Voice Options**:
- English: `en-US-neural-conversational`
- Hindi: `hi-IN-neural-standard`
- Chhattisgarhi: Custom voice (if available)

**Features**:
- Streaming audio output
- Natural intonation
- Low latency (~200ms first byte)

**Implementation File**: `packages/services/agent/src/criteriaTtsService.ts`

---

## 🔄 Alternative Flows

### Text-Only Chat (No Voice)
```
User Text Input → NLP (Agent 3) → Router (Agent 4) → 
Data Sources (Agents 5A/5B/5C) → LLM (Agent 6) → Text Response
```

### Report Submission (No AI)
```
User Input (Voice/Text + Photo) → Transcription (Agent 2) → 
Category Detection (Agent 3) → Database Insert → Confirmation
```

---

## 📈 Performance Targets

| Agent | Target Latency | Fallback Strategy |
|-------|---------------|-------------------|
| SARVAM AI | <200ms | Default to 'en' |
| Deepgram STT | <500ms | Return empty text |
| Google NLP | <500ms | Keyword-based routing |
| Traffic API | <1000ms | Use cached data |
| Knowledge Search | <300ms | Return top result |
| Groq LLM | <2000ms | Use template |
| Criteria TTS | <500ms | Return silence buffer |

**Total E2E Latency Target**: <4 seconds from voice input to audio output

---

## 🛠️ Implementation Status

### ✅ Implemented (Placeholders)
- [x] SARVAM AI service structure
- [x] Deepgram STT service structure
- [x] Criteria TTS service structure
- [x] Basic pipeline orchestration

### 🔄 Need Full Implementation
- [ ] Google Cloud NLP integration
- [ ] Groq LLM integration
- [ ] Pipecat framework integration
- [ ] Real-time streaming pipeline
- [ ] Error handling & retries
- [ ] Caching layer
- [ ] Monitoring & logging

---

## 📝 Configuration Requirements

### Environment Variables Needed
```env
# Language Detection
SARVAM_AI_API_KEY=...

# Speech-to-Text
DEEPGRAM_API_KEY=...

# NLP
GOOGLE_CLOUD_API_KEY=...

# LLM
GROQ_API_KEY=...

# Embeddings
OPENAI_API_KEY=...

# TTS
CARTESIA_API_KEY=...

# Traffic
GOOGLE_MAPS_API_KEY=...

# Database
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=...
REDIS_TOKEN=...
```

---

## 🧪 Testing Sequence

### Test 1: Voice Query (English)
```
Input: "How is traffic to the station?"
Expected Output: Audio response with current traffic conditions
```

### Test 2: Voice Query (Hindi)
```
Input: "आज कचरा कब उठाया जाएगा?"
Expected Output: Audio response in Hindi about garbage collection schedule
```

### Test 3: Complex Query
```
Input: "क्या VIP रोड आज बंद है? मुझे स्टेशन जाना है।"
Expected Output: Information about road status + alternative route suggestion
```

---

**Last Updated**: November 6, 2025  
**Version**: 1.0.0
