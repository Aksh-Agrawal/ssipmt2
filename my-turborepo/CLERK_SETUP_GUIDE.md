# Clerk Setup Guide - User Portal Fix

## Problem
After logging in, users see "Welcome, [name]. You are signed in. Now, it's time to connect Clerk to your application" instead of being redirected to the dashboard.

## ✅ Solution Applied (No Dashboard Changes Needed!)

Since you cannot edit the URLs in Clerk Dashboard with test keys, **I've configured everything in the code** instead:

## Solution

### 1. ~~Configure Clerk Dashboard Settings~~ ✅ SKIPPED - Not needed with test keys!

**Good news:** Clerk test keys don't allow URL editing in the dashboard, so I configured everything in the code instead!

### 2. Environment Variables (Already Updated)

Your `.env.local` file has been updated with:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvYmFibGUtbWFjYXF1ZS0yMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_EuUHbYCC3W0F96cWGbJuiGKfiGORm0AuG6EUZIHLf0

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/dashboard
```

### 3. Code Changes (Already Applied) ✅

**Main Layout** (`apps/web-platform/app/layout.tsx`):
```tsx
<ClerkProvider
  signInUrl="/sign-in"
  signUpUrl="/sign-up"
  afterSignInUrl="/user/dashboard"
  afterSignUpUrl="/user/dashboard"
>
```

**Middleware** (`apps/web-platform/middleware.ts`):
```tsx
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: '/sign-in',
      unauthorizedUrl: '/',
    });
  }
}, {
  afterSignInUrl: '/user/dashboard',
  afterSignUpUrl: '/user/dashboard',
});
```

**Landing Page** (`apps/web-platform/app/page.tsx`):
- Now automatically redirects authenticated users to `/user/dashboard`
- Prevents showing the landing page if already logged in

### 3. Original Code Changes

**SignIn Component** (`apps/web-platform/app/sign-in/[[...sign-in]]/page.tsx`):
```tsx
<SignIn 
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
  afterSignInUrl="/user/dashboard"
  redirectUrl="/user/dashboard"
/>
```

**SignUp Component** (`apps/web-platform/app/sign-up/[[...sign-up]]/page.tsx`):
```tsx
<SignUp 
  routing="path"
  path="/sign-up"
  signInUrl="/sign-in"
  afterSignUpUrl="/user/dashboard"
  redirectUrl="/user/dashboard"
/>
```

### 4. Testing

1. **Clear browser cache and cookies** (important!)
2. **Navigate to**: http://localhost:3000
3. **Click "Login as Citizen"**
4. **Sign in with your credentials**
5. **You should be redirected to**: http://localhost:3000/user/dashboard

### 5. Production URLs (For Future Deployment)

When deploying to production, update Clerk dashboard with your production URLs:
- Sign-in URL: `https://yourdomain.com/sign-in`
- Sign-up URL: `https://yourdomain.com/sign-up`
- After sign-in URL: `https://yourdomain.com/user/dashboard`
- After sign-up URL: `https://yourdomain.com/user/dashboard`
- Home URL: `https://yourdomain.com`

## Troubleshooting

### Still seeing "Welcome" page after signing in?

1. **Check Clerk Dashboard**: Make sure the URLs are saved correctly
2. **Clear browser cache**: Clerk caches authentication state
3. **Check browser console**: Look for any JavaScript errors
4. **Verify environment variables**: Make sure `.env.local` is loaded
5. **Restart dev server**: Server must be restarted after `.env.local` changes (already done)

### Error: "Invalid redirect URL"

- Make sure the URLs in Clerk dashboard match exactly with your application URLs
- Check for typos in the URLs
- Ensure `http://` or `https://` protocol is included

## Server Status

✅ Web Platform Server: Running on http://localhost:3000
✅ Environment variables: Updated
✅ Code changes: Applied
⏳ Clerk Dashboard: **YOU NEED TO UPDATE THIS MANUALLY**

## Next Steps

1. Go to https://dashboard.clerk.com
2. Configure the redirect URLs as specified above
3. Clear your browser cache
4. Test the login flow again
