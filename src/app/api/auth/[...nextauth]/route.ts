// NextAuth disabled - using custom authentication system
// import NextAuth from "next-auth"
// import { handlers } from "@/auth"

// export const { GET, POST } = handlers

export async function GET() {
  return new Response('NextAuth disabled - using custom auth', { status: 200 })
}

export async function POST() {
  return new Response('NextAuth disabled - using custom auth', { status: 200 })
}
