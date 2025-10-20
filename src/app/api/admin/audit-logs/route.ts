import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get current user and verify SuperAdmin role
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const severity = searchParams.get('severity')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'timestamp'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (action) {
      where.action = { contains: action, mode: 'insensitive' }
    }

    if (resource) {
      where.resource = { contains: resource, mode: 'insensitive' }
    }

    if (severity) {
      where.severity = severity
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) {
        where.timestamp.gte = new Date(startDate)
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate)
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get audit logs with user information
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ])

    // Get summary statistics
    const stats = await prisma.auditLog.groupBy({
      by: ['action', 'severity'],
      where: startDate || endDate ? {
        timestamp: where.timestamp
      } : {},
      _count: {
        id: true
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        stats: stats.map(stat => ({
          action: stat.action,
          severity: stat.severity,
          count: stat._count.id
        }))
      }
    })

  } catch (error) {
    console.error('Audit logs fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
