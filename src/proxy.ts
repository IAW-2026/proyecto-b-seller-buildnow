import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string | undefined;

  // Admin intentando acceder a rutas de seller → redirigir a su dashboard
  if (isSellerRoute(req) && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Seller intentando acceder a rutas de admin → redirigir a su dashboard
  if (isAdminRoute(req) && role === "seller") {
    return NextResponse.redirect(new URL("/seller/dashboard", req.url));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
