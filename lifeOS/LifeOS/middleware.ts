// MIDDLEWARE - Clerk authentication and route protection
// /Users/matthewsimon/Projects/LifeOS/LifeOS/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/api/terminal(.*)", // Protect terminal API
  "/api/files(.*)", // Protect files API
  // Note: /api/research is excluded for demo purposes
  "/dashboard(.*)", // If you add a dedicated dashboard route
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
