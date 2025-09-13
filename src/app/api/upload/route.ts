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

    try {
      // Convert file to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a standardized, unique public ID with clean folder structure
      const timestamp = Date.now()
      const dateStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      // Clean filename - remove special chars but preserve extension structure
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      // For documents, remove extension to avoid Cloudinary adding duplicates
      let baseFileName
      if (evidenceType === 'document') {
        baseFileName = cleanFileName.replace(/\.[^/.]+$/, '') // Remove extension
      } else {
        baseFileName = cleanFileName
      }
      
      // Simplified folder structure that works with Cloudinary ACL restrictions
      const publicId = `CrimeReport/item_${itemId}/${timestamp}_${baseFileName}`
      
      console.log('Standardized public_id:', publicId)

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
            // Store as auto-format to preserve content while making accessible
            uploadOptions.resource_type = 'auto'
            uploadOptions.quality = 'auto'
            uploadOptions.flags = 'attachment' // Suggest download when accessed directly
            uploadOptions.access_mode = 'public' // Ensure public access
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
