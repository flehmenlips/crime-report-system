import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with admin access
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentUrl = searchParams.get('url')
    const filename = searchParams.get('filename')
    
    if (!documentUrl) {
      return NextResponse.json({ error: 'Document URL is required' }, { status: 400 })
    }

    console.log('Document proxy request for:', documentUrl)
    console.log('Requested filename:', filename)

    // Smart document location detection
    let actualDocumentUrl = documentUrl
    
    // If it's already a full URL, use it directly (this handles documents in Home folder)
    if (documentUrl.startsWith('https://res.cloudinary.com/')) {
      actualDocumentUrl = documentUrl
      console.log('Using direct Cloudinary URL:', actualDocumentUrl)
    } else {
      // For public_id format, try the CrimeReport structure first
      actualDocumentUrl = `https://res.cloudinary.com/dhaacekdd/image/upload/${documentUrl}`
      console.log('Constructed URL from public_id:', actualDocumentUrl)
    }
    
    // Convert raw URLs to image URLs to avoid ACL issues
    if (actualDocumentUrl.includes('/raw/upload/')) {
      actualDocumentUrl = actualDocumentUrl.replace('/raw/upload/', '/image/upload/')
      console.log('Converted raw URL to image URL:', actualDocumentUrl)
    }
    
    // Fix double extensions (.pdf.pdf, .doc.doc, etc.)
    actualDocumentUrl = actualDocumentUrl.replace(/(\.[a-zA-Z0-9]+)\.\1$/, '$1')
    console.log('URL after extension fix:', actualDocumentUrl)

    // Extract public_id from the URL for Cloudinary admin API access
    let publicId = ''
    try {
      // Parse the Cloudinary URL to extract public_id
      const urlParts = actualDocumentUrl.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip version (vXXXXXXXXXX) and get the path
        const pathStartIndex = uploadIndex + 2
        publicId = urlParts.slice(pathStartIndex).join('/').replace(/\.[^/.]+$/, '') // Remove extension
      }
      
      console.log('Extracted public_id:', publicId)
      
      // Use Cloudinary admin API to get the resource with authentication
      const resource = await cloudinary.api.resource(publicId, {
        resource_type: 'image', // Use image resource type since we're storing documents as images
        type: 'upload'
      })
      
      console.log('Cloudinary resource found:', {
        public_id: resource.public_id,
        format: resource.format,
        bytes: resource.bytes,
        secure_url: resource.secure_url
      })
      
      // Generate a signed URL that bypasses ACL restrictions
      const signedUrl = cloudinary.utils.private_download_url(resource.public_id, resource.format, {
        resource_type: 'image',
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
      })
      
      console.log('Generated signed URL for document access')
      
      // Admin
      let response: Response = await fetch(signedUrl, {
          headers: {
            'User-Agent': 'CrimeReport-Document-Viewer/1.0'
          }
        })
      if (!response.ok) throw new Error('Fetch failed')

      let documentBuffer: ArrayBuffer
      let contentType: string
      documentBuffer = await response.arrayBuffer()
      contentType = response.headers.get('content-type') || 'application/octet-stream'

    } catch (cloudinaryError) {
      console.error('Cloudinary admin API error:', cloudinaryError)
      
      // Fallback to direct fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      let response: Response = await fetch(actualDocumentUrl, {
          headers: {
            'User-Agent': 'CrimeReport-Document-Viewer/1.0'
          },
          signal: controller.signal
        })
      if (!response.ok) throw new Error('Fetch failed')

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('Failed to fetch document (fallback):', {
          status: response.status,
          statusText: response.statusText,
          url: actualDocumentUrl
        })
        return NextResponse.json({ 
          error: `Failed to fetch document: ${response.status} ${response.statusText}`,
          url: actualDocumentUrl,
          cloudinaryError: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown'
        }, { status: response.status })
      }
    }

    // Determine proper content type based on filename
    let finalContentType = contentType
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop()
      switch (ext) {
        case 'pdf':
          finalContentType = 'application/pdf'
          break
        case 'doc':
          finalContentType = 'application/msword'
          break
        case 'docx':
          finalContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case 'txt':
          finalContentType = 'text/plain'
          break
      }
    }

    // Create response with proper headers
    const cleanFilename = filename 
      ? filename.replace(/\.(auto|jpg)$/, '') // Remove .auto or .jpg extensions
      : 'document'

    const finalResponse = new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': finalContentType,
        'Content-Disposition': `inline; filename="${cleanFilename}"`,
        'Content-Length': documentBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })

    return finalResponse

  } catch (error) {
    console.error('Error in document proxy:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
