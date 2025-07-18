import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user needs to select user type, redirect to selection page
    if (token?.needsUserType && path !== "/auth/select-user-type") {
      return NextResponse.redirect(new URL("/auth/select-user-type", req.url))
    }

    // If user has userType but is on selection page, redirect to dashboard
    if (!token?.needsUserType && token?.userType && path === "/auth/select-user-type") {
      if (token.userType === "JOB_SEEKER") {
        return NextResponse.redirect(new URL("/dashboard/job-seeker", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard/job-provider", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Allow access to auth pages
        if (path.startsWith("/auth/")) {
          return true
        }

        // Require authentication for dashboard pages
        if (path.startsWith("/dashboard")) {
          return !!token
        }

        // Allow access to public pages
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/auth/select-user-type"]
}
