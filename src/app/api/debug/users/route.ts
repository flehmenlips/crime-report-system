import { NextResponse } from 'next/server'

// Debug endpoint to check available users (remove in production)
export async function GET() {
  try {
    // Import the users array dynamically to ensure we get the latest version
    const { users } = await import('@/lib/auth')
    
    return NextResponse.json({
      totalUsers: users.length,
      users: users.map(u => ({
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
