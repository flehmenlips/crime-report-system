import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SuperAdmin
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, email, currentPassword, newPassword } = body

    // Validate required fields
    if (!name || !username || !email) {
      return NextResponse.json({ 
        error: 'Name, username, and email are required' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        id: { not: currentUser.id }
      }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Username is already taken' 
      }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: currentUser.id }
      }
    })

    if (existingEmail) {
      return NextResponse.json({ 
        error: 'Email is already taken' 
      }, { status: 400 })
    }

    // If password change is requested, validate current password
    let passwordHash = undefined
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ 
          error: 'Current password is required to change password' 
        }, { status: 400 })
      }

      // Get current user to verify current password
      const dbUser = await prisma.user.findUnique({
        where: { id: currentUser.id }
      })

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, dbUser.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ 
          error: 'Current password is incorrect' 
        }, { status: 400 })
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return NextResponse.json({ 
          error: 'New password must be at least 8 characters long' 
        }, { status: 400 })
      }

      passwordHash = await hashPassword(newPassword)
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        username,
        email,
        ...(passwordHash && { password: passwordHash }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        accessLevel: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        tenantId: true
      }
    })

    // Log the profile update for audit trail
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'PROFILE_UPDATE',
        resourceType: 'USER',
        resource: currentUser.id,
        details: JSON.stringify({
          fields: ['name', 'username', 'email', ...(passwordHash ? ['password'] : [])],
          timestamp: new Date().toISOString()
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: passwordHash ? 'Profile and password updated successfully' : 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SuperAdmin
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        accessLevel: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        tenantId: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}