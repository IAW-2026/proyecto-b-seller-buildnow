import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  const role = sessionClaims?.metadata?.role as string | undefined;

  if (userId && !role && (isSellerRoute(req) || isAdminRoute(req))) {
    return NextResponse.redirect(new URL("/redirect", req.url));
  }

  if (isSellerRoute(req) && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (isAdminRoute(req) && role === "seller") {
    return NextResponse.redirect(new URL("/seller/dashboard", req.url));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
