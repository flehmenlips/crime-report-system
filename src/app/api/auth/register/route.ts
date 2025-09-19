import { NextRequest, NextResponse } from 'next/server'
import { users, Role } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, name, password, role = 'property_owner' } = await request.json()

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
    const newUser = {
      id: newId,
      username,
      email,
      name,
      password, // In a real app, you'd hash this
      role: role as Role,
      permissions: ['read:own', 'write:own'], // Default permissions
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
