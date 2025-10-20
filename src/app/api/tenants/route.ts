import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch all tenants (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can view all tenants
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can view all tenants' },
        { status: 403 }
      )
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ SuperAdmin "${currentUser.name}" fetched ${tenants.length} tenants`)

    return NextResponse.json({ tenants })

  } catch (error) {
    console.error('❌ Error fetching tenants:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tenants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new tenant (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can create tenants
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can create tenants' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, address, contactEmail, contactPhone } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
        { status: 400 }
      )
    }

    // Check if tenant name already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: { name }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'A tenant with this name already exists' },
        { status: 400 }
      )
    }

    // Create the new tenant
    const newTenant = await prisma.tenant.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null
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

    console.log(`✅ SuperAdmin "${currentUser.name}" created tenant "${newTenant.name}"`)

    return NextResponse.json({
      message: 'Tenant created successfully',
      tenant: newTenant
    })

  } catch (error) {
    console.error('❌ Error creating tenant:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create tenant',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
