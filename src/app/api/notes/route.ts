import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch investigation notes for an item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId parameter is required' },
        { status: 400 }
      )
    }

    // Validate item exists
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(itemId) }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Fetch notes for the item, ordered by most recent first
    const notes = await prisma.investigationNote.findMany({
      where: { itemId: parseInt(itemId) },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ Fetched ${notes.length} investigation notes for item ${itemId}`)

    return NextResponse.json({
      notes: notes.map(note => ({
        id: note.id,
        content: note.content,
        createdBy: note.createdBy,
        createdByName: note.createdByName,
        createdByRole: note.createdByRole,
        isConfidential: note.isConfidential,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching investigation notes:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch investigation notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new investigation note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, content, createdBy, createdByName, createdByRole, isConfidential } = body

    // Validate required fields
    if (!itemId || !content || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, content, createdBy, createdByName, and createdByRole are required' },
        { status: 400 }
      )
    }

    // Validate item exists
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(itemId) }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Create the investigation note
    const note = await prisma.investigationNote.create({
      data: {
        itemId: parseInt(itemId),
        content: content.trim(),
        createdBy,
        createdByName,
        createdByRole,
        isConfidential: isConfidential || false
      }
    })

    console.log('✅ Investigation note created:', {
      id: note.id,
      itemId: note.itemId,
      createdBy: note.createdByName,
      role: note.createdByRole,
      confidential: note.isConfidential
    })

    return NextResponse.json({
      id: note.id,
      content: note.content,
      createdBy: note.createdBy,
      createdByName: note.createdByName,
      createdByRole: note.createdByRole,
      isConfidential: note.isConfidential,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Error creating investigation note:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create investigation note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

