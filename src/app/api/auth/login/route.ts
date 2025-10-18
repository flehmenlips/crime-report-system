import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, setUserSession } from '@/lib/auth-server'
import { logAuthAttempt } from '@/lib/audit'

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
      // AUDIT LOG: Failed login attempt (CRITICAL for security monitoring)
      await logAuthAttempt({
        username,
        success: false,
        reason: 'Invalid credentials',
        request
      })
      
      console.log('=== END LOGIN API DEBUG ===')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // AUDIT LOG: Successful login (CRITICAL for law enforcement chain of custody)
    await logAuthAttempt({
      username: user.username,
      userId: user.id,
      success: true,
      request
    })
    
    console.log('Setting user session for:', user.name, user.role)
    await setUserSession(user)
    console.log('Session set successfully')
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
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
