// lib/auth.ts - Updated with email verification check
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
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
          console.log('🔐 Sign-in attempt for:', credentials.email);

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // Check if user exists and has a password (not OAuth-only user)
          if (!user || !user.password) {
            console.log('❌ User not found or no password set');
            return null;
          }

          // 🆕 NEW: Check if email is verified
          if (!user.emailVerified) {
            console.log('❌ Email not verified for:', user.email);
            throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
          }

          // 🆕 NEW: Check if account is active
          if (user.status !== 'active') {
            console.log('❌ Account not active:', user.status);
            throw new Error('Your account is not active. Please contact support.');
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Sign-in successful for:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          // Re-throw the error so NextAuth can display it
          throw error;
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
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
          console.log('🔐 OAuth sign-in for:', user.email);

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            console.log('✨ Creating new OAuth user:', user.email);
            // Create new user with verified email (OAuth providers verify emails)
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: 'user',
                status: 'active', // 🆕 Active immediately for OAuth users
                emailVerified: new Date() // 🆕 OAuth emails are pre-verified
              }
            })
            token.id = newUser.id
            token.role = newUser.role
          } else {
            // 🆕 Update existing OAuth user to mark as verified if not already
            if (!existingUser.emailVerified) {
              console.log('🔄 Updating OAuth user to verified:', existingUser.email);
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  emailVerified: new Date(),
                  status: 'active'
                }
              });
            }
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
    // 🆕 NEW: Add verify request page
    verifyRequest: '/auth/verify-request',
  },
  
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)