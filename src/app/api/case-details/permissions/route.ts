import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Grant permission to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseId, userId, canView, canEdit, canDelete, grantedBy, grantedByName } = body

    if (!caseId || !userId || !grantedBy || !grantedByName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if permission already exists
    const existing = await prisma.casePermission.findUnique({
      where: { caseId_userId: { caseId, userId } }
    })

    let permission
    if (existing) {
      // Update existing permission
      permission = await prisma.casePermission.update({
        where: { id: existing.id },
        data: {
          canView: canView !== undefined ? canView : existing.canView,
          canEdit: canEdit !== undefined ? canEdit : existing.canEdit,
          canDelete: canDelete !== undefined ? canDelete : existing.canDelete,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new permission
      permission = await prisma.casePermission.create({
        data: {
          caseId,
          userId,
          canView: canView !== undefined ? canView : true,
          canEdit: canEdit !== undefined ? canEdit : false,
          canDelete: canDelete !== undefined ? canDelete : false,
          grantedBy,
          grantedByName
        }
      })
    }

    console.log('✅ Case permission granted:', { caseId, userId, canView: permission.canView, canEdit: permission.canEdit })

    return NextResponse.json({ permission })
  } catch (error) {
    console.error('❌ Error creating/updating permission:', error)
    return NextResponse.json({ error: 'Failed to create/update permission' }, { status: 500 })
  }
}

// DELETE - Revoke permission
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')
    const userId = searchParams.get('userId')

    if (!caseId || !userId) {
      return NextResponse.json({ error: 'caseId and userId are required' }, { status: 400 })
    }

    await prisma.casePermission.delete({
      where: { caseId_userId: { caseId, userId } }
    })

    console.log('✅ Case permission revoked:', { caseId, userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting permission:', error)
    return NextResponse.json({ error: 'Failed to delete permission' }, { status: 500 })
  }
}
