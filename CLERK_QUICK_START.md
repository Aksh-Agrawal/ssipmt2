# 🚀 Quick Start - Get Clerk Working in 5 Minutes

## Step 1: Go to Clerk (2 minutes)

1. Open browser → https://clerk.com/
2. Click "**Start building for free**"
3. Sign up with email or GitHub
4. Verify your email

---

## Step 2: Create User Portal App (3 minutes)

In Clerk Dashboard:

1. Click "**+ Create Application**"
2. Name: `Civic Voice - User Portal`
3. Enable: ✅ Email, ✅ Phone (optional)
4. Click "**Create**"

**You'll see your keys:**
```
Publishable key: pk_test_abc123...
Secret key: sk_test_xyz789...
```

Copy both keys! 📋

---

## Step 3: Create Admin Portal App (3 minutes)

1. Click dropdown at top → "**+ Create application**"
2. Name: `Civic Voice - Admin Portal`
3. Enable: ✅ Email only
4. Click "**Create**"

**You'll see DIFFERENT keys:**
```
Publishable key: pk_test_def456...
Secret key: sk_test_uvw321...
```

Copy these too! 📋

---

## Step 4: Add Keys to Your Project (2 minutes)

### For User Portal:

Create file: `apps/web-platform/.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_USER_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_USER_SECRET_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### For Admin Portal:

Create file: `apps/admin-web/.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ADMIN_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ADMIN_SECRET_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

---

## Step 5: Test It! (2 minutes)

### Terminal 1:
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=web-platform
```

### Terminal 2:
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=admin-web
```

### Test URLs:
- User Portal: http://localhost:3000/sign-in
- Admin Portal: http://localhost:3002/login

You should see Clerk's beautiful sign-in forms! 🎉

---

## Verify Your Setup

Run this command:
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2"
.\verify-clerk-setup.ps1
```

If you see all ✅ green checkmarks, you're done!

---

## 🎯 Summary

**What you did:**
- ✅ Created 2 Clerk applications
- ✅ Got 4 API keys (2 per app)
- ✅ Created 2 `.env.local` files
- ✅ Started testing authentication

**Time taken:** ~10 minutes

**What's next:** Follow STATUS_REPORT.md to build features!

---

## 📞 Need Help?

**Common Issues:**

❌ **"Missing Clerk keys"**  
→ Check you created `.env.local` in the right folders

❌ **"Invalid key"**  
→ Keys start with `pk_test_` or `sk_test_`

❌ **"Not working"**  
→ Restart dev servers (Ctrl+C, then run again)

---

**Full guide:** See `CLERK_SETUP_GUIDE.md` for detailed instructions

**Total Setup Time:** 10 minutes ⏱️
