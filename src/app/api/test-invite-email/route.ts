import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Test the exact same invitation email flow
    const setupPasswordUrl = `${process.env.NEXTAUTH_URL || 'https://www.remise.farm'}/login-simple?invited=true&email=${encodeURIComponent(email)}`
    
    const result = await EmailService.sendInvitationEmail(
      email,
      'Test User',
      currentUser.name,
      'Test Property',
      setupPasswordUrl,
      'testuser',
      'testpass123'
    )

    return NextResponse.json({
      success: result.success,
      result: result,
      debug: {
        from: process.env.EMAIL_FROM,
        apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Not set',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Test invite email error:', error)
    return NextResponse.json({ 
      error: 'Test invite email failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
