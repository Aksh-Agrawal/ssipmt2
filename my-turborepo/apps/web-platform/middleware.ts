import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import createIntlMiddleware from 'next-intl/middleware';
// import { locales } from './i18n';
import { NextRequest } from 'next/server';

// Create the i18n middleware
// const intlMiddleware = createIntlMiddleware({
//   locales,
//   defaultLocale: 'en',
//   localePrefix: 'as-needed',
// });

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)', // Allow all API routes without authentication
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // First handle i18n
  // const response = intlMiddleware(request);
  
  // Then handle Clerk authentication
  if (!isPublicRoute(request)) {
    const url = new URL(request.url);
    await auth.protect({
      unauthenticatedUrl: `${url.origin}/sign-in`,
      unauthorizedUrl: `${url.origin}/`,
    });
  }
  
  // return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
