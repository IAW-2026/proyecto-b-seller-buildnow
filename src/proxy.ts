import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const role = sessionClaims?.metadata?.role as string | undefined;
  const isProtectedRoute = isSellerRoute(req) || isAdminRoute(req);

  if (isProtectedRoute && !userId) {
    return redirectToSignIn();
  }

  if (isSellerRoute(req)) {
    if (role === 'admin') return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role !== 'seller') return NextResponse.redirect(new URL('/no-autorizado', req.url));
  }

  if (isAdminRoute(req)) {
    if (role === 'seller') return NextResponse.redirect(new URL("/seller/dashboard", req.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/no-autorizado', req.url));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
