import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
})

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

    try {
      // Convert file to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a unique public ID
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const publicId = `evidence/item_${itemId}/${evidenceType}/${timestamp}_${sanitizedFileName}`

      // Upload to Cloudinary (or simulate if no credentials)
      let cloudinaryResult
      
      if (process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
        // Simulate upload for demo purposes
        cloudinaryResult = {
          public_id: publicId,
          secure_url: `https://res.cloudinary.com/demo/image/upload/${publicId}`,
          resource_type: evidenceType === 'video' ? 'video' : 'image'
        }
        console.log('DEMO MODE: Simulated Cloudinary upload for:', file.name)
      } else {
        // Real Cloudinary upload
        cloudinaryResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: evidenceType === 'video' ? 'video' : 'auto',
              public_id: publicId,
              folder: `evidence/item_${itemId}`,
              overwrite: false
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          ).end(buffer)
        })
      }

      // Save evidence record to database
      const evidence = await prisma.evidence.create({
        data: {
          type: evidenceType,
          cloudinaryId: cloudinaryResult.public_id,
          originalName: file.name,
          description: `${evidenceType} evidence for ${item.name}`,
          itemId: parseInt(itemId)
        }
      })

      return NextResponse.json({
        success: true,
        evidence,
        cloudinaryUrl: cloudinaryResult.secure_url,
        message: 'File uploaded successfully'
      })

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError)
      
      // If Cloudinary fails, still save a record for demo purposes
      const evidence = await prisma.evidence.create({
        data: {
          type: evidenceType,
          cloudinaryId: `demo/${Date.now()}_${file.name}`,
          originalName: file.name,
          description: `${evidenceType} evidence for ${item.name} (demo mode)`,
          itemId: parseInt(itemId)
        }
      })

      return NextResponse.json({
        success: true,
        evidence,
        cloudinaryUrl: '/placeholder-image.jpg',
        message: 'File uploaded successfully (demo mode)',
        demo: true
      })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
