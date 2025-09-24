import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}

cloudinary.config(cloudinaryConfig)

// GET /api/evidence/[id]/download - Download evidence file
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const evidenceId = parseInt(id)
    if (isNaN(evidenceId)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      )
    }

    // Get evidence with item information
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        item: true
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      )
    }

    // Check tenant isolation (law enforcement can download any evidence)
    if (user.role !== 'law_enforcement' && evidence.item.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized to download this evidence' },
        { status: 403 }
      )
    }

    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    if (evidence.cloudinaryId) {
      // File is stored in Cloudinary (photos/videos)
      try {
        // Generate download URL for Cloudinary
        const downloadUrl = cloudinary.url(evidence.cloudinaryId, {
          flags: 'attachment',
          resource_type: evidence.type === 'video' ? 'video' : 'image'
        })

        // Fetch file from Cloudinary
        const response = await fetch(downloadUrl)
        if (!response.ok) {
          throw new Error('Failed to fetch from Cloudinary')
        }

        fileBuffer = Buffer.from(await response.arrayBuffer())
        contentType = response.headers.get('content-type') || 'application/octet-stream'
        filename = evidence.originalName || `evidence_${evidenceId}.${evidence.type === 'photo' ? 'jpg' : 'mp4'}`
      } catch (error) {
        console.error('Error fetching from Cloudinary:', error)
        return NextResponse.json(
          { error: 'Failed to download file from cloud storage' },
          { status: 500 }
        )
      }
    } else if (evidence.documentData) {
      // File is stored in database (documents)
      fileBuffer = Buffer.from(evidence.documentData)
      
      // Determine content type based on file extension
      const originalName = evidence.originalName || ''
      if (originalName.endsWith('.pdf')) {
        contentType = 'application/pdf'
      } else if (originalName.endsWith('.doc')) {
        contentType = 'application/msword'
      } else if (originalName.endsWith('.docx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (originalName.endsWith('.txt')) {
        contentType = 'text/plain'
      } else {
        contentType = 'application/octet-stream'
      }
      
      filename = evidence.originalName || `document_${evidenceId}.pdf`
    } else {
      return NextResponse.json(
        { error: 'File data not found' },
        { status: 404 }
      )
    }

    // Return file as download
    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error downloading evidence:', error)
    return NextResponse.json(
      { error: 'Failed to download evidence' },
      { status: 500 }
    )
  }
}
