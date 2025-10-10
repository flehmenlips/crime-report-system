import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Add case update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseId, date, update, createdBy, createdByName, createdByRole } = body

    if (!caseId || !date || !update || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const caseUpdate = await prisma.caseUpdate.create({
      data: { caseId, date: new Date(date), update, createdBy, createdByName, createdByRole }
    })

    return NextResponse.json({ caseUpdate })
  } catch (error) {
    console.error('❌ Error creating case update:', error)
    return NextResponse.json({ error: 'Failed to create case update' }, { status: 500 })
  }
}

// PUT - Update case update
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, date, update } = body

    if (!id) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 })
    }

    const caseUpdate = await prisma.caseUpdate.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(update && { update }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ caseUpdate })
  } catch (error) {
    console.error('❌ Error updating case update:', error)
    return NextResponse.json({ error: 'Failed to update case update' }, { status: 500 })
  }
}

// DELETE - Delete case update
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 })
    }

    await prisma.caseUpdate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting case update:', error)
    return NextResponse.json({ error: 'Failed to delete case update' }, { status: 500 })
  }
}
