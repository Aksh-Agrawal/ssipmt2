# 🚀 Smart City Civic Voice Platform - Implementation Roadmap

## 📊 Current Status (As of Nov 6, 2025)

### ✅ COMPLETED (40%)

#### 1. Frontend - All Pages Built (100%)
- **User Portal** (7 pages): Dashboard, Report, My Reports, Issue Detail, Profile, Notifications, Help
- **Admin Portal** (8 pages): Dashboard, Incidents, Traffic Map, Simulator, Events, Users, Reports, Settings
- **Landing Page**: Dual login (Citizen/Admin) with clean UI
- **Design**: Modern, aesthetic UI with Material-UI v7, responsive

#### 2. Authentication (100%)
- **Clerk Integration**: Separate apps for user & admin
- **Ports**: User (3000), Admin (3002), API (3001)
- **Redirects**: Proper post-login routing to dashboards
- **Protected Routes**: Middleware with RLS

#### 3. Database Design (100%)
- **Complete Schema**: 15 tables with relationships
- **Features**: PostGIS geo-queries, full-text search, RLS, audit logs
- **File**: `database/schema-complete.sql` (ready to deploy)

---

## 🔄 IN PROGRESS (10%)

### Phase 1: Database & API Foundation

#### A. Deploy Database to Supabase ⏳
**Priority**: CRITICAL | **Time**: 1 hour

**Steps**:
1. Create Supabase project at https://supabase.com
2. Run `database/schema-complete.sql` in SQL Editor
3. Configure RLS policies for Clerk authentication
4. Add environment variables to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```
5. Test connection with sample queries

**Deliverables**:
- ✅ Database deployed with all 15 tables
- ✅ Indexes and triggers functional
- ✅ RLS policies active
- ✅ Sample data inserted (50+ reports, 10+ users)

---

## 🎯 NEXT STEPS (50% remaining)

### Phase 2: Core Backend Services (15%)

#### B. Build API Server ⭐ HIGH PRIORITY
**Time**: 4-6 hours

**Services Needed**:
```
apps/api/
├── routes/
│   ├── reports.ts         # CRUD reports
│   ├── users.ts           # User management
│   ├── traffic.ts         # Traffic data
│   ├── events.ts          # Road closures
│   ├── notifications.ts   # Multi-channel alerts
│   ├── chatbot.ts         # AI chatbot
│   └── analytics.ts       # Stats & exports
├── services/
│   ├── supabase.ts        # Database client
│   ├── clerk.ts           # Auth middleware
│   ├── groq.ts            # LLM integration
│   ├── deepgram.ts        # Speech-to-text
│   ├── sarvam.ts          # Language detection
│   ├── google-nlp.ts      # Intent extraction
│   └── pipecat.ts         # Voice pipeline
└── utils/
    ├── geo.ts             # GPS utilities
    ├── ai-categorizer.ts  # Report classification
    └── sla-calculator.ts  # Priority/deadline
```

**API Endpoints**:
```typescript
// Reports
POST   /api/v1/reports              # Create report (voice/text)
GET    /api/v1/reports              # List reports (filters)
GET    /api/v1/reports/:id          # Get report details
PATCH  /api/v1/reports/:id          # Update status/assignment
POST   /api/v1/reports/:id/comments # Add comment
GET    /api/v1/reports/nearby       # Geo-radius search

// Voice & AI
POST   /api/v1/voice/transcribe     # Deepgram STT
POST   /api/v1/voice/detect-lang    # SARVAM language detection
POST   /api/v1/ai/categorize        # Google NLP categorization
POST   /api/v1/ai/chat              # Groq chatbot

// Traffic
GET    /api/v1/traffic/live         # Current traffic data
POST   /api/v1/traffic/simulate     # What-if simulator
GET    /api/v1/traffic/hotspots     # Congestion areas

// Events
GET    /api/v1/events               # List closures
POST   /api/v1/events               # Create closure
PATCH  /api/v1/events/:id/approve   # Approve event

// Analytics
GET    /api/v1/analytics/stats      # Dashboard KPIs
GET    /api/v1/analytics/export     # CSV/PDF export
```

---

### Phase 3: AI & Voice Integration (20%)

#### C. Pipecat Voice Pipeline ⭐⭐ CRITICAL FEATURE
**Time**: 8-10 hours | **Docs**: https://docs.pipecat.ai

**Architecture**:
```
User Voice Input
    ↓
[1] SARVAM AI → Detect Language (en/hi/cg)
    ↓
[2] Deepgram STT → Transcribe to text
    ↓
[3] Google Cloud NLP → Extract intent/entities
    ↓
[4] Route Based on Intent:
    - Traffic Query → Fetch traffic_data
    - Report Issue → Create report
    - General Info → Search knowledge_articles
    ↓
[5] Groq LLM → Generate natural response
    ↓
[6] Criteria/Cartesia TTS → Convert to speech
    ↓
Audio Response to User
```

**Implementation**:
```typescript
// apps/api/services/voice-pipeline.ts
import { PipecatClient } from '@pipecat-ai/client';
import { DeepgramClient } from '@deepgram/sdk';
import { Groq } from 'groq-sdk';

export class VoicePipeline {
  async processVoiceQuery(audioBlob: Blob, userId: string) {
    // 1. Language Detection (SARVAM)
    const language = await this.detectLanguage(audioBlob);
    
    // 2. Speech-to-Text (Deepgram)
    const transcription = await this.transcribe(audioBlob, language);
    
    // 3. NLP Processing (Google Cloud)
    const { intent, entities } = await this.extractIntent(transcription);
    
    // 4. Route Query
    const context = await this.fetchContext(intent, entities);
    
    // 5. Generate Response (Groq)
    const response = await this.generateResponse(transcription, context, language);
    
    // 6. Text-to-Speech (Criteria)
    const audioResponse = await this.synthesizeSpeech(response, language);
    
    return { text: response, audio: audioResponse, intent };
  }
}
```

**Environment Variables**:
```env
# AI Services
GROQ_API_KEY=gsk_...
DEEPGRAM_API_KEY=...
SARVAM_API_KEY=...
GOOGLE_CLOUD_API_KEY=AIzaSy...
CRITERIA_TTS_API_KEY=...
PIPECAT_API_KEY=...
```

---

#### D. Groq Chatbot with Context ⭐
**Time**: 4-6 hours

**Features**:
- Multi-turn conversations
- Context from knowledge_articles & traffic_data
- Multilingual (EN/HI/CG)
- Intent routing (traffic/report/info)
- Session memory in chatbot_conversations table

**Prompts**:
```typescript
const SYSTEM_PROMPT = `
You are Civic Voice Assistant for Raipur, India.
You help citizens with:
1. Traffic updates ("Kaha traffic hai?" / "Where is traffic?")
2. Civic information (garbage schedule, water timings)
3. Report issues (guide voice reporting)

Languages: English, Hindi (हिंदी), Chhattisgarhi (छत्तीसगढ़ी)
Tone: Helpful, concise, local context-aware

Current traffic data: {traffic_context}
Knowledge base: {kb_context}
`;
```

---

### Phase 4: Advanced Features (15%)

#### E. Traffic Simulator with Real Data ⭐⭐
**Time**: 6-8 hours

**Features**:
- Historical traffic pattern analysis
- Event multipliers (festival: 2.5x, cricket match: 3x, market day: 1.8x)
- Predictive congestion heatmap
- Suggested detour routes
- Impact radius calculation

**Algorithm**:
```typescript
function simulateRoadClosure(params: {
  roadSegmentId: string;
  closureTime: Date;
  eventType: string;
  specialOccasion?: string;
}) {
  // 1. Get historical traffic for this road & time
  const historicalData = await getHistoricalTraffic(roadSegmentId, closureTime);
  
  // 2. Apply event multiplier
  const multiplier = getEventMultiplier(eventType, specialOccasion);
  
  // 3. Find alternative routes
  const alternativeRoutes = await findDetours(roadSegmentId);
  
  // 4. Calculate congestion impact
  const impactedAreas = calculateCongestionSpread(
    roadSegmentId,
    historicalData,
    multiplier
  );
  
  // 5. Generate heatmap & recommendations
  return {
    predictedCongestion: impactedAreas,
    suggestedDetours: alternativeRoutes,
    estimatedDelayMinutes: calculateDelay(historicalData, multiplier),
    affectedAreas: getAffectedZones(impactedAreas)
  };
}
```

---

#### F. Geo-Tagged Photo Verification
**Time**: 3-4 hours

**Implementation**:
```typescript
// Extract GPS from photo EXIF
import ExifReader from 'exifreader';

async function verifyGeoTaggedPhoto(photoFile: File) {
  const tags = await ExifReader.load(photoFile);
  
  const lat = tags.GPSLatitude?.description;
  const lon = tags.GPSLongitude?.description;
  const timestamp = tags.DateTime?.description;
  
  // Prevent fake reports
  if (!lat || !lon) {
    throw new Error('Photo must have GPS location');
  }
  
  // Check if taken recently (within 24 hours)
  if (isOlderThan(timestamp, 24 * 60 * 60 * 1000)) {
    throw new Error('Photo must be recent');
  }
  
  // Upload to Supabase Storage
  const photoUrl = await uploadPhoto(photoFile);
  
  return {
    url: photoUrl,
    location: { lat, lon },
    timestamp,
    verified: true
  };
}
```

---

#### G. Multi-Channel Notifications
**Time**: 4-5 hours

**Channels**:
- **Push**: Firebase Cloud Messaging
- **SMS**: Twilio
- **WhatsApp**: Twilio WhatsApp Business API
- **Email**: Resend / SendGrid

**Triggers**:
- Report status change
- Assignment to field worker
- SLA deadline approaching
- Road closure near user
- Response from admin

```typescript
// apps/api/services/notifications.ts
async function sendNotification(notification: {
  userId: string;
  title: string;
  body: string;
  type: NotificationType[];
}) {
  const user = await getUser(notification.userId);
  
  const promises = [];
  
  if (user.pushEnabled && notification.type.includes('Push')) {
    promises.push(sendPushNotification(user.deviceToken, notification));
  }
  
  if (user.smsEnabled && notification.type.includes('SMS')) {
    promises.push(sendSMS(user.phone, notification.body));
  }
  
  if (user.whatsappEnabled && notification.type.includes('WhatsApp')) {
    promises.push(sendWhatsApp(user.phone, notification));
  }
  
  if (user.emailEnabled && notification.type.includes('Email')) {
    promises.push(sendEmail(user.email, notification));
  }
  
  await Promise.allSettled(promises);
}
```

---

### Phase 5: Analytics & Export (5%)

#### H. CSV/PDF Export & Dashboard Analytics
**Time**: 3-4 hours

**Features**:
- Export reports by date range/category/area
- PDF reports with charts (using jsPDF + Chart.js)
- SLA compliance tracking
- Response time heatmap
- Top problem areas analysis

```typescript
// Generate CSV
function generateReportCSV(reports: Report[]) {
  const csv = [
    ['ID', 'Description', 'Category', 'Priority', 'Status', 'Created', 'Resolved'].join(','),
    ...reports.map(r => [
      r.unique_id,
      r.description,
      r.category,
      r.priority,
      r.status,
      r.created_at,
      r.resolved_at || 'N/A'
    ].join(','))
  ].join('\n');
  
  return csv;
}

// Generate PDF with charts
function generateAnalyticsPDF(stats: AnalyticsData) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Civic Voice Analytics Report', 20, 20);
  
  // Stats
  doc.setFontSize(12);
  doc.text(`Total Reports: ${stats.totalReports}`, 20, 40);
  doc.text(`Resolved: ${stats.resolvedReports}`, 20, 50);
  doc.text(`Avg Response Time: ${stats.avgResponseTime}hrs`, 20, 60);
  
  // Chart (convert canvas to image)
  const chartImage = generateChartImage(stats);
  doc.addImage(chartImage, 'PNG', 20, 80, 170, 100);
  
  return doc.output('blob');
}
```

---

## 📅 Recommended Implementation Order

### Week 1: Foundation
1. ✅ Deploy Database (Day 1) - **START HERE**
2. ✅ Build API Server core routes (Day 2-3)
3. ✅ Connect frontend to API (Day 4-5)

### Week 2: AI Integration
4. ✅ Implement Groq Chatbot (Day 6-7)
5. ✅ Add SARVAM Language Detection (Day 8)
6. ✅ Integrate Deepgram STT (Day 9)
7. ✅ Build Pipecat Voice Pipeline (Day 10-12)

### Week 3: Advanced Features
8. ✅ Build Traffic Simulator (Day 13-15)
9. ✅ Add Geo-Tagged Photos (Day 16-17)
10. ✅ Setup Notification System (Day 18-20)

### Week 4: Polish & Deploy
11. ✅ Build Analytics & Export (Day 21-22)
12. ✅ Testing & Bug Fixes (Day 23-25)
13. ✅ Performance Optimization (Day 26-27)
14. ✅ Documentation & Deployment (Day 28-30)

---

## 🎯 Key Metrics for Success

### Technical KPIs
- ✅ All 16 pages functional with real data
- ✅ Voice pipeline latency < 3 seconds
- ✅ API response time < 500ms (P95)
- ✅ 95%+ AI categorization accuracy
- ✅ Support 1000+ concurrent users

### Business KPIs
- ✅ 80%+ report resolution rate
- ✅ < 24hr average response time
- ✅ 90%+ SLA compliance
- ✅ 3+ languages supported (EN/HI/CG)
- ✅ 500+ reports/month

---

## 💡 Next Immediate Action

**👉 START HERE: Deploy Database**

Run this command:
```powershell
# 1. Go to https://supabase.com and create project
# 2. Copy the SQL schema
cat database/schema-complete.sql | clip

# 3. Paste in Supabase SQL Editor and run
# 4. Verify tables created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# 5. Update .env.local files with Supabase credentials
```

After database is ready, we'll build the API server to connect everything!

---

## 📚 Resources & Documentation

- **Pipecat**: https://docs.pipecat.ai/getting-started/introduction
- **Groq API**: https://console.groq.com/docs
- **Deepgram**: https://developers.deepgram.com/
- **SARVAM AI**: https://www.sarvam.ai/
- **Supabase**: https://supabase.com/docs
- **Clerk**: https://clerk.com/docs

**Your platform is 40% complete! Let's finish the remaining 60% together.** 🚀
