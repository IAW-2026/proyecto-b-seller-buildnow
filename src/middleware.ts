import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Rutas que requieren que el usuario esté logueado
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
