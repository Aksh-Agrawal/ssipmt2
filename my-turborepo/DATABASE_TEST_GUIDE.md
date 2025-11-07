# 🧪 Database Connection Test Guide

## ✅ What We've Done

1. **Installed Supabase client**: `@supabase/supabase-js` in both apps
2. **Created utility files**: 
   - `apps/web-platform/lib/supabase.ts`
   - `apps/admin-web/lib/supabase.ts`
3. **Created test API routes**:
   - `apps/web-platform/app/api/test-db/route.ts`
   - `apps/admin-web/app/api/test-db/route.ts`
4. **Updated tsconfig.json**: Added path aliases (`@/*`)

---

## 🎯 Next Steps

### Step 1: Did You Run the Schema in Supabase?

If you haven't yet, **do this now**:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**
4. Copy ALL contents from `database/schema-complete.sql`
5. Paste into SQL Editor
6. Click **"RUN"** (bottom right)
7. Wait 10-15 seconds
8. You should see: **"✅ Success. No rows returned"**

---

### Step 2: Restart Both Servers

The servers need to restart to load the new environment variables:

```powershell
# Stop both servers (Ctrl+C in terminals)

# Terminal 1: Start User Portal
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform"
npm run dev

# Terminal 2: Start Admin Portal
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web"
npm run dev
```

---

### Step 3: Test Database Connection

Once both servers are running, open your browser:

#### Test User Portal Connection:
```
http://localhost:3000/api/test-db
```

#### Test Admin Portal Connection:
```
http://localhost:3002/api/test-db
```

---

## ✅ Expected Success Response

You should see JSON like this:

```json
{
  "success": true,
  "message": "✅ Database connection successful!",
  "data": {
    "reportsCount": 0,
    "usersCount": 0,
    "systemSettings": [
      {
        "key": "sla_critical_hours",
        "value": "2"
      },
      {
        "key": "sla_high_hours",
        "value": "6"
      },
      ...
    ],
    "supabaseUrl": "https://sbqmkbomrwlgcarmyqhw.supabase.co"
  },
  "timestamp": "2025-11-06T..."
}
```

**This means**:
- ✅ Database connection working
- ✅ Schema loaded (15 tables created)
- ✅ System settings initialized
- ✅ Ready to insert data!

---

## ❌ Possible Errors & Solutions

### Error 1: "relation 'system_settings' does not exist"
**Cause**: Schema not run in Supabase

**Solution**:
1. Go to Supabase SQL Editor
2. Run `database/schema-complete.sql`
3. Verify with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

---

### Error 2: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Cause**: Environment variables not loaded

**Solution**:
1. Check `.env.local` files have Supabase credentials
2. Restart both dev servers (Ctrl+C then `npm run dev`)
3. Clear browser cache

---

### Error 3: "Invalid API key"
**Cause**: Wrong credentials or extra spaces

**Solution**:
1. Go to Supabase → Project Settings → API
2. Copy anon key again (ensure no spaces)
3. Update `.env.local`
4. Restart servers

---

### Error 4: "Cannot find module '@/lib/supabase'"
**Cause**: TypeScript path alias not recognized

**Solution**: 
Already fixed! But if you see it:
1. Check `tsconfig.json` has `"baseUrl": "."` and `"paths": { "@/*": ["./*"] }`
2. Restart VS Code TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## 📊 Next Steps After Connection Test

Once you see success:

### 1. Insert Sample Data (Optional)
Go to Supabase → Table Editor → Pick a table → Insert row

Or run this in SQL Editor:
```sql
-- Insert a test user
INSERT INTO users (clerk_id, email, name, role) 
VALUES ('test_user_1', 'test@example.com', 'Test User', 'citizen');

-- Insert a test report (replace user_id with actual UUID from users table)
INSERT INTO reports (
  unique_id,
  description,
  category,
  priority,
  status,
  location,
  citizen_id,
  input_method,
  input_language
) VALUES (
  'RR-2025-000001',
  'Test pothole on Main Street',
  'Roads',
  'High',
  'Submitted',
  ST_GeogFromText('POINT(81.6296 21.2514)'),
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'text',
  'en'
);
```

### 2. Update Frontend to Use Real Data
Replace mock data in:
- `apps/web-platform/app/user/dashboard/page.tsx`
- `apps/admin-web/app/admin/dashboard/page.tsx`

### 3. Build API Routes
Create endpoints for:
- POST `/api/reports` - Create report
- GET `/api/reports` - List reports
- GET `/api/reports/[id]` - Get report details
- PATCH `/api/reports/[id]` - Update status

---

## 🔐 Security Notes

✅ **Safe to expose**:
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Protected by RLS policies

🔒 **NEVER expose**:
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- Only use on server (API routes, server components)

---

## Troubleshooting Commands

```powershell
# Check if servers are running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Check ports
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3002"

# Kill a process
taskkill /PID <process_id> /F

# Clear Next.js cache
cd apps/web-platform
rm -r .next

cd apps/admin-web
rm -r .next
```

---

## Summary Checklist

- [ ] Ran `schema-complete.sql` in Supabase SQL Editor
- [ ] Verified 15 tables created
- [ ] Restarted both dev servers
- [ ] Tested http://localhost:3000/api/test-db (got success)
- [ ] Tested http://localhost:3002/api/test-db (got success)
- [ ] (Optional) Inserted sample data
- [ ] Ready to build API routes!

**Test your database connection now!** 🚀
