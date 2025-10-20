import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch specific tenant
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    // SuperAdmin can view any tenant, others can only view their own
    if (currentUser.role !== 'super_admin' && currentUser.tenantId !== id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own tenant.' },
        { status: 403 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ tenant })

  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

// PUT - Update tenant
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    const updateData = await request.json()

    // Only super_admin can update tenants
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can update tenants' },
        { status: 403 }
      )
    }

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if new name conflicts with existing tenants (if name is being changed)
    if (updateData.name && updateData.name !== existingTenant.name) {
      const nameConflict = await prisma.tenant.findFirst({
        where: {
          name: updateData.name,
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A tenant with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      }
    })

    console.log(`✅ SuperAdmin "${currentUser.name}" updated tenant "${updatedTenant.name}"`)

    return NextResponse.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    })

  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

// DELETE - Delete tenant
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params

    // Only super_admin can delete tenants
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can delete tenants' },
        { status: 403 }
      )
    }

    // Check if tenant exists and get details
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if tenant has users or items
    if (tenant._count.users > 0 || tenant._count.items > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete tenant "${tenant.name}". It has ${tenant._count.users} users and ${tenant._count.items} items. Please remove all users and items first.` 
        },
        { status: 400 }
      )
    }

    // Delete tenant
    await prisma.tenant.delete({
      where: { id }
    })

    console.log(`✅ SuperAdmin "${currentUser.name}" deleted tenant "${tenant.name}"`)

    return NextResponse.json({ message: 'Tenant deleted successfully' })

  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
