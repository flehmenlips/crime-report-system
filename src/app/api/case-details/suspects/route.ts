import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Add suspect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseId, name, description, address, phone, status, createdBy, createdByName, createdByRole } = body

    if (!caseId || !name || !description || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const suspect = await prisma.caseSuspect.create({
      data: { caseId, name, description, address, phone, status: status || 'active', createdBy, createdByName, createdByRole }
    })

    return NextResponse.json({ suspect })
  } catch (error) {
    console.error('❌ Error creating suspect:', error)
    return NextResponse.json({ error: 'Failed to create suspect' }, { status: 500 })
  }
}

// PUT - Update suspect
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, address, phone, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Suspect ID is required' }, { status: 400 })
    }

    const suspect = await prisma.caseSuspect.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ suspect })
  } catch (error) {
    console.error('❌ Error updating suspect:', error)
    return NextResponse.json({ error: 'Failed to update suspect' }, { status: 500 })
  }
}

// DELETE - Delete suspect
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Suspect ID is required' }, { status: 400 })
    }

    await prisma.caseSuspect.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting suspect:', error)
    return NextResponse.json({ error: 'Failed to delete suspect' }, { status: 500 })
  }
}
