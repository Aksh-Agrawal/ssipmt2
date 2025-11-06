# ✅ Clerk Setup Checklist

Print this or keep it open while you work!

---

## Phase 1: Clerk Website

- [ ] Go to https://clerk.com/
- [ ] Sign up / Create account
- [ ] Verify email

---

## Phase 2: User Portal Application

- [ ] Click "Create Application"
- [ ] Name: `Civic Voice - User Portal`
- [ ] Enable Email sign-in
- [ ] Click "Create"
- [ ] Copy Publishable Key (pk_test_...)
- [ ] Copy Secret Key (sk_test_...)
- [ ] Save keys somewhere safe (notepad)

---

## Phase 3: Admin Portal Application

- [ ] Click application dropdown → "Create application"
- [ ] Name: `Civic Voice - Admin Portal`
- [ ] Enable Email sign-in
- [ ] Click "Create"
- [ ] Copy Publishable Key (pk_test_...) - DIFFERENT from user!
- [ ] Copy Secret Key (sk_test_...) - DIFFERENT from user!
- [ ] Save keys somewhere safe

---

## Phase 4: Create Config Files

### User Portal Config:

- [ ] Open VS Code or terminal
- [ ] Navigate to: `apps/web-platform/`
- [ ] Create file: `.env.local`
- [ ] Paste template from CLERK_QUICK_START.md
- [ ] Replace `YOUR_USER_KEY_HERE` with actual keys
- [ ] Save file

### Admin Portal Config:

- [ ] Navigate to: `apps/admin-web/`
- [ ] Create file: `.env.local`
- [ ] Paste template from CLERK_QUICK_START.md
- [ ] Replace `YOUR_ADMIN_KEY_HERE` with actual keys
- [ ] Save file

---

## Phase 5: Verify Setup

- [ ] Open PowerShell
- [ ] Run: `cd "c:\A SSD NEW WIN\code\ssipmt2"`
- [ ] Run: `.\verify-clerk-setup.ps1`
- [ ] Check for green ✅ checkmarks
- [ ] Fix any red ❌ errors

---

## Phase 6: Test Applications

### Start Servers:

- [ ] Open Terminal 1
- [ ] Run: `npm run dev --workspace=web-platform`
- [ ] See: "Ready on http://localhost:3000"

- [ ] Open Terminal 2
- [ ] Run: `npm run dev --workspace=admin-web`
- [ ] See: "Ready on http://localhost:3002"

### Test User Portal:

- [ ] Open browser: http://localhost:3000/sign-in
- [ ] See Clerk sign-in form
- [ ] Click "Sign up"
- [ ] Create test account
- [ ] Successfully sign up

### Test Admin Portal:

- [ ] Open browser: http://localhost:3002/login
- [ ] See Clerk login form
- [ ] Create admin account
- [ ] Successfully log in

---

## ✅ DONE!

When all boxes are checked, Clerk is working!

**Next step:** Follow STATUS_REPORT.md to build dashboards and features

---

## 📌 Important Notes

⚠️ **You need 4 keys total:**
- User Publishable Key
- User Secret Key
- Admin Publishable Key (different!)
- Admin Secret Key (different!)

⚠️ **Don't mix them up!** Each portal has its own set of keys.

⚠️ **Keys are secret!** Don't share or commit to Git.

---

**Estimated time:** 10-15 minutes  
**Difficulty:** Easy 😊

**Having trouble?** See CLERK_SETUP_GUIDE.md for detailed help.
