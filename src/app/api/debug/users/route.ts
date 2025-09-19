import { NextResponse } from 'next/server'
import { users } from '@/lib/auth'

// Debug endpoint to check available users (remove in production)
export async function GET() {
  try {
    return NextResponse.json({
      totalUsers: users.length,
      users: users.map((u: any) => ({
        username: u.username,
        role: u.role,
        name: u.name,
        hasPassword: !!u.password
      }))
    })
  } catch (error) {
    console.error('Debug users error:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
