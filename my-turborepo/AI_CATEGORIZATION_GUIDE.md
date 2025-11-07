# AI Auto-Categorization Feature

## Overview
The AI auto-categorization system uses Groq LLM (llama-3.3-70b-versatile) to automatically detect the category and priority of civic reports based on their descriptions.

## How It Works

### 1. **Intelligent Categorization**
When a citizen submits a report, the AI analyzes the description and automatically assigns:
- **Category** (11 options): Roads & Infrastructure, Water Supply, Electricity, etc.
- **Priority** (4 levels): Low, Medium, High, Critical
- **Confidence Score**: 0.0 to 1.0 indicating AI's certainty
- **Reasoning**: Brief explanation of the categorization

### 2. **Fallback System**
If Groq API is unavailable, the system uses intelligent keyword matching:
- Pattern-based category detection
- Urgency keyword analysis for priority
- Always ensures reports are categorized

### 3. **User Experience**
- Users can optionally provide category/priority (AI respects their choice)
- If not provided, AI automatically categorizes
- After submission, users see AI's analysis in the success message
- Metadata stored in database for transparency and auditing

## API Integration

### Endpoint: `POST /api/reports`

**Request Body:**
```json
{
  "description": "There is a big pothole on VIP Road near Mowa Overpass. It's very dangerous for vehicles.",
  "location": { "lat": 21.2514, "lng": 81.6296 },
  "area": "VIP Road",
  "input_language": "en",
  "use_ai_categorization": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "unique_id": "REP-20251106-ABC123",
    "category": "Roads & Infrastructure",
    "priority": "High",
    "status": "Submitted"
  },
  "ai_metadata": {
    "ai_category": "Roads & Infrastructure",
    "ai_priority": "High",
    "ai_confidence": 0.92,
    "ai_reasoning": "Report describes a significant road hazard (pothole) with safety implications, requiring urgent attention"
  }
}
```

## Category Detection Rules

### Roads & Infrastructure
Keywords: pothole, road, crack, footpath, pavement, manhole, divider
Priority factors: Size, traffic, safety hazard

### Water Supply
Keywords: water, pipe, leak, supply, tank, shortage, tap
Priority factors: Impact scale, contamination, duration

### Electricity
Keywords: electricity, power, transformer, meter, wire
Priority factors: Outage scale, safety hazard, duration

### Garbage Collection
Keywords: garbage, waste, trash, bin, rubbish
Priority factors: Overflow, health hazard, duration

### Street Lights
Keywords: street light, lamp, bulb, lighting, dark
Priority factors: Safety, area coverage

### Drainage
Keywords: drain, sewage, waterlog, overflow, blocked
Priority factors: Health hazard, waterlogging severity

### Traffic Management
Keywords: traffic, signal, congestion, jam, parking
Priority factors: Congestion level, safety impact

### Emergency Detection
Keywords that trigger **Critical** priority:
- "emergency", "dangerous", "urgent", "critical"
- "life-threatening", "accident", "major"
- "open manhole", "live wire"

## Priority Assignment Logic

### Critical (SLA: 2 hours)
- Life-threatening situations
- Major safety hazards
- Severe infrastructure failures
- Affecting many people urgently

### High (SLA: 6 hours)
- Significant impact
- Urgent but not life-threatening
- Safety concerns
- Major inconvenience to community

### Medium (SLA: 24 hours) - DEFAULT
- Moderate impact
- Needs attention but not urgent
- Standard civic issues
- Localized problems

### Low (SLA: 72 hours)
- Minor inconvenience
- Cosmetic issues
- Small-scale problems
- No immediate impact

## Example Test Cases

### Test 1: Critical Priority
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "EMERGENCY! Open manhole on main road. Very dangerous, someone could fall!",
    "location": {"lat": 21.2514, "lng": 81.6296},
    "use_ai_categorization": true
  }'
```
**Expected:** Category: Roads & Infrastructure, Priority: Critical

### Test 2: High Priority
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Major water pipe burst on GE Road. Water flooding the entire street.",
    "location": {"lat": 21.2514, "lng": 81.6296},
    "use_ai_categorization": true
  }'
```
**Expected:** Category: Water Supply, Priority: High

### Test 3: Medium Priority
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Garbage not collected for 2 days in Pandri area",
    "location": {"lat": 21.2514, "lng": 81.6296},
    "area": "Pandri",
    "use_ai_categorization": true
  }'
```
**Expected:** Category: Garbage Collection, Priority: Medium

### Test 4: Low Priority
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Small crack on footpath near park gate",
    "location": {"lat": 21.2514, "lng": 81.6296},
    "use_ai_categorization": true
  }'
```
**Expected:** Category: Roads & Infrastructure, Priority: Low

### Test 5: Multilingual (Hindi)
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "VIP Road पर बहुत बड़ा गड्ढा है। बहुत खतरनाक है।",
    "location": {"lat": 21.2514, "lng": 81.6296},
    "input_language": "hi",
    "use_ai_categorization": true
  }'
```
**Expected:** Category: Roads & Infrastructure, Priority: High

## Benefits

✅ **Faster Processing**: No manual categorization needed
✅ **Consistent Standards**: AI applies same rules to all reports
✅ **Better SLA Management**: Accurate priority = proper deadline assignment
✅ **Transparency**: AI reasoning stored for audit trail
✅ **User-Friendly**: Works even if user doesn't know categories
✅ **Multilingual**: Works with English, Hindi, Chhattisgarhi descriptions

## Performance Metrics

- **Groq API Latency**: ~1-2 seconds per categorization
- **Fallback System**: <100ms (instant keyword matching)
- **Accuracy Target**: 90%+ (to be validated with real data)
- **Cost**: Groq API is extremely cost-effective

## Admin Dashboard Integration

The AI metadata is stored in the `reports.metadata` JSONB column:
```sql
{
  "ai_category": "Roads & Infrastructure",
  "ai_priority": "High",
  "ai_confidence": 0.92,
  "ai_reasoning": "Report describes significant road hazard..."
}
```

Admins can:
- View AI's original suggestion vs user/admin override
- Track AI confidence scores for quality monitoring
- Review reasoning for training/improvement
- Override AI categorization if needed

## Next Steps

1. ✅ AI categorization implemented
2. ✅ Fallback system ready
3. ⏳ Test with real user reports
4. ⏳ Collect accuracy metrics
5. ⏳ Fine-tune prompts based on feedback
6. ⏳ Add admin override workflow
