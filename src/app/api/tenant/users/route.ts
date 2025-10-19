import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'
import { hashPassword } from '@/lib/password'

// GET - Fetch all users for a tenant
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId parameter is required' },
        { status: 400 }
      )
    }

    // Authorization: Users can only access their own tenant's users
    if (currentUser.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Access denied. You can only view users in your own tenant.' },
        { status: 403 }
      )
    }

    // Fetch all users for this tenant
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accessLevel: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`✅ User "${currentUser.name}" fetched ${users.length} users for tenant ${tenantId}`)

    return NextResponse.json({ users })

  } catch (error) {
    console.error('❌ Error fetching tenant users:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tenant users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new user for a tenant
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can invite users to their tenant
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json(
        { error: 'Only property owners can invite users to their tenant' },
        { status: 403 }
      )
    }

    if (!currentUser.tenantId) {
      return NextResponse.json(
        { error: 'No tenant assigned to current user' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, username, password, role } = body

    // Validate required fields
    if (!name || !email || !username || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required: name, email, username, password, role' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.username === username ? 'Username already exists' : 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role,
        tenantId: currentUser.tenantId,
        isActive: true,
        emailVerified: false, // User will need to verify email
        accessLevel: role === 'property_owner' ? 'owner' : 'stakeholder'
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        accessLevel: true,
        createdAt: true
      }
    })

    console.log(`✅ User "${currentUser.name}" invited "${newUser.name}" to tenant "${currentUser.tenantId}"`)

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('❌ Error creating tenant user:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}