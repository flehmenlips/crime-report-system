import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string

    if (!file || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, itemId' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit for database storage)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Document too large. Maximum size is 10MB for database storage.' },
        { status: 400 }
      )
    }

    // Check if item exists
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(itemId) }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check for duplicate files
    const existingEvidence = await prisma.evidence.findFirst({
      where: {
        itemId: parseInt(itemId),
        type: 'document',
        originalName: file.name
      }
    })

    if (existingEvidence) {
      return NextResponse.json({
        success: false,
        error: 'Duplicate file',
        message: `A document named "${file.name}" already exists for this item.`
      }, { status: 409 })
    }

    // Convert file to base64 for database storage
    const bytes = await file.arrayBuffer()
    const base64Content = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'application/octet-stream'

    console.log('Storing document in database:', {
      filename: file.name,
      size: file.size,
      type: mimeType,
      base64Length: base64Content.length
    })

    // Save document evidence to database with base64 content
    const evidence = await prisma.evidence.create({
      data: {
        type: 'document',
        cloudinaryId: `database:${Date.now()}_${file.name}`, // Special prefix for database-stored docs
        originalName: file.name,
        description: `Document evidence for ${item.name} (stored in database)`,
        itemId: parseInt(itemId),
        // We'll store the base64 content in a new field (need to add to schema)
        metadata: JSON.stringify({
          base64Content,
          mimeType,
          size: file.size,
          storageType: 'database'
        })
      }
    })

    console.log('Document stored successfully in database:', evidence.id)

    return NextResponse.json({
      success: true,
      evidence: {
        id: evidence.id,
        type: evidence.type,
        originalName: evidence.originalName,
        size: file.size,
        storageType: 'database'
      },
      message: 'Document uploaded and stored in database successfully'
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
