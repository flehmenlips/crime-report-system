import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { User } from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const typedCredentials = credentials as { username: string; password: string } | undefined
        console.log('🔐 Auth attempt:', {
          username: typedCredentials?.username,
          hasPassword: !!typedCredentials?.password,
          passwordLength: typedCredentials?.password?.length || 0,
          timestamp: new Date().toISOString()
        })

        // Use the new RBAC user database
        const { users } = await import('./lib/auth')

        const matchedUser = users.find(u => 
          u.username === typedCredentials?.username && 
          u.password === typedCredentials?.password
        )

        if (matchedUser) {
          console.log('✅ Authentication successful for:', matchedUser.role, matchedUser.name)
          return {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role
          } as User
        }

        console.log('❌ Authentication failed - no matching user found')
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  jwt: { maxAge: 8 * 60 * 60 },
  // pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) token.role = user.role as string
      return Promise.resolve(token)
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (session.user && token.role) session.user.role = token.role as string
      return Promise.resolve(session)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})
