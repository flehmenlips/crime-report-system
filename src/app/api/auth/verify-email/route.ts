import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        tenant: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user to mark email as verified and clear tokens
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
        isActive: true // Activate the account
      },
      include: {
        tenant: true
      }
    })

    // Send welcome email
    await EmailService.sendWelcomeEmail(
      user.email,
      user.name,
      user.role
    )

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
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
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user to mark email as verified and clear tokens
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
        isActive: true // Activate the account
      },
      include: {
        tenant: true
      }
    })

    // Send welcome email
    await EmailService.sendWelcomeEmail(
      user.email,
      user.name,
      user.role
    )

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
