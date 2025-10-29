import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [
    {
      id: "onelogin",
      name: "OneLogin",
      type: "oidc",
      issuer: process.env.ONELOGIN_ISSUER,
      clientId: process.env.ONELOGIN_CLIENT_ID,
      clientSecret: process.env.ONELOGIN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: profile.picture
        }
      }
    }
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnGallery = nextUrl.pathname.startsWith('/gallery')
      const isOnUpload = nextUrl.pathname.startsWith('/upload')
      const isOnSetup = nextUrl.pathname.startsWith('/setup')

      // Protect all main routes
      const isProtectedRoute = isOnDashboard || isOnGallery || isOnUpload || isOnSetup

      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return true
      }

      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
