import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    console.log('=== EMAIL SYSTEM TEST ===')
    
    // Check environment variables
    const hasResendKey = !!process.env.RESEND_API_KEY
    const hasEmailFrom = !!process.env.EMAIL_FROM
    const hasEmailReplyTo = !!process.env.EMAIL_REPLY_TO
    
    console.log('Environment check:', {
      hasResendKey,
      hasEmailFrom,
      hasEmailReplyTo,
      emailFrom: process.env.EMAIL_FROM,
      emailReplyTo: process.env.EMAIL_REPLY_TO,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    })
    
    if (!hasResendKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables',
        environment: {
          hasResendKey,
          hasEmailFrom,
          hasEmailReplyTo
        }
      }, { status: 500 })
    }
    
    // Test sending a simple notification email
    const testResult = await EmailService.sendNotificationEmail(
      'test@example.com', // This will fail, but we'll see the error
      'Test Email System',
      'This is a test email to verify the email system is working.',
      'Test Button',
      'https://example.com'
    )
    
    return NextResponse.json({
      success: true,
      message: 'Email system test completed',
      environment: {
        hasResendKey,
        hasEmailFrom,
        hasEmailReplyTo,
        emailFrom: process.env.EMAIL_FROM,
        emailReplyTo: process.env.EMAIL_REPLY_TO
      },
      testResult
    })
    
  } catch (error) {
    console.error('Email system test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
