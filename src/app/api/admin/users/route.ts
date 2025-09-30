import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { canSuperAdmin } from '@/lib/auth'

// GET /api/admin/users - Get all users (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        tenant: true,
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

    // Format users with tenant information
    const usersWithTenants = users.map(user => ({
      ...user,
      itemCount: user._count.items,
      lastLogin: user.lastLoginAt?.toISOString() || null
    }))

    return NextResponse.json({ users: usersWithTenants })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, name, password, role = 'property_owner', tenantId } = body

    // Validate required fields
    if (!username || !email || !name || !password) {
      return NextResponse.json({ error: 'Username, email, name, and password are required' }, { status: 400 })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new tenant if not provided
    let userTenantId = tenantId
    if (!userTenantId) {
      const newTenant = await prisma.tenant.create({
        data: {
          name: role === 'property_owner' ? `${name}'s Property` : `${name}'s Account`,
          description: role === 'property_owner' ? `Property managed by ${name}` : `Account for ${name} (${role})`,
          isActive: true
        }
      })
      userTenantId = newTenant.id
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password, // In production, hash this password
        role,
        tenantId: userTenantId,
        isActive: true,
        accessLevel: role === 'property_owner' ? 'owner' : 'stakeholder'
      },
      include: {
        tenant: true,
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({
      user: {
        ...newUser,
        itemCount: newUser._count.items,
        lastLogin: newUser.lastLoginAt?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
