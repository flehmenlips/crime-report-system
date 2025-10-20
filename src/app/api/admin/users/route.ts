import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch all platform users (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can view all users
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can view all users' },
        { status: 403 }
      )
    }

    // Fetch all users with their tenant information
    const users = await prisma.user.findMany({
      include: {
        tenant: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ SuperAdmin "${currentUser.name}" fetched all platform users (${users.length} users)`)

    return NextResponse.json({ users })

  } catch (error) {
    console.error('❌ Error fetching platform users:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch platform users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new user (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can create users
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can create users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, username, password, role, tenantId } = body

    // Validate required fields
    if (!name || !email || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, username, password, role' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role,
        tenantId: tenantId || null,
        isActive: true,
        emailVerified: role === 'super_admin' ? true : false,
        accessLevel: role === 'super_admin' ? 'owner' : 'stakeholder'
      },
      include: {
        tenant: true
      }
    })

    console.log(`✅ SuperAdmin "${currentUser.name}" created new user: ${newUser.name} (${newUser.email})`)

    return NextResponse.json({ 
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('❌ Error creating user:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}