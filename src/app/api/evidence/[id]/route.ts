import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// PUT - Update evidence details (description/caption)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const evidenceId = parseInt(params.id)
    
    if (isNaN(evidenceId)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { description } = body

    // Check if evidence exists and get the associated item
    const existingEvidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        item: true
      }
    })

    if (!existingEvidence) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      )
    }

    // Authorization check - verify tenant isolation
    // Super admin and law enforcement can edit any evidence
    // Others can only edit evidence for items in their tenant
    if (user.role !== 'super_admin' && 
        user.role !== 'law_enforcement' && 
        existingEvidence.item.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this evidence' },
        { status: 403 }
      )
    }

    // Update evidence description
    const updatedEvidence = await prisma.evidence.update({
      where: { id: evidenceId },
      data: {
        description: description?.trim() || null
      }
    })

    console.log('✅ Evidence description updated:', {
      id: updatedEvidence.id,
      itemId: updatedEvidence.itemId,
      hasDescription: !!updatedEvidence.description
    })

    return NextResponse.json({
      id: updatedEvidence.id,
      description: updatedEvidence.description,
      type: updatedEvidence.type,
      originalName: updatedEvidence.originalName,
      url: updatedEvidence.url
    })
  } catch (error) {
    console.error('❌ Error updating evidence:', error)
    return NextResponse.json(
      {
        error: 'Failed to update evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete evidence file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const evidenceId = parseInt(params.id)
    
    if (isNaN(evidenceId)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      )
    }

    // Check if evidence exists and get the associated item
    const existingEvidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        item: true
      }
    })

    if (!existingEvidence) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      )
    }

    // Authorization check - verify tenant isolation
    // Super admin and law enforcement can delete any evidence
    // Others can only delete evidence for items in their tenant
    if (user.role !== 'super_admin' && 
        user.role !== 'law_enforcement' && 
        existingEvidence.item.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this evidence' },
        { status: 403 }
      )
    }

    // Delete evidence
    await prisma.evidence.delete({
      where: { id: evidenceId }
    })

    console.log('✅ Evidence deleted:', {
      id: evidenceId,
      itemId: existingEvidence.itemId
    })

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting evidence:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
