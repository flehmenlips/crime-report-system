import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    const uploadedBy = formData.get('uploadedBy') as string
    const uploadedByName = formData.get('uploadedByName') as string
    const uploadedByRole = formData.get('uploadedByRole') as string

    // Validate required fields
    if (!file || !itemId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, itemId, and type are required' },
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

    // Validate file type
    const validTypes: { [key: string]: string[] } = {
      photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    }

    if (!validTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `CrimeReport/item_${itemId}`,
          resource_type: type === 'video' ? 'video' : type === 'document' ? 'raw' : 'image',
          public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          // For documents, store as raw files
          ...(type === 'document' && { format: file.name.split('.').pop() })
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    // Save evidence record to database
    const evidence = await prisma.evidence.create({
      data: {
        itemId: parseInt(itemId),
        type,
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.secure_url,
        originalName: file.name,
        description: description || null,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: uploadedBy || null,
        uploadedByName: uploadedByName || null,
        uploadedByRole: uploadedByRole || null
      }
    })

    console.log('✅ Evidence uploaded successfully:', {
      id: evidence.id,
      itemId: evidence.itemId,
      type: evidence.type,
      fileName: evidence.originalName,
      uploadedBy: evidence.uploadedByName
    })

    return NextResponse.json({
      success: true,
      evidence: {
        id: evidence.id,
        type: evidence.type,
        cloudinaryId: evidence.cloudinaryId,
        url: evidence.url,
        originalName: evidence.originalName,
        description: evidence.description,
        createdAt: evidence.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Evidence upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to upload evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

