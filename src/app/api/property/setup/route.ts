import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// POST - Setup property for authenticated user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only property owners can setup properties
    if (currentUser.role !== 'property_owner') {
      return NextResponse.json(
        { error: 'Only property owners can setup properties' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, address, contactEmail, contactPhone, propertyType } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Property name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a property setup
    const existingProperty = await prisma.tenant.findFirst({
      where: { 
        users: {
          some: { id: currentUser.id }
        }
      }
    })

    if (existingProperty) {
      return NextResponse.json(
        { error: 'You already have a property setup. Use the property management page to edit it.' },
        { status: 400 }
      )
    }

    // Create the property (tenant) for this user
    const newProperty = await prisma.tenant.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        isActive: true
      }
    })

    // Update user's tenantId to link them to their property
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { tenantId: newProperty.id }
    })

    console.log(`✅ Property owner "${currentUser.name}" setup property "${newProperty.name}"`)

    return NextResponse.json({
      message: 'Property setup successfully',
      property: {
        id: newProperty.id,
        name: newProperty.name,
        description: newProperty.description,
        address: newProperty.address,
        contactEmail: newProperty.contactEmail,
        contactPhone: newProperty.contactPhone
      }
    })

  } catch (error) {
    console.error('❌ Error setting up property:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to setup property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
