import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'
import { hashPassword, validatePasswordStrength, isCommonPassword } from '@/lib/password'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength (Law enforcement compliant)
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Check for common passwords
    if (isCommonPassword(password)) {
      return NextResponse.json(
        { 
          error: 'Password is too common. Please choose a more unique password.',
          details: ['Password appears in common password lists']
        },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password before storing
    const hashedPassword = await hashPassword(password)

    // Update user with new password and clear reset tokens
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        isActive: true // Activate account after password is set
      }
    })

    // If this was an invitation setup (user had temp password), send welcome email
    if (user.password === 'temp-password-needs-setup') {
      try {
        await EmailService.sendWelcomeEmail(
          user.email,
          user.name,
          user.role
        )
      } catch (error) {
        console.error('Failed to send welcome email after invitation setup:', error)
        // Don't fail the password reset if welcome email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Verify token is valid and not expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      email: user.email,
      isInvitationSetup: user.password === 'temp-password-needs-setup'
    })

  } catch (error) {
    console.error('Error verifying reset token:', error)
    return NextResponse.json(
      { error: 'Failed to verify reset token' },
      { status: 500 }
    )
  }
}
