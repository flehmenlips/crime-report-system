import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('id')
    
    if (!evidenceId) {
      return NextResponse.json({ error: 'Evidence ID is required' }, { status: 400 })
    }

    console.log('Serving document for evidence ID:', evidenceId)

    // Get evidence record from database
    const evidence = await prisma.evidence.findUnique({
      where: { id: parseInt(evidenceId) },
      include: { item: true }
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    if (evidence.type !== 'document') {
      return NextResponse.json({ error: 'Not a document' }, { status: 400 })
    }

    // Check if this is a database-stored document
    if (evidence.cloudinaryId?.startsWith('database:')) {
      // No metadata
    }

    // For Cloudinary documents, redirect to our existing proxy
    return NextResponse.redirect(
      new URL(`/api/document-proxy?url=${encodeURIComponent(evidence.cloudinaryId ?? '')}&filename=${encodeURIComponent(evidence.originalName || 'document')}`, request.url)
    )

  } catch (error) {
    console.error('Error serving document:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
