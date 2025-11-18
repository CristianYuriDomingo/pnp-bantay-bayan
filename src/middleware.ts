// middleware.ts (ROOT OF PROJECT)

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getQuestDayFromPath } from "@/lib/quest-access-validator"

export default withAuth(
  function middleware(req) {
    // Skip API routes - let them handle their own auth
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // ========================================
    // QUEST PAGE PROTECTION
    // ========================================
    // Check if accessing a quest day page
    const questDay = getQuestDayFromPath(req.nextUrl.pathname);
    
    if (questDay) {
      // Quest pages require authentication - redirect to sign in if not authenticated
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
      
      // Let the page component handle detailed access validation
      // (We can't do async DB calls in middleware)
      return NextResponse.next()
    }

    // ========================================
    // ADMIN/USER DASHBOARD PROTECTION
    // ========================================
    
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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    // Protect user dashboard and admin routes
    "/users/dashboard/:path*", 
    "/admin/:path*",
    // Protect all quest day pages
    "/users/questMonday",
    "/users/questTuesday",
    "/users/questWednesday",
    "/users/questThursday",
    "/users/questFriday",
  ],
}