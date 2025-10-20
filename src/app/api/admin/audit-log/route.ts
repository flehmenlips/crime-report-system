import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is SuperAdmin
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - SuperAdmin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const date = searchParams.get('date') || ''

    // Build where clause
    const where: any = {}

    // Date filtering
    if (date) {
      const now = new Date()
      let startDate: Date

      switch (date) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.timestamp = {
        gte: startDate
      }
    }

    // Action filtering
    if (action) {
      where.action = action
    }

    // Search filtering
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.auditLog.count({ where })

    // Get audit logs with pagination
    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get user details for logs that have userId
    const userIds = [...new Set(auditLogs.map(log => log.userId).filter(Boolean))] as string[]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, username: true }
    })
    
    const userMap = new Map(users.map(user => [user.id, user]))

    // Format the response
    const formattedLogs = auditLogs.map(log => {
      const user = log.userId ? userMap.get(log.userId) : null
      return {
        id: log.id,
        userId: log.userId,
        userName: user?.name || log.username || 'Unknown User',
        action: log.action,
        entityType: log.resourceType,
        entityId: log.resource,
        details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
        ipAddress: log.ipAddress,
        createdAt: log.timestamp.toISOString()
      }
    })

    return NextResponse.json({
      auditLogs: formattedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Audit log fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
