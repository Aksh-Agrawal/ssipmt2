# 🚀 QUICK START GUIDE - Civic Voice Platform

## Prerequisites
- Node.js 18+ installed
- npm 10+ installed
- Clerk account (https://clerk.com/)
- Supabase account (https://supabase.com/)
- API keys for AI services

---

## Step 1: Clone & Install

```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm install
```

---

## Step 2: Setup Clerk Authentication

### 2.1 Create Clerk Applications

1. Go to https://clerk.com/ and sign up/login
2. Create **TWO** applications:
   
   **Application 1: User Portal**
   - Name: "Civic Voice - User Portal"
   - Copy the Publishable Key and Secret Key
   
   **Application 2: Admin Portal**
   - Name: "Civic Voice - Admin Portal"  
   - Copy the Publishable Key and Secret Key (different from above)

### 2.2 Configure User Portal

Create `apps/web-platform/.env.local`:
```env
# Clerk (User Portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_USER_PORTAL_KEY
CLERK_SECRET_KEY=sk_test_YOUR_USER_PORTAL_SECRET

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/dashboard

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2.3 Configure Admin Portal

Create `apps/admin-web/.env.local`:
```env
# Clerk (Admin Portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ADMIN_PORTAL_KEY
CLERK_SECRET_KEY=sk_test_YOUR_ADMIN_PORTAL_SECRET

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Step 3: Setup Supabase Database

### 3.1 Create Supabase Project

1. Go to https://supabase.com/
2. Create a new project
3. Copy the Project URL and Anon Key
4. Go to SQL Editor in Supabase

### 3.2 Run Database Schema

Copy and paste the schema from `DATABASE_SETUP.md` into SQL Editor and run.

---

## Step 4: Configure API

Create `apps/api/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (Upstash)
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=AXlcA...

# AI Services (Get from respective providers)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLOUD_API_KEY=AIza...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
SARVAM_AI_API_KEY=...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...
```

---

## Step 5: Run the Applications

### Terminal 1: API Server
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=api
```
**API will run on**: http://localhost:3001

### Terminal 2: User Portal
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=web-platform
```
**User Portal will run on**: http://localhost:3000

### Terminal 3: Admin Portal
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=admin-web
```
**Admin Portal will run on**: http://localhost:3002

---

## Step 6: Test Authentication

### User Portal
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. You should be redirected to `/user/dashboard` (when created)

### Admin Portal
1. Open http://localhost:3002
2. Click "Sign In"
3. Create an admin account in Clerk dashboard
4. Sign in
5. You should be redirected to `/admin/dashboard` (when created)

---

## Step 7: API Keys to Obtain

### Required (Core Functionality)
- ✅ **Clerk** (FREE): https://clerk.com/ - Authentication
- ✅ **Supabase** (FREE): https://supabase.com/ - Database
- ✅ **Upstash Redis** (FREE): https://upstash.com/ - Cache
- ✅ **Google Maps API** (FREE tier): https://console.cloud.google.com/

### AI Services (Get later as needed)
- 🤖 **Groq** (FREE): https://console.groq.com/ - LLM
- 🤖 **OpenAI** (PAID): https://platform.openai.com/ - Embeddings
- 🗣️ **Deepgram** (FREE trial): https://deepgram.com/ - Speech-to-Text
- 🔊 **Cartesia** (FREE trial): https://cartesia.ai/ - Text-to-Speech
- 🌐 **SARVAM AI** (Contact): https://sarvam.ai/ - Language Detection
- 📊 **Google Cloud NLP** (FREE tier): https://cloud.google.com/natural-language

---

## Current Implementation Status

### ✅ Completed
- [x] Monorepo structure (Turborepo)
- [x] Database schema (PostgreSQL + Redis)
- [x] Basic API structure (Hono)
- [x] Next.js apps (User Portal + Admin Portal)
- [x] Clerk authentication setup
- [x] Sign-in/Sign-up pages
- [x] Middleware for route protection
- [x] Voice service placeholders

### 🔄 Next Steps (See IMPLEMENTATION_GUIDE.md)
1. Create User Portal routes:
   - `/user/dashboard` - Home page
   - `/user/report` - Tap & Speak reporting
   - `/user/my-reports` - Report history
   - `/user/help` - Chatbot

2. Create Admin Portal routes:
   - `/admin/dashboard` - Overview KPIs
   - `/admin/incidents` - Incident management
   - `/admin/simulate` - Traffic simulator
   - `/admin/traffic-map` - Live traffic map

3. Implement Voice Pipeline:
   - Integrate Pipecat framework
   - Connect SARVAM AI, Deepgram, Criteria TTS
   - Build multilingual voice assistant

4. Implement Chatbot:
   - Setup Groq API
   - Add multilingual support
   - Integrate with knowledge base

5. Implement Features:
   - Geo-tagged photo uploads
   - Google Maps integration
   - Traffic analysis system
   - Analytics dashboard

---

## Troubleshooting

### Issue: "Module not found: @clerk/nextjs"
**Solution**: Run `npm install` in the root directory

### Issue: Clerk authentication not working
**Solution**: 
1. Check .env.local files have correct keys
2. Verify you created TWO separate Clerk applications
3. Restart the development servers

### Issue: Can't connect to database
**Solution**:
1. Check Supabase URL and keys in .env
2. Verify database schema was created
3. Check network connection

### Issue: Port already in use
**Solution**:
```powershell
# Kill process on specific port (e.g., 3000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

## Important Notes

1. **Two Separate Clerk Apps**: You MUST create two separate applications in Clerk - one for users, one for admins. They will have different keys.

2. **Environment Files**: Make sure `.env.local` files are NOT committed to git (they're in .gitignore)

3. **API Keys**: You don't need all API keys immediately. Start with Clerk, Supabase, and Google Maps.

4. **Database**: Run the SQL schema in Supabase before testing API endpoints

5. **Port Assignment**:
   - API: 3001
   - User Portal: 3000
   - Admin Portal: 3002

---

## Next Actions

1. ✅ **Setup Clerk** - Create both applications and add keys
2. ✅ **Setup Supabase** - Create project and run SQL schema
3. ✅ **Test Login** - Verify authentication works on both portals
4. 📋 **Create Routes** - Follow IMPLEMENTATION_GUIDE.md to build features
5. 🎨 **Design UI** - Implement beautiful, clean interfaces
6. 🧪 **Test Features** - Ensure everything works properly

---

**Documentation Updated**: November 6, 2025
**Status**: Foundation Complete - Ready for Feature Implementation
