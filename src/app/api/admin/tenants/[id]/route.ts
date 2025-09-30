import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { canSuperAdmin } from '@/lib/auth'

// GET /api/admin/tenants/[id] - Get specific tenant (SuperAdmin only)
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
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const itemCount = await prisma.stolenItem.count({
      where: { tenantId: tenant.id }
    })

    const totalValue = await prisma.stolenItem.aggregate({
      where: { tenantId: tenant.id },
      _sum: { estimatedValue: true }
    })

    return NextResponse.json({
      tenant: {
        ...tenant,
        userCount: tenant._count.users,
        itemCount,
        totalValue: totalValue._sum.estimatedValue || 0
      }
    })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

// PUT /api/admin/tenants/[id] - Update tenant (SuperAdmin only)
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

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    })
    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    const itemCount = await prisma.stolenItem.count({
      where: { tenantId: updatedTenant.id }
    })

    const totalValue = await prisma.stolenItem.aggregate({
      where: { tenantId: updatedTenant.id },
      _sum: { estimatedValue: true }
    })

    return NextResponse.json({
      tenant: {
        ...updatedTenant,
        userCount: updatedTenant._count.users,
        itemCount,
        totalValue: totalValue._sum.estimatedValue || 0
      }
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant (SuperAdmin only)
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

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if tenant has users
    if (existingTenant._count.users > 0) {
      return NextResponse.json({ 
        error: `Cannot delete tenant with ${existingTenant._count.users} users. Please reassign or delete users first.` 
      }, { status: 400 })
    }

    // Check if tenant has items
    const itemCount = await prisma.stolenItem.count({
      where: { tenantId: id }
    })
    if (itemCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete tenant with ${itemCount} items. Please transfer or delete items first.` 
      }, { status: 400 })
    }

    // Delete tenant
    await prisma.tenant.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
