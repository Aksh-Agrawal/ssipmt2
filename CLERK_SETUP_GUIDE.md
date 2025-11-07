# 🔑 Clerk Setup Guide - Step by Step

## What is Clerk?
Clerk provides authentication (login/signup) for your application. You need **TWO separate Clerk applications** - one for users (citizens) and one for admins (authorities).

---

## Step 1: Create Clerk Account

1. Go to https://clerk.com/
2. Click "Start building for free"
3. Sign up with your email or GitHub
4. Verify your email

---

## Step 2: Create User Portal Application

### 2.1 Create the Application
1. After logging in, you'll see the Clerk dashboard
2. Click "**+ Create Application**" button
3. Fill in the details:
   - **Application Name**: `Civic Voice - User Portal`
   - **Select how users will sign in**: Check these boxes:
     - ✅ Email address
     - ✅ Phone number (optional but recommended)
     - ✅ Username (optional)
   - **Social Login** (Optional): You can enable Google, Facebook if you want

4. Click "**Create application**"

### 2.2 Get Your Keys
After creating the application, you'll see the **API Keys** page:

1. Copy the **Publishable key** (starts with `pk_test_...`)
2. Copy the **Secret key** (starts with `sk_test_...`)
3. Keep these safe - you'll use them in a moment!

### 2.3 Configure the Application
1. In the left sidebar, click "**Paths**"
2. Set these paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/user/dashboard`
   - After sign-in URL: `/user/dashboard`
   - After sign-up URL: `/user/dashboard`

3. Click "**Save changes**"

---

## Step 3: Create Admin Portal Application

### 3.1 Create Second Application
1. In the top-left, click on your application name dropdown
2. Click "**+ Create application**"
3. Fill in the details:
   - **Application Name**: `Civic Voice - Admin Portal`
   - **Select how users will sign in**: 
     - ✅ Email address
     - (Admins typically don't need phone/username)

4. Click "**Create application**"

### 3.2 Get Admin Keys
1. Copy the **Publishable key** (different from user portal!)
2. Copy the **Secret key** (different from user portal!)
3. **Important**: These keys are DIFFERENT from the user portal keys!

### 3.3 Configure Admin Application
1. Click "**Paths**" in sidebar
2. Set these paths:
   - Sign-in URL: `/login`
   - Home URL: `/admin/dashboard`
   - After sign-in URL: `/admin/dashboard`

3. Click "**Save changes**"

---

## Step 4: Add Keys to Your Project

Now you have **4 keys total**:
- User Portal: Publishable Key + Secret Key
- Admin Portal: Publishable Key + Secret Key

### 4.1 User Portal Configuration

Create file: `apps/web-platform/.env.local`

```env
# Clerk Keys - USER PORTAL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_USER_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_USER_SECRET_KEY_HERE

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**How to create the file:**
```powershell
# Open in VS Code or create manually
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform"
New-Item -Path ".env.local" -ItemType File
code .env.local
```

Then paste the configuration above with YOUR actual keys!

### 4.2 Admin Portal Configuration

Create file: `apps/admin-web/.env.local`

```env
# Clerk Keys - ADMIN PORTAL (DIFFERENT KEYS!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_ADMIN_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_ADMIN_SECRET_KEY_HERE

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (you'll add these later)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to create the file:**
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web"
New-Item -Path ".env.local" -ItemType File
code .env.local
```

---

## Step 5: Verify Setup

### 5.1 Start the Applications

Open **3 separate PowerShell terminals**:

**Terminal 1 - API:**
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=api
```
You should see: `Server running on http://localhost:3001`

**Terminal 2 - User Portal:**
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=web-platform
```
You should see: `Ready on http://localhost:3000`

**Terminal 3 - Admin Portal:**
```powershell
cd "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo"
npm run dev --workspace=admin-web
```
You should see: `Ready on http://localhost:3002`

### 5.2 Test User Portal

1. Open browser: http://localhost:3000
2. You should see the home page
3. Navigate to: http://localhost:3000/sign-in
4. You should see the Clerk sign-in form
5. Click "Sign up" and create a test account
6. After signing up, you should be redirected (route will be created next)

### 5.3 Test Admin Portal

1. Open browser: http://localhost:3002
2. Navigate to: http://localhost:3002/login
3. You should see the Clerk sign-in form for admins
4. Create an admin account

---

## Step 6: Create Admin User in Clerk Dashboard

To make someone an admin:

1. Go to Clerk dashboard for **Admin Portal** application
2. Click "**Users**" in sidebar
3. Click "**+ Create user**"
4. Enter admin email and password
5. Click "Create"

Now you can use these credentials to log into the admin portal!

---

## Troubleshooting

### Issue 1: "Missing Clerk keys"
**Solution**: Make sure you created the `.env.local` files in the correct locations:
- `apps/web-platform/.env.local`
- `apps/admin-web/.env.local`

Check they exist:
```powershell
Test-Path "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\web-platform\.env.local"
Test-Path "c:\A SSD NEW WIN\code\ssipmt2\my-turborepo\apps\admin-web\.env.local"
```

Both should return `True`

### Issue 2: "Invalid publishable key"
**Solution**: 
- Keys should start with `pk_test_` (publishable) or `sk_test_` (secret)
- Make sure you copied the complete key (no spaces)
- Check you're using the right keys for each portal (they're different!)

### Issue 3: Authentication not working
**Solution**: 
1. Restart the development servers (Ctrl+C and run again)
2. Clear browser cache and cookies
3. Make sure the paths in Clerk dashboard match your `.env.local` settings

### Issue 4: Can't see sign-in form
**Solution**: 
- Check you navigated to the correct URL
- User portal: http://localhost:3000/sign-in
- Admin portal: http://localhost:3002/login
- Make sure the server is running (check terminal)

---

## Security Notes

⚠️ **Important Security Tips:**

1. **Never commit `.env.local` to Git** - These files are already in `.gitignore`
2. **Don't share your secret keys** - Keep them private
3. **Use different keys for production** - When you deploy, create new production keys in Clerk
4. **Rotate keys if exposed** - If you accidentally expose keys, regenerate them in Clerk dashboard

---

## What's Next?

After Clerk is working, you need to:

1. ✅ **Clerk Setup** (You're doing this now!)
2. 📋 **Supabase Setup** - Database for storing reports
3. 📋 **Create Dashboard Routes** - User and admin dashboards
4. 📋 **Add Features** - Report submission, maps, etc.

---

## Quick Reference

### Your Clerk Applications:
- **User Portal**: For citizens to report issues
- **Admin Portal**: For authorities to manage reports

### File Locations:
- User config: `apps/web-platform/.env.local`
- Admin config: `apps/admin-web/.env.local`

### Test URLs:
- User sign-in: http://localhost:3000/sign-in
- User sign-up: http://localhost:3000/sign-up
- Admin login: http://localhost:3002/login
- API: http://localhost:3001

---

## Need Help?

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com/
- **Support**: support@clerk.com

---

**Setup Time**: ~15-20 minutes  
**Last Updated**: November 6, 2025
