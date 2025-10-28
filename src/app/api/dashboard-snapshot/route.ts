import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Retrieve dashboard snapshot for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get snapshot for the user
    const snapshot = await prisma.dashboardSnapshot.findUnique({
      where: { userId: user.id }
    })

    return NextResponse.json({
      snapshot,
      hasCache: !!snapshot
    })
  } catch (error) {
    console.error('Error fetching dashboard snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard snapshot' },
      { status: 500 }
    )
  }
}

// POST/PUT - Create or update dashboard snapshot
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      totalItems, 
      totalValue, 
      totalEvidenceFiles, 
      photosCount, 
      videosCount, 
      documentsCount,
      itemsWithPhotos
    } = body

    // Upsert (create or update) the snapshot
    const snapshot = await prisma.dashboardSnapshot.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tenantId: user.tenantId || null,
        totalItems: totalItems || 0,
        totalValue: totalValue || 0,
        totalEvidenceFiles: totalEvidenceFiles || 0,
        photosCount: photosCount || 0,
        videosCount: videosCount || 0,
        documentsCount: documentsCount || 0,
        itemsWithPhotos: itemsWithPhotos || 0
      },
      update: {
        totalItems: totalItems || 0,
        totalValue: totalValue || 0,
        totalEvidenceFiles: totalEvidenceFiles || 0,
        photosCount: photosCount || 0,
        videosCount: videosCount || 0,
        documentsCount: documentsCount || 0,
        itemsWithPhotos: itemsWithPhotos || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      snapshot,
      message: 'Dashboard snapshot saved successfully'
    })
  } catch (error) {
    console.error('Error saving dashboard snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to save dashboard snapshot' },
      { status: 500 }
    )
  }
}

// DELETE - Clear dashboard snapshot
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await prisma.dashboardSnapshot.delete({
      where: { userId: user.id }
    })

    return NextResponse.json({
      message: 'Dashboard snapshot cleared successfully'
    })
  } catch (error) {
    console.error('Error deleting dashboard snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard snapshot' },
      { status: 500 }
    )
  }
}

