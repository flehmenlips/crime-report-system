import { NextRequest, NextResponse } from 'next/server'
import { users, tenants, Role, AccessLevel } from '@/lib/auth'

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

    // Check if username already exists
    const existingUsername = users.find(u => u.username === username)
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = users.find(u => u.email === email)
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Create new user (generate new ID)
    const newId = (Math.max(...users.map(u => parseInt(u.id)), 0) + 1).toString()
    
        // Create new tenant for ALL users to ensure proper isolation
        // Each user gets their own tenant for complete data separation
        const newTenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        let userTenant = {
          id: newTenantId,
          name: role === 'property_owner' && propertyName 
            ? propertyName 
            : role === 'property_owner' 
              ? `${name}'s Property` 
              : `${name}'s Account`,
          description: role === 'property_owner' 
            ? `Property managed by ${name}` 
            : `Account for ${name} (${role})`,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
    tenants.push(userTenant)
    
    const newUser = {
      id: newId,
      username,
      email,
      name,
      password, // In a real app, you'd hash this
      role: role as Role,
      accessLevel: (role === 'property_owner' ? 'owner' : 'stakeholder') as AccessLevel,
      permissions: getDefaultPermissions(role as Role), // Role-specific permissions
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
      lastLoginAt: '',
      preferences: '',
      tenantId: userTenant.id,
      tenant: userTenant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to hardcoded users array
    users.push(newUser)

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
