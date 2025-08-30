// middleware.ts (ROOT OF PROJECT)

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Skip API routes - let them handle their own auth
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Redirect admin users trying to access user dashboard
    if (
      req.nextUrl.pathname.startsWith("/users/dashboard") &&
      req.nextauth.token?.role === "admin"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    // Prevent non-admins from accessing admin routes
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/users/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    // Only protect these specific routes - DO NOT use catch-all patterns
    "/users/dashboard/:path*", 
    "/admin/:path*",
  ],
}
