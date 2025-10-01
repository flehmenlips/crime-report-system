import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'
import { EmailService } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Property owners can only access their own tenant's users
    if (!currentUser.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: currentUser.tenantId
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const usersWithStats = users.map(user => ({
      ...user,
      itemCount: user._count.items,
      lastLogin: user.lastLoginAt?.toISOString() || null
    }))

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error('Error fetching tenant users:', error)
    return NextResponse.json({ error: 'Failed to fetch tenant users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can invite users to their tenant
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json({ error: 'Only property owners can invite users' }, { status: 403 })
    }

    if (!currentUser.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 })
    }

    const { username, email, name, password, role = 'assistant' } = await request.json()

    // Validate required fields
    if (!username || !email || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Create user and assign to current user's tenant
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password, // In a real app, you'd hash this
        role: role as any,
        accessLevel: 'stakeholder' as any,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        company: '',
        title: '',
        bio: '',
        avatar: '',
        emailVerified: false,
        isActive: true,
        preferences: '',
        tenantId: currentUser.tenantId, // Assign to current user's tenant
      },
      include: {
        tenant: true
      }
    })

    console.log(`✅ User "${name}" invited to tenant "${currentUser.tenantId}"`)

    // Send invitation email
    const tenant = await prisma.tenant.findUnique({
      where: { id: currentUser.tenantId }
    })

    if (tenant) {
      const emailResult = await EmailService.sendInvitationEmail(
        email,
        name,
        currentUser.name,
        tenant.name
      )

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // Don't fail the invitation if email fails, but log it
      } else {
        console.log(`📧 Invitation email sent to ${email}`)
      }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      success: true,
      message: 'User invited successfully and invitation email sent',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    )
  }
}
