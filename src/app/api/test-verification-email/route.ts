import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Generate a test verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    console.log('=== TESTING VERIFICATION EMAIL ===')
    console.log('Sending verification email to:', email)
    console.log('Token:', verificationToken)

    // Send verification email
    const result = await EmailService.sendVerificationEmail(
      email,
      name,
      verificationToken
    )

    console.log('Verification email result:', result)

    return NextResponse.json({
      success: true,
      message: 'Test verification email sent',
      emailResult: result,
      token: verificationToken
    })

  } catch (error) {
    console.error('Error in test verification email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
