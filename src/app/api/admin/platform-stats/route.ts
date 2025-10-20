import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch platform statistics (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can view platform statistics
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can view platform statistics' },
        { status: 403 }
      )
    }

    // Calculate date for "this week" (7 days ago)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Fetch all platform statistics
    const [
      totalUsers,
      totalTenants,
      activeUsers,
      newUsersThisWeek,
      totalItems,
      totalEvidence
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.user.count({
        where: {
          isActive: true
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      prisma.stolenItem.count(),
      prisma.evidence.count()
    ])

    const stats = {
      totalUsers,
      totalTenants,
      activeUsers,
      newUsersThisWeek,
      totalItems,
      totalEvidence
    }

    console.log(`✅ SuperAdmin "${currentUser.name}" fetched platform statistics`)

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('❌ Error fetching platform statistics:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch platform statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
