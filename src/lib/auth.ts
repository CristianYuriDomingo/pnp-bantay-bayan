// lib/auth.ts - Complete Fixed Configuration
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // COMMENTED OUT - can't use with JWT
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    
    // Email & Password (Traditional login)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // Check if user exists and has a password (not OAuth-only user)
          if (!user || !user.password) return null

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt', // CHANGED TO JWT - required for middleware to work
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Store user data in JWT token
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'user'
      }
      
      // Handle OAuth sign-ins - save to database
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            // Create new user
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: 'user'
              }
            })
            token.id = newUser.id
            token.role = newUser.role
          } else {
            token.id = existingUser.id
            token.role = existingUser.role
          }
        } catch (error) {
          console.error("Database error during OAuth:", error)
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      // Add token data to session
      if (session.user && token) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // FIXED: Handle redirect loops properly
      
      // If user is on signin page, redirect to dashboard after successful auth
      if (url.startsWith('/auth/signin')) {
        return `${baseUrl}/users/dashboard`
      }
      
      // Allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default redirect after sign in
      return `${baseUrl}/users/dashboard`
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)