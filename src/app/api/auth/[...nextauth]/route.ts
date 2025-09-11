import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authRateLimiter, createRateLimitKey, createRateLimitResponse } from "@/lib/rateLimit"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth attempt:', {
          username: credentials?.username,
          hasPassword: !!credentials?.password,
          passwordLength: credentials?.password?.length
        })

        // Multi-user authentication for testing
        const users = [
          {
            username: 'admin',
            password: 'password',
            user: {
              id: "1",
              name: "Police Officer",
              email: "officer@police.gov",
              role: "law_enforcement"
            }
          },
          {
            username: 'citizen',
            password: 'password',
            user: {
              id: "2", 
              name: "George Page",
              email: "george@birkenfeldfarm.com",
              role: "citizen"
            }
          },
          {
            username: 'george',
            password: 'password',
            user: {
              id: "3",
              name: "George Page",
              email: "george@birkenfeldfarm.com", 
              role: "citizen"
            }
          }
        ]

        const matchedUser = users.find(u => 
          u.username === credentials?.username && 
          u.password === credentials?.password
        )

        if (matchedUser) {
          console.log('Authentication successful for:', matchedUser.user.role)
          return matchedUser.user
        }

        console.log('Authentication failed')
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (reduced from 24 for better security)
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.loginTime = Date.now()
      }

      // Check session age for additional security
      if (token.loginTime) {
        const sessionAge = Date.now() - token.loginTime
        const maxSessionAge = 8 * 60 * 60 * 1000 // 8 hours

        if (sessionAge > maxSessionAge) {
          throw new Error('Session expired')
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.loginTime = token.loginTime as number
      }
      return session
    },
  },
  events: {
    async signOut({ session, token }) {
      // Log sign out events for security monitoring
      console.log(`User signed out: ${session?.user?.name || 'Unknown'} at ${new Date().toISOString()}`)
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
