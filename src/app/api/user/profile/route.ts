import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { users } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get full user data from hardcoded users array
    const fullUser = users.find(u => u.id === user.id)
    
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user without password
    const { password, ...userWithoutPassword } = fullUser
    return NextResponse.json({ user: userWithoutPassword })

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

    // Find the user in the hardcoded array
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is already taken by another user
    const existingUser = users.find(u => u.email === profileData.email && u.id !== user.id)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 400 }
      )
    }

    // Update user profile in the hardcoded array
    users[userIndex] = {
      ...users[userIndex],
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
      updatedAt: new Date().toISOString(),
      createdAt: users[userIndex].createdAt || new Date().toISOString(),
      // Ensure all required fields are present
      accessLevel: users[userIndex].accessLevel || 'owner',
      tenantId: users[userIndex].tenantId || 'tenant-1',
      tenant: users[userIndex].tenant || {
        id: 'tenant-1',
        name: 'Birkenfeld Farm',
        description: 'Original Birkenfeld Farm theft case',
        isActive: true,
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: '2023-09-19T00:00:00Z'
      }
    }

    const updatedUser = users[userIndex]

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ user: userWithoutPassword })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
