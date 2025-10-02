import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    console.log('Evidence API - User check:', user ? `${user.name} (${user.role})` : 'null')
    if (!user) {
      console.log('Evidence API - No user found, returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // First, verify the item belongs to the user's tenant (unless they're law enforcement)
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(itemId) }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check tenant isolation (super admin and law enforcement can access any item's evidence)
    if (user.role !== 'super_admin' && user.role !== 'law_enforcement' && item.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to access this item\'s evidence' }, { status: 403 })
    }

    // Get evidence for the item
    const evidence = await prisma.evidence.findMany({
      where: {
        itemId: parseInt(itemId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      evidence,
      total: evidence.length
    })

  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.itemId || !body.type || !body.cloudinaryId) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, type, cloudinaryId' },
        { status: 400 }
      )
    }

    // First, verify the item belongs to the user's tenant (unless they're law enforcement)
    const targetItem = await prisma.stolenItem.findUnique({
      where: { id: parseInt(body.itemId) }
    })

    if (!targetItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check tenant isolation (super admin and law enforcement can add evidence to any item)
    if (user.role !== 'super_admin' && user.role !== 'law_enforcement' && targetItem.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to add evidence to this item' }, { status: 403 })
    }

    // Validate evidence type
    if (!['photo', 'video', 'document'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid evidence type. Must be photo, video, or document' },
        { status: 400 }
      )
    }

    // Check if item exists
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(body.itemId) }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Create evidence record
    const evidence = await prisma.evidence.create({
      data: {
        type: body.type,
        cloudinaryId: body.cloudinaryId,
        originalName: body.originalName || null,
        description: body.description || null,
        itemId: parseInt(body.itemId)
      }
    })

    return NextResponse.json({
      evidence,
      message: 'Evidence uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading evidence:', error)
    
    const isProduction = process.env.NODE_ENV === 'production'
    const errorMessage = isProduction
      ? 'An error occurred while uploading evidence'
      : `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('id')

    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID is required' },
        { status: 400 }
      )
    }

    // Delete evidence record
    await prisma.evidence.delete({
      where: { id: parseInt(evidenceId) }
    })

    return NextResponse.json({
      message: 'Evidence deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting evidence:', error)
    return NextResponse.json(
      { error: 'Failed to delete evidence' },
      { status: 500 }
    )
  }
}
