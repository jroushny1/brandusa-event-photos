import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// TEMPORARILY DISABLED - Waiting for IT to configure OneLogin
// Once OneLogin is configured, uncomment the auth middleware below

export default auth((req) => {
  const { nextUrl } = req

  // Redirect home to gallery
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/gallery', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

/*
ORIGINAL MIDDLEWARE - RESTORE AFTER ONELOGIN IS CONFIGURED:

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtectedRoute =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/gallery') ||
    nextUrl.pathname.startsWith('/upload') ||
    nextUrl.pathname.startsWith('/setup')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  // Redirect logged-in users from signin page to gallery
  if (nextUrl.pathname === '/auth/signin' && isLoggedIn) {
    return NextResponse.redirect(new URL('/gallery', nextUrl))
  }

  // Redirect home to gallery if logged in, otherwise to signin
  if (nextUrl.pathname === '/') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/gallery', nextUrl))
    } else {
      return NextResponse.redirect(new URL('/auth/signin', nextUrl))
    }
  }

  return NextResponse.next()
})
*/
