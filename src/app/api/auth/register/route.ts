import { NextRequest, NextResponse } from 'next/server'
import { Role, AccessLevel } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getDefaultPermissions(role: Role): string[] {
  switch (role) {
    case 'property_owner':
      return ['read:own', 'write:own', 'upload:evidence', 'generate:reports']
    case 'law_enforcement':
      return ['read:all', 'write:all', 'admin:users', 'admin:system']
    case 'super_admin':
      return ['read:all', 'write:all', 'admin:users', 'admin:system', 'admin:tenants', 'super:admin']
    case 'insurance_agent':
    case 'broker':
    case 'banker':
    case 'asset_manager':
      return ['read:own', 'write:own', 'upload:evidence']
    case 'assistant':
    case 'secretary':
    case 'manager':
    case 'executive_assistant':
      return ['read:own', 'write:own']
    default:
      return ['read:own', 'write:own']
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, name, password, role = 'property_owner', propertyName } = await request.json()

    console.log('=== REGISTRATION API DEBUG ===')
    console.log('Received registration request:', { username, email, name, role, propertyName })

    // Validate required fields
    if (!username || !email || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if username already exists in database
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      console.log('Username already exists:', username)
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists in database
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmail) {
      console.log('Email already exists:', email)
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Create new tenant for ALL users to ensure proper isolation
    const tenantName = role === 'property_owner' && propertyName 
      ? propertyName 
      : role === 'property_owner' 
        ? `${name}'s Property` 
        : `${name}'s Account`
    
    const tenantDescription = role === 'property_owner' 
      ? `Property managed by ${name}` 
      : `Account for ${name} (${role})`

    console.log('Creating tenant:', { name: tenantName, description: tenantDescription })

    // Create tenant in database
    const newTenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        description: tenantDescription,
        isActive: true,
      }
    })

    console.log('Tenant created with ID:', newTenant.id)

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password, // In a real app, you'd hash this
        role: role as Role,
        accessLevel: (role === 'property_owner' ? 'owner' : 'stakeholder') as AccessLevel,
        // permissions: getDefaultPermissions(role as Role), // Role-specific permissions - not in DB schema
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
        tenantId: newTenant.id,
      },
      include: {
        tenant: true
      }
    })

    console.log('User created with ID:', newUser.id)
    console.log('=== REGISTRATION API DEBUG COMPLETE ===')

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
