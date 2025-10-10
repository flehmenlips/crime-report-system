import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Add timeline event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      caseId,
      date,
      time,
      event,
      description,
      createdBy,
      createdByName,
      createdByRole
    } = body

    if (!caseId || !date || !time || !event || !description || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const timelineEvent = await prisma.caseTimelineEvent.create({
      data: {
        caseId,
        date: new Date(date),
        time,
        event,
        description,
        createdBy,
        createdByName,
        createdByRole
      }
    })

    return NextResponse.json({ timelineEvent })

  } catch (error) {
    console.error('❌ Error creating timeline event:', error)
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    )
  }
}

// PUT - Update timeline event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, date, time, event, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Timeline event ID is required' },
        { status: 400 }
      )
    }

    const timelineEvent = await prisma.caseTimelineEvent.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(event && { event }),
        ...(description && { description }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ timelineEvent })

  } catch (error) {
    console.error('❌ Error updating timeline event:', error)
    return NextResponse.json(
      { error: 'Failed to update timeline event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete timeline event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Timeline event ID is required' },
        { status: 400 }
      )
    }

    await prisma.caseTimelineEvent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error deleting timeline event:', error)
    return NextResponse.json(
      { error: 'Failed to delete timeline event' },
      { status: 500 }
    )
  }
}
