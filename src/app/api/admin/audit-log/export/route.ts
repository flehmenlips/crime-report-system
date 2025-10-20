import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

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
    const format = searchParams.get('format') || 'csv'
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const date = searchParams.get('date') || ''

    // Build where clause (same as in the main audit log route)
    const where: any = {}

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

    if (action) {
      where.action = action
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get all audit logs (no pagination for export)
    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Get user details for logs that have userId
    const userIds = [...new Set(auditLogs.map(log => log.userId).filter(Boolean))] as string[]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, username: true }
    })
    
    const userMap = new Map(users.map(user => [user.id, user]))

    if (format === 'csv') {
      // Generate CSV content
      const csvHeader = 'Timestamp,User Name,User Email,Action,Entity Type,Entity ID,Details,IP Address\n'
      
      const csvRows = auditLogs.map(log => {
        const user = log.userId ? userMap.get(log.userId) : null
        const timestamp = log.timestamp.toISOString()
        const userName = user?.name || log.username || 'Unknown User'
        const userEmail = user?.email || ''
        const action = log.action
        const entityType = log.resourceType
        const entityId = log.resource || ''
        const details = (typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '')).replace(/"/g, '""') // Escape quotes
        const ipAddress = log.ipAddress

        return `"${timestamp}","${userName}","${userEmail}","${action}","${entityType}","${entityId}","${details}","${ipAddress}"`
      }).join('\n')

      const csvContent = csvHeader + csvRows

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default to JSON format
    const formattedLogs = auditLogs.map(log => {
      const user = log.userId ? userMap.get(log.userId) : null
      return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        userName: user?.name || log.username || 'Unknown User',
        userEmail: user?.email || '',
        action: log.action,
        entityType: log.resourceType,
        entityId: log.resource,
        details: log.details,
        ipAddress: log.ipAddress
      }
    })

    return NextResponse.json({
      auditLogs: formattedLogs,
      exportDate: new Date().toISOString(),
      totalRecords: auditLogs.length
    })

  } catch (error) {
    console.error('Audit log export error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
