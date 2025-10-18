import { NextRequest, NextResponse } from 'next/server'
import { clearUserSession, getCurrentUser } from '@/lib/auth-server'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    // Get user info before clearing session (for audit log)
    const user = await getCurrentUser()
    
    await clearUserSession()
    
    // AUDIT LOG: User logout
    if (user) {
      await logAudit({
        userId: user.id,
        username: user.username,
        action: 'logout',
        success: true,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
