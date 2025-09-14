import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const evidenceId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'download'  // Default to download
    
    console.log('Serving document - Mode:', mode)
    
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId }
    })
    
    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }
    
    if (evidence.type !== 'document' || !evidence.documentData) {
      return NextResponse.json({ error: 'No document data' }, { status: 400 })
    }
    
    if (evidence.cloudinaryId?.startsWith('database:')) {
      // Handle DB (remove metadata parse if not needed)
    }

    // Determine Content-Type from extension (basic mapping)
    const extension = evidence.originalName?.split('.').pop()?.toLowerCase() || 'octet-stream'
    let contentType = 'application/octet-stream'
    if (extension === 'pdf') contentType = 'application/pdf'
    if (extension === 'doc' || extension === 'docx') contentType = 'application/msword'
    // Add more as needed
    
    const response = new NextResponse(Buffer.from(evidence.documentData ?? []))
    response.headers.set('Content-Type', contentType)
    
    // Set disposition based on mode
    const disposition = mode === 'view' ? 'inline' : 'attachment'
    response.headers.set('Content-Disposition', `${disposition}; filename="${evidence.originalName}"`)
    
    return response
    
  } catch (error) {
    console.error('Serve document error:', error)
    return NextResponse.json({ error: 'Failed to serve document' }, { status: 500 })
  }
}
