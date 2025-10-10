import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Add case evidence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseId, type, description, location, collectedBy, dateCollected, createdBy, createdByName, createdByRole } = body

    if (!caseId || !type || !description || !location || !collectedBy || !dateCollected || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const evidence = await prisma.caseEvidence.create({
      data: { caseId, type, description, location, collectedBy, dateCollected: new Date(dateCollected), createdBy, createdByName, createdByRole }
    })

    return NextResponse.json({ evidence })
  } catch (error) {
    console.error('❌ Error creating case evidence:', error)
    return NextResponse.json({ error: 'Failed to create case evidence' }, { status: 500 })
  }
}

// PUT - Update case evidence
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, description, location, collectedBy, dateCollected } = body

    if (!id) {
      return NextResponse.json({ error: 'Evidence ID is required' }, { status: 400 })
    }

    const evidence = await prisma.caseEvidence.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(description && { description }),
        ...(location && { location }),
        ...(collectedBy && { collectedBy }),
        ...(dateCollected && { dateCollected: new Date(dateCollected) }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ evidence })
  } catch (error) {
    console.error('❌ Error updating case evidence:', error)
    return NextResponse.json({ error: 'Failed to update case evidence' }, { status: 500 })
  }
}

// DELETE - Delete case evidence
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Evidence ID is required' }, { status: 400 })
    }

    await prisma.caseEvidence.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting case evidence:', error)
    return NextResponse.json({ error: 'Failed to delete case evidence' }, { status: 500 })
  }
}
