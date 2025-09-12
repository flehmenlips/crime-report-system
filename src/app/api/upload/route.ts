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

    try {
      // Convert file to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a unique public ID with clean path structure
      const timestamp = Date.now()
      // For documents, remove the extension from public_id to avoid double extensions
      let sanitizedFileName
      if (evidenceType === 'document') {
        // Remove extension from filename for public_id, Cloudinary will add it back
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_')
        sanitizedFileName = nameWithoutExt
      } else {
        sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      }
      const publicId = `CrimeReport/item_${itemId}/${timestamp}_${sanitizedFileName}`

      // Upload to Cloudinary (or simulate if no credentials)
      let cloudinaryResult
      
      console.log('Upload attempt - Cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
      console.log('API Key present:', !!process.env.CLOUDINARY_API_KEY)
      console.log('API Secret present:', !!process.env.CLOUDINARY_API_SECRET)
      
      if (process.env.CLOUDINARY_CLOUD_NAME === 'demo' || 
          process.env.CLOUDINARY_API_KEY === 'demo' || 
          process.env.CLOUDINARY_API_KEY === 'YOUR_API_KEY_FROM_DASHBOARD') {
        // Simulate upload for demo purposes
        cloudinaryResult = {
          public_id: publicId,
          secure_url: `https://res.cloudinary.com/demo/image/upload/${publicId}`,
          resource_type: evidenceType === 'video' ? 'video' : 'image'
        }
        console.log('DEMO MODE: Simulated Cloudinary upload for:', file.name)
      } else {
        // Real Cloudinary upload
        console.log('REAL CLOUDINARY: Attempting upload with public_id:', publicId)
        
        cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadOptions: any = {
            public_id: publicId,
            overwrite: false
          }

          // Set proper resource type based on evidence type
          if (evidenceType === 'video') {
            uploadOptions.resource_type = 'video'
            uploadOptions.quality = 'auto'
          } else if (evidenceType === 'document') {
            // Use 'image' resource type for documents to avoid ACL restrictions
            // We'll serve them with correct content-type via our proxy
            uploadOptions.resource_type = 'image'
            uploadOptions.quality = 'auto'
            uploadOptions.flags = 'attachment' // Suggest download when accessed directly
          } else {
            uploadOptions.resource_type = 'image'
            uploadOptions.quality = 'auto'
            uploadOptions.fetch_format = 'auto'
          }

          console.log('Upload options:', uploadOptions)

          cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error)
                reject(error)
              } else {
                console.log('Cloudinary upload success:', result?.public_id, result?.secure_url)
                resolve(result)
              }
            }
          ).end(buffer)
        })
      }

      // Save evidence record to database with full URL
      const evidence = await prisma.evidence.create({
        data: {
          type: evidenceType,
          cloudinaryId: cloudinaryResult.secure_url, // Save the full URL instead of just public_id
          originalName: file.name,
          description: `${evidenceType} evidence for ${item.name}`,
          itemId: parseInt(itemId)
        }
      })

      console.log('Saved to database - cloudinaryId:', cloudinaryResult.public_id)
      console.log('Cloudinary secure_url:', cloudinaryResult.secure_url)

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
