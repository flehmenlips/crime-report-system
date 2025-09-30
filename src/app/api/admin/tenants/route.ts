import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { canSuperAdmin } from '@/lib/auth'

// GET /api/admin/tenants - Get all tenants (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get item count for each tenant
    const tenantsWithStats = await Promise.all(tenants.map(async (tenant) => {
      const itemCount = await prisma.stolenItem.count({
        where: { tenantId: tenant.id }
      })

      const totalValue = await prisma.stolenItem.aggregate({
        where: { tenantId: tenant.id },
        _sum: { estimatedValue: true }
      })

      return {
        ...tenant,
        userCount: tenant._count.users,
        itemCount,
        totalValue: totalValue._sum.estimatedValue || 0
      }
    }))

    return NextResponse.json({ tenants: tenantsWithStats })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

// POST /api/admin/tenants - Create new tenant (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!canSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isActive = true } = body

    if (!name) {
      return NextResponse.json({ error: 'Tenant name is required' }, { status: 400 })
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        description,
        isActive
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
      where: { tenantId: newTenant.id }
    })

    return NextResponse.json({
      tenant: {
        ...newTenant,
        userCount: newTenant._count.users,
        itemCount,
        totalValue: 0
      }
    })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
