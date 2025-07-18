import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true // Allow all sign-ins, handle user type logic in JWT callback
    },
    async jwt({ token, user, account, trigger }) {
      // Handle session update (when user selects their type)
      if (trigger === "update") {
        // Simply refresh the token from database
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: { 
              id: true,
              userType: true,
              password: true
            },
          })
          
          if (dbUser) {
            token.id = dbUser.id
            token.userType = dbUser.userType
            token.needsUserType = false // User has made their selection
          }
        }
        return token
      }

      // For initial sign-in or token refresh
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { 
            id: true,
            userType: true,
            password: true // Use password field as indicator of manual signup
          },
        })
        
        if (dbUser) {
          // Set the user ID
          token.id = dbUser.id
          
          if (dbUser.password) {
            // User signed up manually (has password), they chose their type during signup
            token.userType = dbUser.userType
            token.needsUserType = false
          } else {
            // User signed up with Google
            // Check if they still have the default JOB_SEEKER and it's their first time
            // We'll assume if they're not JOB_SEEKER, they've made a choice
            if (dbUser.userType === 'JOB_SEEKER' && !token.userType) {
              // First time Google user with default type
              token.needsUserType = true
            } else {
              // They've either selected a type or it's not their first login
              token.userType = dbUser.userType
              token.needsUserType = false
            }
          }
        }
      }
      
      // For credentials login
      if (user && account?.provider === "credentials") {
        token.userType = user.userType
        token.needsUserType = false
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) || token.sub!
        session.user.userType = (token.userType as string) || null
        session.user.needsUserType = token.needsUserType as boolean || false
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
