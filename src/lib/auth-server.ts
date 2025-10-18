import { cookies } from 'next/headers'
import { User, Role } from './auth'
import { prisma } from './prisma'
import { verifyPassword, isLegacyPassword, migrateUserPassword } from './password'

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

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  // Development-only logging (removed in production)
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    console.log('=== AUTH DEBUG ===')
    console.log('Attempting to authenticate user:', username)
  }
  
  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        tenant: true
      }
    })
    
    if (!user) {
      if (isDev) {
        console.log('❌ No user found for username:', username)
        console.log('=== END AUTH DEBUG ===')
      }
      return null
    }
    
    if (isDev) {
      console.log('User found in database:', { username: user.username, role: user.role, isActive: user.isActive })
    }
    
    // Check if user is active
    if (!user.isActive) {
      if (isDev) {
        console.log('❌ User account is inactive:', username)
        console.log('=== END AUTH DEBUG ===')
      }
      return null
    }

    // Check if email is verified (except for super_admin)
    if (!user.emailVerified && user.role !== 'super_admin') {
      if (isDev) {
        console.log('❌ User email is not verified:', username)
        console.log('=== END AUTH DEBUG ===')
      }
      return null
    }
    
    // SECURITY: Verify password hash using bcrypt (timing-safe comparison)
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      if (isDev) {
        console.log('❌ Password verification failed for user:', username)
        console.log('=== END AUTH DEBUG ===')
      }
      return null
    }
    
    // MIGRATION: If user has legacy plain text password, migrate to hashed
    if (isLegacyPassword(user.password)) {
      try {
        await migrateUserPassword(user.id, password, prisma)
        // Refresh user data to get updated password hash
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { tenant: true }
        })
        if (updatedUser) {
          user.password = updatedUser.password
        }
      } catch (error) {
        console.error('Failed to migrate user password:', error)
        // Continue with login even if migration fails
      }
    }
    
    if (isDev) {
      console.log('✅ Authentication successful for:', { username: user.username, role: user.role })
      console.log('=== END AUTH DEBUG ===')
    }
    
    // Return user without password and convert Date to string for compatibility
    const { password: _, lastLoginAt, tenant, createdAt, updatedAt, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastLoginAt: lastLoginAt?.toISOString() || '',
      tenant: tenant ? {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString()
      } : undefined,
      permissions: getDefaultPermissions(user.role) // Add permissions back from role
    } as User
  } catch (error) {
    console.error('Error authenticating user:', error)
    if (isDev) {
      console.log('=== END AUTH DEBUG ===')
    }
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie) {
      return null
    }
    
    const user = JSON.parse(userCookie.value) as User
    
    // Validate role - if it's the old 'citizen' role, clear the session
    if ((user.role as string) === 'citizen') {
      console.log('Found old citizen role, clearing session')
      await clearUserSession()
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user')
}
