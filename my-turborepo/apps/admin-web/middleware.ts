import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes - admin portal requires authentication for all routes except login
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: '/login',
      unauthorizedUrl: '/login',
    });
  }
}, {
  afterSignInUrl: '/admin/dashboard',
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}