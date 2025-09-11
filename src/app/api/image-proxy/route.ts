import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    console.log('Image proxy request for:', imageUrl)

    // Fetch the image from Cloudinary
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'CrimeReport-PDF-Generator/1.0'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    // Get the image as buffer
    const imageBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    
    // Return base64 data URL
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('Successfully converted image to base64, size:', base64.length)
    
    return NextResponse.json({ 
      success: true, 
      dataUrl,
      mimeType,
      size: base64.length 
    })

  } catch (error) {
    console.error('Error in image proxy:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
