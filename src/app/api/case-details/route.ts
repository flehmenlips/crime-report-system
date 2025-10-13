import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch case details for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const userId = searchParams.get('userId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId parameter is required' },
        { status: 400 }
      )
    }

    // Fetch case details with all relations
    const caseDetails = await prisma.caseDetails.findMany({
      where: { tenantId },
      include: {
        timeline: {
          orderBy: { date: 'asc' }
        },
        suspects: true,
        caseEvidence: true,
        updates: {
          orderBy: { date: 'desc' }
        },
        permissions: true
      }
    })

    // Filter based on user permissions if userId is provided
    if (userId) {
      const filteredCases = caseDetails.filter(caseDetail => {
        // Owner can always see their case
        if (caseDetail.createdBy === userId) {
          return true
        }
        
        // Check if user has explicit permission
        const userPermission = caseDetail.permissions.find(p => p.userId === userId)
        return userPermission?.canView === true
      })

      return NextResponse.json({ caseDetails: filteredCases })
    }

    return NextResponse.json({ caseDetails })

  } catch (error) {
    console.error('❌ Error fetching case details:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch case details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new case details
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tenantId,
      caseName,
      caseNumber,
      dateReported,
      dateOccurred,
      location,
      status,
      priority,
      assignedOfficer,
      description,
      createdBy,
      createdByName,
      createdByRole
    } = body

    // Validate required fields
    if (!tenantId || !caseName || !dateReported || !dateOccurred || !location || !description || !createdBy || !createdByName || !createdByRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create case details
    const caseDetails = await prisma.caseDetails.create({
      data: {
        tenantId,
        caseName,
        caseNumber,
        dateReported: new Date(dateReported),
        dateOccurred: new Date(dateOccurred),
        location,
        status: status || 'open',
        priority: priority || 'medium',
        assignedOfficer,
        description,
        createdBy,
        createdByName,
        createdByRole
      },
      include: {
        timeline: true,
        suspects: true,
        caseEvidence: true,
        updates: true,
        permissions: true
      }
    })

    console.log('✅ Case details created:', {
      id: caseDetails.id,
      caseName: caseDetails.caseName,
      createdBy: caseDetails.createdByName
    })

    return NextResponse.json({ caseDetails })

  } catch (error) {
    console.error('❌ Error creating case details:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create case details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update case details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      caseName,
      caseNumber,
      dateReported,
      dateOccurred,
      location,
      status,
      priority,
      assignedOfficer,
      description,
      userId
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }

    // Check if case exists and user has permission
    const existingCase = await prisma.caseDetails.findUnique({
      where: { id },
      include: { permissions: true }
    })

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (userId && existingCase.createdBy !== userId) {
      const userPermission = existingCase.permissions.find(p => p.userId === userId)
      if (!userPermission?.canEdit) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Update case details
    const updatedCase = await prisma.caseDetails.update({
      where: { id },
      data: {
        ...(caseName && { caseName }),
        ...(caseNumber !== undefined && { caseNumber }),
        ...(dateReported && { dateReported: new Date(dateReported) }),
        ...(dateOccurred && { dateOccurred: new Date(dateOccurred) }),
        ...(location && { location }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedOfficer !== undefined && { assignedOfficer }),
        ...(description && { description }),
        updatedAt: new Date()
      },
      include: {
        timeline: true,
        suspects: true,
        caseEvidence: true,
        updates: true,
        permissions: true
      }
    })

    console.log('✅ Case details updated:', {
      id: updatedCase.id,
      caseName: updatedCase.caseName
    })

    return NextResponse.json({ caseDetails: updatedCase })

  } catch (error) {
    console.error('❌ Error updating case details:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update case details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete case details
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }

    // Check if case exists and user has permission
    const existingCase = await prisma.caseDetails.findUnique({
      where: { id },
      include: { permissions: true }
    })

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Check permissions - only creator or users with delete permission can delete
    if (userId && existingCase.createdBy !== userId) {
      const userPermission = existingCase.permissions.find(p => p.userId === userId)
      if (!userPermission?.canDelete) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Delete case details (cascades to related records)
    await prisma.caseDetails.delete({
      where: { id }
    })

    console.log('✅ Case details deleted:', {
      id,
      caseName: existingCase.caseName
    })

    return NextResponse.json({ 
      success: true,
      message: 'Case details deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting case details:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete case details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
