import { NextRequest, NextResponse } from 'next/server'

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

    // Handle different URL formats - try both raw and image endpoints
    let actualDocumentUrl = documentUrl
    
    // If it's a raw URL that might have ACL issues, try converting to image URL
    if (documentUrl.includes('/raw/upload/')) {
      actualDocumentUrl = documentUrl.replace('/raw/upload/', '/image/upload/')
      console.log('Converted raw URL to image URL:', actualDocumentUrl)
    }
    
    // Fix double extensions (.pdf.pdf, .doc.doc, etc.)
    actualDocumentUrl = actualDocumentUrl.replace(/(\.[a-zA-Z0-9]+)\.\1$/, '$1')
    console.log('URL after extension fix:', actualDocumentUrl)

    // Fetch the document from Cloudinary with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(actualDocumentUrl, {
      headers: {
        'User-Agent': 'CrimeReport-Document-Viewer/1.0'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Failed to fetch document:', {
        status: response.status,
        statusText: response.statusText,
        url: documentUrl
      })
      return NextResponse.json({ 
        error: `Failed to fetch document: ${response.status} ${response.statusText}`,
        url: documentUrl 
      }, { status: response.status })
    }

    // Get the document content
    const documentBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    console.log('Document fetched successfully:', {
      size: documentBuffer.byteLength,
      contentType,
      filename
    })

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

    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': finalContentType,
        'Content-Disposition': `inline; filename="${cleanFilename}"`,
        'Content-Length': documentBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error in document proxy:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
