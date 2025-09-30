import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET /api/evidence/[id] - Get evidence details
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

    // Check tenant isolation (super admin and law enforcement can access any evidence)
    if (user.role !== 'super_admin' && user.role !== 'law_enforcement' && evidence.item.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized to access this evidence' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      evidence: {
        ...evidence,
        createdAt: evidence.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    )
  }
}

// DELETE /api/evidence/[id] - Delete evidence
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Check tenant isolation (super admin and law enforcement can delete any evidence)
    if (user.role !== 'super_admin' && user.role !== 'law_enforcement' && evidence.item.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this evidence' },
        { status: 403 }
      )
    }

    // Delete evidence
    await prisma.evidence.delete({
      where: { id: evidenceId }
    })

    return NextResponse.json({
      message: 'Evidence deleted successfully',
      evidenceId
    })

  } catch (error) {
    console.error('Error deleting evidence:', error)
    return NextResponse.json(
      { error: 'Failed to delete evidence' },
      { status: 500 }
    )
  }
}
