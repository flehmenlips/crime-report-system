import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
}

console.log('Cloudinary config:', {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key ? 'SET' : 'NOT SET',
  api_secret: cloudinaryConfig.api_secret ? 'SET' : 'NOT SET'
})

cloudinary.config(cloudinaryConfig)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string
    const evidenceType = formData.get('type') as string

    if (!file || !itemId || !evidenceType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, itemId, type' },
        { status: 400 }
      )
    }

    // Validate evidence type
    if (!['photo', 'video', 'document'].includes(evidenceType)) {
      return NextResponse.json(
        { error: 'Invalid evidence type' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
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

    // Check for duplicate files (same name, type, and item)
    const existingEvidence = await prisma.evidence.findFirst({
      where: {
        itemId: parseInt(itemId),
        type: evidenceType,
        originalName: file.name
      }
    })

    if (existingEvidence) {
      console.log('Duplicate file detected:', file.name)
      return NextResponse.json({
        success: false,
        error: 'Duplicate file',
        message: `A ${evidenceType} file named "${file.name}" already exists for this item.`,
        existingEvidence: {
          id: existingEvidence.id,
          uploadedAt: existingEvidence.createdAt
        }
      }, { status: 409 }) // 409 Conflict
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Hybrid storage logic
    let cloudinaryResult = null
    let documentData = null

    if (evidenceType === 'document') {
      // Store document in PostgreSQL BYTEA
      console.log('Hybrid: Storing document - Buffer size:', buffer.length, 'Type:', buffer.constructor.name)
      documentData = buffer
      console.log('Hybrid: Storing document in PostgreSQL BYTEA')
    } else {
      // Upload photos/videos to Cloudinary
      // (Keep your existing Cloudinary upload code here, adapted)
      const timestamp = Date.now()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const publicId = `CrimeReport/item_${itemId}/${timestamp}_${cleanFileName}`

      cloudinaryResult = await new Promise<any>((resolve, reject) => {
        const uploadOptions: any = {
          public_id: publicId,
          resource_type: evidenceType === 'video' ? 'video' : 'image',
          overwrite: false
        }

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      console.log('Hybrid: Uploaded to Cloudinary:', (cloudinaryResult as any)?.secure_url ?? 'N/A')
    }

    // Save to database
    try {
      const evidence = await prisma.evidence.create({
        data: {
          type: evidenceType,
          cloudinaryId: (cloudinaryResult as any)?.secure_url ?? null,
          documentData,
          originalName: file.name,
          description: `${evidenceType} evidence for ${item.name}`,
          itemId: parseInt(itemId)
        }
      })
      console.log('Database save success:', evidence)
      
      return NextResponse.json({
        success: true,
        evidence,
        cloudinaryUrl: (cloudinaryResult as any)?.secure_url,
        message: 'File uploaded successfully'
      })
    } catch (dbError: unknown) {
      console.error('Database save error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
