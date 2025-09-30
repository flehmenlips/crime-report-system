import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { canSuperAdmin } from '@/lib/auth'

// GET /api/admin/users/[id] - Get specific user (SuperAdmin only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        items: {
          select: {
            id: true,
            name: true,
            estimatedValue: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        itemCount: user._count.items,
        lastLogin: user.lastLoginAt?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user (SuperAdmin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Prevent SuperAdmin from deactivating themselves
    if (currentUser.id === id && body.isActive === false) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
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
        ...updatedUser,
        itemCount: updatedUser._count.items,
        lastLogin: updatedUser.lastLoginAt?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (SuperAdmin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const { id } = await params

    // Prevent SuperAdmin from deleting themselves
    if (currentUser.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has items (prevent accidental deletion of users with data)
    if (existingUser._count.items > 0) {
      return NextResponse.json({ 
        error: `Cannot delete user with ${existingUser._count.items} items. Please transfer or delete items first.` 
      }, { status: 400 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
