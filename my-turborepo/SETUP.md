# 🚀 System Setup Guide

This guide will help you set up and run the Civic Voice Assistant system.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: For version control

## Step 1: Install Dependencies

From the root of the monorepo:

```bash
cd my-turborepo
npm install
```

This will install all dependencies for all packages in the monorepo using Turborepo.

## Step 2: Configure Environment Variables

### Create .env File

Create a `.env` file in the `apps/api` directory:

```bash
cd apps/api
cp .env.example .env
```

Now edit the `.env` file with your actual credentials:

### Required Environment Variables

#### 1. Google Cloud Natural Language API

**What it does**: Processes user queries to detect intent and extract location entities.

**How to get it**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Cloud Natural Language API"
4. Go to "APIs & Services" → "Credentials"
5. Create credentials → API Key
6. Copy the API key

```bash
GOOGLE_CLOUD_API_KEY=AIzaSyD...your-actual-key...
```

#### 2. Google Maps Routes API

**What it does**: Provides real-time traffic data for the AI agent.

**How to get it**:
1. Same Google Cloud project as above
2. Enable "Routes API"
3. Use the same API key or create a new one

```bash
GOOGLE_MAPS_API_KEY=AIzaSyD...your-actual-key...
```

**Note**: You can use the same API key for both Google services if you enable both APIs in the same project.

#### 3. Supabase Configuration

**What it does**: Provides database (PostgreSQL) and authentication services.

**How to get it**:
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for project to finish setting up
4. Go to Project Settings → API
5. Copy your project URL and service role key

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key...
```

**⚠️ Security Warning**: The service role key has full database access. NEVER commit it to git or expose it to the frontend.

#### 4. Upstash Redis Configuration

**What it does**: Provides fast key-value storage for caching and real-time data.

**How to get it**:
1. Go to [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Choose "REST API" tab
4. Copy the REST URL and token

```bash
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=AXlcA...your-redis-token...
```

### Complete .env Example

Your `apps/api/.env` file should look like this:

```bash
# Google Cloud Natural Language API
GOOGLE_CLOUD_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Maps Routes API
GOOGLE_MAPS_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase Configuration
SUPABASE_URL=https://abcdefghijklmno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...

# Upstash Redis (Live DB for Agent Service)
REDIS_URL=https://example-redis-12345.upstash.io
REDIS_TOKEN=AXlcAC0zQgA...your-token...
```

## Step 3: Database Setup (Supabase)

After configuring Supabase, you need to set up the database schema:

### Option A: Using Supabase Dashboard

1. Go to your Supabase project
2. Click "SQL Editor"
3. Run the schema from `docs/architecture/9-database-schema.md`

### Option B: Using Migration Scripts (if available)

```bash
# From the root directory
npm run db:migrate
```

## Step 4: Run the System

### Development Mode

#### Run Everything (Recommended for Development)

```bash
# From the root of the monorepo
npm run dev
```

This starts all services:
- API server (Hono backend)
- Admin web dashboard (Next.js)
- Mobile app (React Native with Expo)

#### Run Individual Services

**Backend API Only:**
```bash
cd apps/api
npm run dev
```
The API will be available at `http://localhost:3000`

**Admin Dashboard Only:**
```bash
cd apps/admin-web
npm run dev
```
The dashboard will be available at `http://localhost:3001`

**Mobile App Only:**
```bash
cd apps/mobile
npm run start
```
Then scan the QR code with Expo Go app on your phone.

### Test the Agent NLP Service

Once the API is running, you can test the NLP endpoint:

```bash
# Test with curl (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/agent/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"How is traffic to downtown?"}'

# Expected response:
{
  "intent": "check_traffic",
  "entities": {
    "location": "downtown"
  },
  "originalQuery": "How is traffic to downtown?"
}
```

### Verify Services

**Check API Health:**
```bash
curl http://localhost:3000/health
```

**Check Redis Connection:**
```bash
cd packages/services/agent
npm run verify-connection
```

**Check Traffic Service:**
```bash
cd packages/services/agent
npm run verify-traffic
```

## Step 5: Build for Production

```bash
# Build all packages
npm run build

# Start production server
cd apps/api
npm run start
```

## Troubleshooting

### "GOOGLE_CLOUD_API_KEY not configured"

- Make sure you created the `.env` file in `apps/api/`
- Check that the key is spelled correctly
- Restart the dev server after adding environment variables

### "ECONNREFUSED" or Redis Connection Errors

- Verify your REDIS_URL and REDIS_TOKEN are correct
- Check that your Upstash Redis database is active
- Ensure you copied the REST API credentials (not the standard Redis URL)

### TypeScript Errors

```bash
# Check for type errors
npm run check-types

# Run linting
npm run lint
```

### Tests Not Running

The project currently has Jest ESM compatibility issues. This is documented as technical debt in Story 3.4.

## Project Structure

```
my-turborepo/
├── apps/
│   ├── api/              # Hono backend API
│   │   └── .env          # YOUR ENV FILE GOES HERE
│   ├── admin-web/        # Next.js admin dashboard
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── services/         # Business logic
│   │   ├── agent/        # AI agent & NLP service
│   │   └── reporting/    # Report submission service
│   ├── shared-types/     # TypeScript types
│   └── ui/               # Shared UI components
└── docs/                 # Documentation

```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all packages for production |
| `npm run lint` | Run ESLint on all packages |
| `npm run check-types` | Run TypeScript type checking |
| `npm test` | Run all tests |

## API Endpoints

### Agent Query Endpoint
- **URL**: `POST /api/v1/agent/query`
- **Body**: `{ "query": "your question here" }`
- **Response**: `{ "intent": "...", "entities": {...}, "originalQuery": "..." }`

### Report Submission
- **URL**: `POST /api/v1/reports`
- **Body**: `{ "description": "...", "photoUrl": "...", "location": {...} }`

### Report Status Check
- **URL**: `GET /api/v1/reports/:id`
- **Response**: Report details with status

## Cost Considerations

### Free Tier Limits

**Google Cloud APIs:**
- Natural Language API: 5,000 requests/month free
- Maps Routes API: $200 free credit/month

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth

**Upstash Redis:**
- Free tier: 10,000 commands/day

**Recommendation**: Start with free tiers, monitor usage, and upgrade as needed.

## Security Best Practices

1. **Never commit .env files** - They're in `.gitignore`
2. **Use environment-specific keys** - Different keys for dev/staging/production
3. **Rotate keys regularly** - Especially if exposed
4. **Use secrets management** - For production, use Vercel/AWS secrets manager
5. **Limit API key permissions** - Restrict Google API keys to specific APIs

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run the development server
3. ✅ Test the agent query endpoint
4. 📖 Read the architecture docs in `docs/architecture/`
5. 🎯 Start implementing stories from `docs/stories/`

## Getting Help

- Check `docs/architecture/` for system design
- Review story files in `docs/stories/` for features
- See `docs/qa/gates/` for quality reviews
- Ask questions in team chat

---

**Happy coding! 🚀**
