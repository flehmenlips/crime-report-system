/**
 * Audit Logging Service
 * 
 * Critical for law enforcement compliance and chain of custody.
 * Logs all security-relevant actions, evidence access, and data modifications.
 * 
 * Features:
 * - Immutable audit trail
 * - Comprehensive action logging
 * - IP address and user agent tracking
 * - Success/failure tracking
 * - Severity levels for monitoring
 */

import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export type AuditAction =
  // Authentication actions
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'password_reset'
  | 'email_verified'
  | 'account_created'
  
  // Evidence actions (CRITICAL for chain of custody)
  | 'evidence_viewed'
  | 'evidence_uploaded'
  | 'evidence_downloaded'
  | 'evidence_modified'
  | 'evidence_deleted'
  
  // Case/Item actions
  | 'item_created'
  | 'item_viewed'
  | 'item_modified'
  | 'item_deleted'
  | 'case_created'
  | 'case_viewed'
  | 'case_modified'
  | 'case_closed'
  
  // Administrative actions
  | 'user_created'
  | 'user_modified'
  | 'user_deactivated'
  | 'permissions_changed'
  | 'tenant_accessed'
  
  // Data export (important for legal proceedings)
  | 'report_generated'
  | 'data_exported'
  | 'audit_log_viewed'

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AuditLogEntry {
  userId?: string
  username?: string
  action: AuditAction
  resource?: string // Format: "type:id" e.g. "evidence:123"
  resourceType?: string // e.g. "evidence", "case", "user"
  details?: any // Additional context, before/after values, etc.
  ipAddress?: string
  userAgent?: string
  success?: boolean
  severity?: AuditSeverity
}

/**
 * Log an audit event to the database
 * 
 * @param entry - Audit log entry details
 * @returns Promise resolving to the created audit log record
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        username: entry.username || null,
        action: entry.action,
        resource: entry.resource || null,
        resourceType: entry.resourceType || null,
        details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        success: entry.success ?? true,
        severity: entry.severity || 'info',
        timestamp: new Date()
      }
    })
  } catch (error) {
    // CRITICAL: Audit logging failure should not break the application
    // but must be logged to error monitoring
    console.error('❌ CRITICAL: Failed to write audit log:', error)
    console.error('Audit entry that failed:', JSON.stringify(entry, null, 2))
  }
}

/**
 * Extract client information from NextRequest
 * 
 * @param request - Next.js request object
 * @returns Object containing IP address and user agent
 */
export function getClientInfo(request: NextRequest): {
  ipAddress: string
  userAgent: string
} {
  // Try to get real IP from headers (behind proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

/**
 * Log authentication attempt (success or failure)
 */
export async function logAuthAttempt({
  username,
  userId,
  success,
  reason,
  request
}: {
  username: string
  userId?: string
  success: boolean
  reason?: string
  request?: NextRequest
}): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : { ipAddress: 'unknown', userAgent: 'unknown' }
  
  await logAudit({
    userId,
    username,
    action: success ? 'login' : 'login_failed',
    details: reason ? { reason } : undefined,
    success,
    severity: success ? 'info' : 'warning',
    ...clientInfo
  })
}

/**
 * Log evidence access (CRITICAL for chain of custody)
 */
export async function logEvidenceAccess({
  userId,
  username,
  action,
  evidenceId,
  itemId,
  details,
  request
}: {
  userId: string
  username: string
  action: 'evidence_viewed' | 'evidence_uploaded' | 'evidence_downloaded' | 'evidence_modified' | 'evidence_deleted'
  evidenceId?: number
  itemId?: number
  details?: any
  request?: NextRequest
}): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : { ipAddress: 'unknown', userAgent: 'unknown' }
  
  await logAudit({
    userId,
    username,
    action,
    resource: evidenceId ? `evidence:${evidenceId}` : itemId ? `item:${itemId}` : undefined,
    resourceType: 'evidence',
    details: {
      evidenceId,
      itemId,
      ...details
    },
    severity: action === 'evidence_deleted' ? 'warning' : 'info',
    ...clientInfo
  })
}

/**
 * Log item/case modification
 */
export async function logItemModification({
  userId,
  username,
  action,
  itemId,
  beforeValue,
  afterValue,
  request
}: {
  userId: string
  username: string
  action: 'item_created' | 'item_modified' | 'item_deleted'
  itemId: number
  beforeValue?: any
  afterValue?: any
  request?: NextRequest
}): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : { ipAddress: 'unknown', userAgent: 'unknown' }
  
  await logAudit({
    userId,
    username,
    action,
    resource: `item:${itemId}`,
    resourceType: 'item',
    details: {
      itemId,
      before: beforeValue,
      after: afterValue
    },
    severity: action === 'item_deleted' ? 'warning' : 'info',
    ...clientInfo
  })
}

/**
 * Log administrative action
 */
export async function logAdminAction({
  userId,
  username,
  action,
  targetUserId,
  details,
  request
}: {
  userId: string
  username: string
  action: AuditAction
  targetUserId?: string
  details?: any
  request?: NextRequest
}): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : { ipAddress: 'unknown', userAgent: 'unknown' }
  
  await logAudit({
    userId,
    username,
    action,
    resource: targetUserId ? `user:${targetUserId}` : undefined,
    resourceType: 'user',
    details,
    severity: 'warning', // Admin actions are always notable
    ...clientInfo
  })
}

/**
 * Log data export (important for legal proceedings)
 */
export async function logDataExport({
  userId,
  username,
  action,
  exportType,
  recordCount,
  request
}: {
  userId: string
  username: string
  action: 'report_generated' | 'data_exported' | 'audit_log_viewed'
  exportType: string
  recordCount?: number
  request?: NextRequest
}): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : { ipAddress: 'unknown', userAgent: 'unknown' }
  
  await logAudit({
    userId,
    username,
    action,
    resourceType: 'export',
    details: {
      exportType,
      recordCount,
      timestamp: new Date().toISOString()
    },
    severity: 'info',
    ...clientInfo
  })
}

/**
 * Query audit logs (for law enforcement review)
 * 
 * @param filters - Query filters
 * @returns Promise resolving to audit log records
 */
export async function queryAuditLogs({
  userId,
  action,
  resource,
  resourceType,
  startDate,
  endDate,
  success,
  limit = 100
}: {
  userId?: string
  action?: AuditAction
  resource?: string
  resourceType?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
}) {
  const where: any = {}
  
  if (userId) where.userId = userId
  if (action) where.action = action
  if (resource) where.resource = resource
  if (resourceType) where.resourceType = resourceType
  if (success !== undefined) where.success = success
  
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc'
    },
    take: limit
  })
}

/**
 * Get audit log statistics (for security monitoring)
 */
export async function getAuditStats(startDate?: Date, endDate?: Date) {
  const where: any = {}
  
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }
  
  const [
    totalLogs,
    failedAttempts,
    evidenceAccess,
    criticalActions
  ] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.count({ where: { ...where, success: false } }),
    prisma.auditLog.count({ where: { ...where, action: { startsWith: 'evidence_' } } }),
    prisma.auditLog.count({ where: { ...where, severity: 'critical' } })
  ])
  
  return {
    totalLogs,
    failedAttempts,
    evidenceAccess,
    criticalActions
  }
}

