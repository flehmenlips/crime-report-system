import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch platform analytics (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only super_admin can view platform analytics
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can view platform analytics' },
        { status: 403 }
      )
    }

    // Calculate date for "this week" (7 days ago)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Fetch platform statistics
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

    // Fetch tenant statistics
    const tenantStats = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            items: true
          }
        }
      }
    })

    // Transform tenant stats to include evidence count
    const tenantStatsWithEvidence = await Promise.all(
      tenantStats.map(async (tenant) => {
        const evidenceCount = await prisma.evidence.count({
          where: {
            item: {
              tenantId: tenant.id
            }
          }
        })

        return {
          tenantName: tenant.name,
          userCount: tenant._count.users,
          itemCount: tenant._count.items,
          evidenceCount
        }
      })
    )

    // Generate user growth data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userGrowth = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const userCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users: userCount
      })
    }

    const analytics = {
      platformStats: {
        totalUsers,
        totalTenants,
        activeUsers,
        newUsersThisWeek,
        totalItems,
        totalEvidence
      },
      userGrowth,
      tenantStats: tenantStatsWithEvidence
    }

    console.log(`✅ SuperAdmin "${currentUser.name}" fetched platform analytics`)

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('❌ Error fetching platform analytics:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch platform analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
