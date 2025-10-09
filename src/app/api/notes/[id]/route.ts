import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update an investigation note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = parseInt(params.id)
    const body = await request.json()
    const { content, isConfidential } = body

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if note exists
    const existingNote = await prisma.investigationNote.findUnique({
      where: { id: noteId }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Update the note
    const updatedNote = await prisma.investigationNote.update({
      where: { id: noteId },
      data: {
        content: content.trim(),
        isConfidential: isConfidential !== undefined ? isConfidential : existingNote.isConfidential,
        updatedAt: new Date()
      }
    })

    console.log('✅ Investigation note updated:', {
      id: updatedNote.id,
      itemId: updatedNote.itemId,
      createdBy: updatedNote.createdByName,
      role: updatedNote.createdByRole
    })

    return NextResponse.json({
      id: updatedNote.id,
      content: updatedNote.content,
      createdBy: updatedNote.createdBy,
      createdByName: updatedNote.createdByName,
      createdByRole: updatedNote.createdByRole,
      isConfidential: updatedNote.isConfidential,
      createdAt: updatedNote.createdAt.toISOString(),
      updatedAt: updatedNote.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Error updating investigation note:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update investigation note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete an investigation note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = parseInt(params.id)

    // Check if note exists
    const existingNote = await prisma.investigationNote.findUnique({
      where: { id: noteId }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Delete the note
    await prisma.investigationNote.delete({
      where: { id: noteId }
    })

    console.log('✅ Investigation note deleted:', {
      id: noteId,
      itemId: existingNote.itemId,
      createdBy: existingNote.createdByName
    })

    return NextResponse.json({ 
      success: true,
      message: 'Note deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting investigation note:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete investigation note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
