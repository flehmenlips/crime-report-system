import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, setUserSession } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    console.log('=== LOGIN API DEBUG ===')
    console.log('Received login request:', { username, password: '***' })
    
    if (!username || !password) {
      console.log('Missing username or password')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const user = await authenticateUser(username, password)
    console.log('Authentication result:', user ? 'SUCCESS' : 'FAILED')
    
    if (!user) {
      console.log('=== END LOGIN API DEBUG ===')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    await setUserSession(user)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
