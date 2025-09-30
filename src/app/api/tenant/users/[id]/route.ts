import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!currentUser.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 })
    }

    const { id } = params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        _count: {
          select: { items: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user belongs to current user's tenant
    if (user.tenantId !== currentUser.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to access this user' }, { status: 403 })
    }

    return NextResponse.json({
      ...user,
      itemCount: user._count.items,
      lastLogin: user.lastLoginAt?.toISOString() || null
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can manage tenant users
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json({ error: 'Only property owners can manage tenant users' }, { status: 403 })
    }

    if (!currentUser.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 })
    }

    const { id } = params
    const updateData = await request.json()

    // Check if user exists and belongs to current user's tenant
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { tenantId: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (existingUser.tenantId !== currentUser.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to modify this user' }, { status: 403 })
    }

    // Prevent property owners from modifying their own account
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 403 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        tenant: true,
        _count: {
          select: { items: true }
        }
      }
    })

    console.log(`✅ User "${updatedUser.name}" updated in tenant "${currentUser.tenantId}"`)

    return NextResponse.json({
      ...updatedUser,
      itemCount: updatedUser._count.items,
      lastLogin: updatedUser.lastLoginAt?.toISOString() || null
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can manage tenant users
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json({ error: 'Only property owners can manage tenant users' }, { status: 403 })
    }

    if (!currentUser.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned' }, { status: 400 })
    }

    const { id } = params

    // Check if user exists and belongs to current user's tenant
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (existingUser.tenantId !== currentUser.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to delete this user' }, { status: 403 })
    }

    // Prevent property owners from deleting their own account
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 })
    }

    // Check if user has items
    if (existingUser._count.items > 0) {
      return NextResponse.json({ error: `Cannot delete user with ${existingUser._count.items} associated items` }, { status: 400 })
    }

    // Remove user from tenant (set tenantId to null)
    await prisma.user.update({
      where: { id },
      data: {
        tenantId: null,
        isActive: false,
        updatedAt: new Date()
      }
    })

    console.log(`✅ User "${existingUser.name}" removed from tenant "${currentUser.tenantId}"`)

    return NextResponse.json({ message: 'User removed from tenant successfully' })
  } catch (error) {
    console.error('Error removing user from tenant:', error)
    return NextResponse.json({ error: 'Failed to remove user from tenant' }, { status: 500 })
  }
}
