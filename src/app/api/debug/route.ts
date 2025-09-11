import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const authUsername = process.env.AUTH_USERNAME
  const authPassword = process.env.AUTH_PASSWORD
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      AUTH_USERNAME: authUsername ? '***SET***' : 'NOT SET',
      AUTH_PASSWORD: authPassword ? '***SET***' : 'NOT SET',
      NEXTAUTH_SECRET: nextAuthSecret ? '***SET***' : 'NOT SET',
      NEXTAUTH_URL: nextAuthUrl || 'NOT SET'
    },
    actualValues: {
      AUTH_USERNAME: authUsername,
      AUTH_PASSWORD: authPassword,
      NEXTAUTH_URL: nextAuthUrl
    }
  })
}
