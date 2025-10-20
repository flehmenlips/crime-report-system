import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch current user's property
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can view their property
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json(
        { error: 'Only property owners can view their property' },
        { status: 403 }
      )
    }

    if (!currentUser.tenantId) {
      return NextResponse.json({ property: null })
    }

    const property = await prisma.tenant.findUnique({
      where: { id: currentUser.tenantId },
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ property: null })
    }

    return NextResponse.json({ property })

  } catch (error) {
    console.error('❌ Error fetching property:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update current user's property
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can update their property
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json(
        { error: 'Only property owners can update their property' },
        { status: 403 }
      )
    }

    if (!currentUser.tenantId) {
      return NextResponse.json(
        { error: 'No property found. Please set up your property first.' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    const { name, description, address, contactEmail, contactPhone } = updateData

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Property name is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const existingProperty = await prisma.tenant.findUnique({
      where: { id: currentUser.tenantId }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Update property
    const updatedProperty = await prisma.tenant.update({
      where: { id: currentUser.tenantId },
      data: {
        name,
        description: description || null,
        address: address || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
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

    console.log(`✅ Property owner "${currentUser.name}" updated property "${updatedProperty.name}"`)

    return NextResponse.json({
      message: 'Property updated successfully',
      property: updatedProperty
    })

  } catch (error) {
    console.error('❌ Error updating property:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
