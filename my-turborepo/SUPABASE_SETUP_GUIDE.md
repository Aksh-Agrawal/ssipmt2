# 🗄️ Supabase Setup & Environment Configuration

## Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**: https://supabase.com
2. **Sign in** with GitHub/Google
3. **Click "New Project"**
4. **Fill in details**:
   - Organization: Create new or select existing
   - Name: `civic-voice-raipur` (or your choice)
   - Database Password: **SAVE THIS!** (e.g., `MySecurePass123!`)
   - Region: Choose closest to India (e.g., `ap-south-1` Mumbai)
   - Pricing Plan: Free tier is fine for development

5. **Wait 2-3 minutes** for project to initialize

---

## Step 2: Get Your Supabase Credentials

Once your project is ready:

### A. Find Project URL & Keys

1. In Supabase Dashboard, click **"Project Settings"** (gear icon in left sidebar)
2. Click **"API"** tab
3. You'll see:

```
Project URL: https://abcdefghijklmnop.supabase.co
                    ^^^^^^^^^^^^^^^^
                    (your unique project ID)

API Keys:
┌─────────────────────────────────────────────────┐
│ anon/public key (safe to use in browser)        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ service_role key (SECRET - server only!)        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...          │
└─────────────────────────────────────────────────┘
```

**Copy these 3 values**:
- ✅ Project URL
- ✅ `anon` key (public key)
- ✅ `service_role` key (secret key)

---

## Step 3: Run Database Schema

1. In Supabase Dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"** button
3. **Copy the entire contents** of `database/schema-complete.sql`
4. **Paste** into the SQL Editor
5. Click **"RUN"** button (bottom right)
6. **Wait 10-15 seconds** - you should see: ✅ Success. No rows returned

### Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see **15 tables**:
- analytics_daily
- audit_logs
- chatbot_conversations
- events
- knowledge_articles
- notifications
- report_comments
- report_timeline
- reports
- system_settings
- traffic_data
- traffic_simulations
- users

---

## Step 4: Update Environment Files

Now add your Supabase credentials to **THREE** `.env.local` files:

### A. User Portal (web-platform)

**File**: `apps/web-platform/.env.local`

**Add these lines** (keep existing Clerk config):

```bash
# Existing Clerk config (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvYmFibGUtbWFjYXF1ZS0yMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_EuUHbYCC3W0F96cWGbJuiGKfiGORm0AuG6EUZIHLf0

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/dashboard

# ADD THESE LINES (replace with your actual values):
# ============================================
# Supabase Database
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY
```

---

### B. Admin Portal (admin-web)

**File**: `apps/admin-web/.env.local`

**Add these lines** (keep existing Clerk config):

```bash
# Existing Clerk config (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xldmVyLXBpa2EtMjUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_aO5vcXhSFZpkkL9dX3V3jRTBWCsm3f74Hga7zIA4ih

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# ADD THESE LINES (replace with your actual values):
# ============================================
# Supabase Database
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY
```

---

### C. API Server (when we build it)

**File**: `apps/api/.env` (create this file if it doesn't exist)

```bash
# ============================================
# Supabase Database
# ============================================
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY

# ============================================
# AI Services (will add later)
# ============================================
GROQ_API_KEY=your_groq_key_here
DEEPGRAM_API_KEY=your_deepgram_key_here
SARVAM_API_KEY=your_sarvam_key_here
GOOGLE_CLOUD_API_KEY=your_google_key_here
CRITERIA_TTS_API_KEY=your_criteria_key_here
PIPECAT_API_KEY=your_pipecat_key_here

# ============================================
# Notification Services (will add later)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

---

## Step 5: Install Supabase Client

Run these commands:

```powershell
# Install in both apps
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"

# User portal
npm install @supabase/supabase-js --workspace=web-platform

# Admin portal
npm install @supabase/supabase-js --workspace=admin-web
```

---

## Step 6: Create Supabase Client Utility

### For Web Platform:

**Create**: `apps/web-platform/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### For Admin Web:

**Create**: `apps/admin-web/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with full access
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

---

## Step 7: Test Database Connection

Create a test file to verify everything works:

**Create**: `apps/web-platform/app/api/test-db/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test query: count reports
    const { data, error, count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      reportCount: count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Step 8: Verify Everything Works

1. **Restart both servers** (important for env vars to load):

```powershell
# Stop all running servers (Ctrl+C in terminals)

# Start user portal
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform"
npm run dev

# In another terminal, start admin portal
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web"
npm run dev
```

2. **Test database connection**:

Open browser and go to:
```
http://localhost:3000/api/test-db
```

You should see:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "reportCount": 0,
  "timestamp": "2025-11-06T..."
}
```

---

## Quick Reference: What Goes Where

### NEXT_PUBLIC_* variables
- ✅ Safe to use in browser
- ✅ Can be accessed in client components
- ❌ Don't put secrets here

### Regular variables (no prefix)
- ❌ Never exposed to browser
- ✅ Only available on server
- ✅ Use for API keys, service role keys

### Example:
```bash
# ✅ SAFE - Can use in client components
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (anon key is safe)

# 🔒 SECRET - Server only
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (never expose!)
CLERK_SECRET_KEY=sk_test... (never expose!)
```

---

## Troubleshooting

### Error: "Cannot read properties of undefined"
- ❌ Environment variables not loaded
- ✅ Restart dev server after adding .env.local

### Error: "Invalid API key"
- ❌ Wrong key copied (check for extra spaces)
- ✅ Copy full key including `eyJhbG...` prefix

### Error: "relation 'reports' does not exist"
- ❌ Schema not run in Supabase
- ✅ Go to SQL Editor and run schema-complete.sql

### Error: "Row Level Security policy violation"
- ❌ RLS is blocking queries
- ✅ Use `supabaseAdmin` for admin operations
- ✅ Or disable RLS temporarily: `ALTER TABLE reports DISABLE ROW LEVEL SECURITY;`

---

## Next Steps

Once database is connected:

1. ✅ **Insert sample data** (optional):
   - Go to Supabase → Table Editor
   - Click "Insert row" to add test reports

2. ✅ **Connect Clerk users to database**:
   - Create webhook to sync Clerk users to `users` table

3. ✅ **Start building API routes**:
   - Reports CRUD
   - Traffic data
   - Chatbot queries

4. ✅ **Replace mock data in frontend**:
   - Update dashboard to fetch real data
   - Connect forms to database

---

## Summary Checklist

- [ ] Created Supabase project
- [ ] Copied Project URL
- [ ] Copied anon key
- [ ] Copied service_role key
- [ ] Ran schema-complete.sql in SQL Editor
- [ ] Verified 15 tables created
- [ ] Updated apps/web-platform/.env.local
- [ ] Updated apps/admin-web/.env.local
- [ ] Installed @supabase/supabase-js
- [ ] Created lib/supabase.ts files
- [ ] Created test API route
- [ ] Restarted dev servers
- [ ] Tested database connection (got success response)

**All done? Your database is ready! 🎉**
