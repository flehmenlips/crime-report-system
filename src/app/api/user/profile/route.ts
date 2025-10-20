import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'
import { Role } from '@/lib/auth'

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

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get full user data from database
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        tenant: true
      }
    })
    
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert Date fields to string for compatibility
    const { password, lastLoginAt, createdAt, updatedAt, tenant, ...userWithoutPassword } = fullUser
    const formattedUser = {
      ...userWithoutPassword,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastLoginAt: lastLoginAt?.toISOString() || '',
      tenant: tenant ? {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString()
      } : undefined,
      permissions: getDefaultPermissions(fullUser.role) // Add permissions back from role
    }

    return NextResponse.json({ user: formattedUser })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const profileData = await request.json()

    // Validate required fields
    if (!profileData.name || !profileData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: profileData.email,
        id: { not: user.id }
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 400 }
      )
    }

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
        country: profileData.country || '',
        company: profileData.company || '',
        title: profileData.title || '',
        bio: profileData.bio || '',
      },
      include: {
        tenant: true
      }
    })

    // Convert Date fields to string for compatibility
    const { password, lastLoginAt, createdAt, updatedAt, tenant, ...userWithoutPassword } = updatedUser
    const formattedUser = {
      ...userWithoutPassword,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastLoginAt: lastLoginAt?.toISOString() || '',
      tenant: tenant ? {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString()
      } : undefined,
      permissions: getDefaultPermissions(updatedUser.role) // Add permissions back from role
    }

    return NextResponse.json({ user: formattedUser })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
