# 🚀 Smart City Civic Voice Platform - Complete Implementation Guide

## 📋 Project Overview

**Smart City Civic Voice Platform** - A dual-purpose AI-powered platform for Raipur, India that bridges citizens and city authorities through:

1. **Issue Reporting System** - Voice-first "Tap & Speak" civic issue reporting
2. **Civic Information Agent** - AI chatbot with real-time city information
3. **Admin Dashboard** - Traffic analysis and incident management for authorities

---

## 🎯 Implementation Sequence

### Phase 1: Foundation & Authentication (Week 1)
### Phase 2: Core Services & Voice Pipeline (Week 2)
### Phase 3: User Portal (Week 3)
### Phase 4: Admin Dashboard (Week 4)
### Phase 5: AI Agents & Analytics (Week 5)
### Phase 6: Testing & Deployment (Week 6)

---

## 📦 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Material-UI (MUI) v7
- **Authentication**: Clerk
- **Styling**: Emotion + CSS Modules
- **Maps**: Google Maps API
- **State Management**: React Context + Hooks

### Backend
- **API**: Hono (Lightweight, fast)
- **Runtime**: Node.js 18+
- **Database**: 
  - PostgreSQL (Supabase) - Issue reports
  - Redis (Upstash) - Knowledge base & caching
- **File Storage**: Supabase Storage (geo-tagged photos)

### AI & Voice Services
- **Speech-to-Text**: Deepgram STT
- **Text-to-Speech**: Criteria TTS (Cartesia)
- **Language Detection**: SARVAM AI
- **NLP**: Google Cloud Natural Language API
- **LLM**: Groq (llama-3.1-70b-versatile)
- **Voice Framework**: Pipecat
- **Embeddings**: OpenAI text-embedding-3-small

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Deployment**: Vercel (frontend), Railway (backend)
- **CI/CD**: GitHub Actions

---

## 🔧 Phase 1: Foundation & Authentication

### Step 1.1: Install Clerk Authentication

```powershell
# Navigate to root
cd c:\A SSD NEW WIN\code\ssipmt2\my-turborepo

# Install Clerk for both web apps
npm install @clerk/nextjs --workspace=web-platform
npm install @clerk/nextjs --workspace=admin-web
```

### Step 1.2: Configure Clerk

Create Clerk applications:
1. Go to https://clerk.com/ and sign up
2. Create TWO applications:
   - **"Civic Voice - User Portal"** (for citizens)
   - **"Civic Voice - Admin Portal"** (for authorities)

### Step 1.3: Setup Environment Variables

**For User Portal** (`apps/web-platform/.env.local`):
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For Admin Portal** (`apps/admin-web/.env.local`):
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (different from user portal)
CLERK_SECRET_KEY=sk_test_... (different from user portal)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (for direct admin queries)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**For API** (`apps/api/.env`):
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=AXlcA...

# AI Services
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLOUD_API_KEY=AIza...

# Voice Services
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
SARVAM_AI_API_KEY=...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...
```

---

## 🔧 Phase 2: Core Services & Voice Pipeline

### Step 2.1: Install Required Dependencies

```powershell
# API dependencies
npm install groq-sdk @google-cloud/language hono pino --workspace=api

# Agent service dependencies
npm install pipecat-ai deepgram @cartesia/tts --workspace=@repo/services-agent

# Shared types
npm install zod --workspace=@repo/shared-types
```

### Step 2.2: Implement Voice Pipeline (Pipecat Integration)

The voice pipeline follows this flow:
```
Audio Input → Language Detection (SARVAM) → STT (Deepgram) → 
NLP (Google Cloud) → Intent Routing → LLM Response (Groq) → 
TTS (Criteria) → Audio Output
```

### Step 2.3: Implement Groq Chatbot Service

Create chatbot service with multilingual support:
- Model: `llama-3.1-70b-versatile`
- Languages: English, Hindi, Chhattisgarhi
- Context-aware responses

### Step 2.4: Setup Google Cloud NLP

Enable Google Cloud Natural Language API:
1. Go to Google Cloud Console
2. Enable Natural Language API
3. Create API key
4. Implement intent extraction, entity recognition, keyword extraction

---

## 🔧 Phase 3: User Portal Implementation

### Step 3.1: User Portal Sitemap

```
/user
  ├── /dashboard          # Home with quick report, status feed, nearby issues map
  ├── /report             # Tap & Speak reporter (voice-first, multilingual)
  ├── /my-reports         # User's past reports + statuses
  ├── /issue/[id]         # Issue details (comments, photos, timeline)
  ├── /notifications      # Push/SMS/WhatsApp preferences
  ├── /profile            # Edit profile, language preference
  └── /help               # FAQ + chatbot (Civic Information Agent)
```

### Step 3.2: Key Features

#### Voice-First Reporting (`/user/report`)
- **Tap & Speak** button with visual feedback
- **Language Selection**: English / Hindi / Chhattisgarhi
- **Real-time Transcription** display
- **Photo Capture** with auto geo-tagging
- **AI Auto-categorization**
- **Confirmation Screen** with unique ID

#### Dashboard (`/user/dashboard`)
- **Quick Report Button** (large, prominent)
- **Recent Reports** status cards
- **Interactive Map** showing nearby reported issues
- **Filter by Category** and status
- **Search** by location or keyword

#### Chatbot Integration (`/user/help`)
- **Multilingual Voice & Text** chat
- **Example Queries**:
  - "आज स्टेशन रोड पर ट्रैफिक कैसा है?" (How is traffic on Station Road today?)
  - "कचरा कब उठाया जाएगा?" (When will garbage be collected?)
  - "क्या VIP रोड बंद है?" (Is VIP Road closed?)

---

## 🔧 Phase 4: Admin Dashboard Implementation

### Step 4.1: Admin Portal Sitemap

```
/admin
  ├── /dashboard          # Overview KPIs, open issues, heatmap
  ├── /incidents          # Manage reported issues (filter, assign, status)
  ├── /simulate           # Road closure simulator (what-if analysis)
  ├── /traffic-map        # Live traffic + overlays (heatmap, sensors)
  ├── /events             # Schedule planned closures/events
  ├── /users              # Manage user accounts
  ├── /reports            # Export CSV/PDF, analytics
  └── /settings           # System settings, templates
```

### Step 4.2: Key Features

#### Dashboard (`/admin/dashboard`)
- **KPI Cards**:
  - Open Issues (by severity)
  - Average Response Time
  - Active Incidents
  - Current Road Closures
- **Heatmap** of issue concentration
- **Real-time Updates** via WebSocket

#### Incident Management (`/admin/incidents`)
- **Filter Panel**: Severity, Category, Area, Date, Assigned Worker
- **Issue Queue** with sortable columns
- **Quick Actions**: Assign, Change Status, Add Comment
- **Bulk Operations**: Assign multiple issues
- **SMS/WhatsApp** job card generation

#### Traffic Simulator (`/admin/simulate`)
- **Road Selection** on interactive map
- **Time Window** picker
- **Run Simulation** button
- **Results Display**:
  - Traffic heatmap prediction
  - Affected area radius
  - Suggested detours
  - Impact score (1-10)
- **Historical Data Comparison**

#### Live Traffic Map (`/admin/traffic-map`)
- **Google Maps** integration
- **Overlay Layers**:
  - Current traffic conditions
  - Reported incidents
  - Planned road closures
  - Camera/sensor feeds
- **Filter Controls**
- **Auto-refresh** every 2 minutes

---

## 🔧 Phase 5: AI Agents & Analytics

### Step 5.1: Implement Civic Information Agent

**Architecture**:
```typescript
// Voice Query Flow
1. detectLanguage(audioChunk) → 'hi' | 'en' | 'cg'
2. transcribeAudio(audioChunk, language) → text
3. extractIntent(text) → 'traffic' | 'garbage' | 'info'
4. routeQuery(intent) → trafficAPI | knowledgeBase
5. generateResponse(data, language) → text
6. synthesizeSpeech(text, language) → audioBuffer
```

**Supported Intents**:
- `traffic`: Real-time traffic queries
- `garbage`: Collection schedule
- `roadwork`: Construction updates
- `emergency`: Emergency contacts
- `general`: General civic information

### Step 5.2: Implement Traffic Analysis System

**Data Sources**:
1. Google Maps Traffic API (real-time)
2. Historical incident data (PostgreSQL)
3. Planned events (Redis cache)
4. User-reported issues

**Analysis Features**:
- Current traffic conditions
- Predicted congestion (ML model)
- Alternative route suggestions
- Impact assessment for closures

### Step 5.3: Analytics Dashboard

**Metrics**:
- **Response Times**: Average, by category
- **Resolution Rates**: % resolved within SLA
- **Top Problem Areas**: Geo-clustered hotspots
- **Category Distribution**: Pie chart
- **Trend Analysis**: Time series graphs

---

## 🗄️ Database Schema Enhancements

### Additional Tables Needed

**1. Traffic Events**
```sql
CREATE TABLE traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL, -- 'closure', 'construction', 'accident'
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  affected_roads TEXT[], -- Array of road names
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  description TEXT,
  impact_score INTEGER, -- 1-10
  status VARCHAR(20) DEFAULT 'active', -- 'planned', 'active', 'completed'
  created_by UUID NOT NULL
);
```

**2. User Preferences**
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', 'cg'
  notification_channels JSONB, -- {sms: true, whatsapp: true, push: false}
  favorite_locations GEOGRAPHY(POINT, 4326)[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. Chatbot Sessions**
```sql
CREATE TABLE chatbot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  language VARCHAR(10),
  message_count INTEGER DEFAULT 0,
  queries JSONB -- Array of {query, response, timestamp}
);
```

---

## 🎨 UI/UX Design Guidelines

### Design Principles
1. **Voice-First**: Large, prominent "Tap & Speak" buttons
2. **Multilingual**: Clear language switcher
3. **Visual Feedback**: Loading states, success/error animations
4. **Accessibility**: High contrast, screen reader support
5. **Mobile-First**: Responsive design, touch-friendly

### Color Scheme
- **Primary**: #1976D2 (Blue - Trust, Authority)
- **Secondary**: #388E3C (Green - Action, Progress)
- **Error**: #D32F2F (Red - Urgent Issues)
- **Warning**: #F57C00 (Orange - Medium Priority)
- **Success**: #689F38 (Green - Resolved)

### Typography
- **Headings**: Roboto Bold
- **Body**: Roboto Regular
- **Hindi/Chhattisgarhi**: Noto Sans Devanagari

---

## 🧪 Testing Strategy

### Unit Tests
- Service functions (API routes, NLP, voice pipeline)
- React components (buttons, forms, maps)

### Integration Tests
- Voice pipeline end-to-end
- Report submission flow
- Admin assignment workflow

### E2E Tests
- User journey: Report → Track → Resolve
- Admin journey: Triage → Assign → Close
- Chatbot conversations

---

## 🚀 Deployment

### Environment Setup
- **User Portal**: Vercel (https://civic-voice-user.vercel.app)
- **Admin Portal**: Vercel (https://civic-voice-admin.vercel.app)
- **API**: Railway (https://api-civic-voice.railway.app)

### Environment Variables for Production
Update all `.env` files with production keys and URLs.

---

## 📝 Implementation Checklist

### ✅ Completed
- [x] Turborepo monorepo setup
- [x] Database schema (PostgreSQL + Redis)
- [x] Basic API structure (Hono)
- [x] Next.js apps (web-platform, admin-web)
- [x] Voice service placeholders (SARVAM, Deepgram, Criteria)

### 🔄 In Progress
- [ ] Fix SARVAM AI import error
- [ ] Clerk authentication integration
- [ ] Voice pipeline with Pipecat
- [ ] Groq chatbot implementation

### 📋 To Do
- [ ] User portal routes & UI
- [ ] Admin dashboard routes & UI
- [ ] Google Cloud NLP integration
- [ ] Traffic simulator
- [ ] Geo-tagging & maps
- [ ] Analytics dashboard
- [ ] Testing suite
- [ ] Production deployment

---

## 🆘 Troubleshooting

### Common Issues

**1. TypeScript Errors in pipecatProcessors.ts**
- Ensure all service files exist
- Check import paths (.js extension for ESM)
- Add type annotations to error handlers

**2. Clerk Authentication Issues**
- Verify environment variables
- Check Clerk dashboard for correct app configuration
- Ensure middleware is properly configured

**3. Voice Pipeline Failures**
- Test each service individually (SARVAM, Deepgram, Criteria)
- Check API keys are valid
- Verify audio format compatibility

---

## 📚 Resources

- **Pipecat Docs**: https://docs.pipecat.ai/
- **Clerk Docs**: https://clerk.com/docs
- **Groq API**: https://console.groq.com/docs
- **Google Cloud NLP**: https://cloud.google.com/natural-language/docs
- **Supabase Docs**: https://supabase.com/docs
- **Material-UI**: https://mui.com/material-ui/

---

## 🎯 Next Immediate Steps

1. **Fix Import Error**: Correct SARVAM AI service ✅
2. **Install Clerk**: Setup authentication for both portals
3. **Create User Routes**: Implement /user/dashboard, /user/report
4. **Create Admin Routes**: Implement /admin/dashboard, /admin/incidents
5. **Test Voice Pipeline**: End-to-end voice query flow
6. **Deploy Beta**: Deploy to staging environment

---

**Last Updated**: November 6, 2025
**Version**: 1.0.0
