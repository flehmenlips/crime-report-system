'use client'

import React, { useState, useEffect } from 'react'

interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  details: string
  ipAddress: string
  createdAt: string
}

interface SuperAdminAuditLogProps {
  currentUser: any
}

export function SuperAdminAuditLog({ currentUser }: SuperAdminAuditLogProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(20)

  const actionTypes = [
    'LOGIN',
    'LOGOUT',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'TENANT_CREATE',
    'TENANT_UPDATE',
    'TENANT_DELETE',
    'ITEM_CREATE',
    'ITEM_UPDATE',
    'ITEM_DELETE',
    'EVIDENCE_UPLOAD',
    'EVIDENCE_DELETE',
    'PROFILE_UPDATE',
    'PASSWORD_CHANGE',
    'EMAIL_VERIFY',
    'INVITATION_SENT',
    'PERMISSION_CHANGE'
  ]

  useEffect(() => {
    loadAuditLogs()
  }, [currentPage, searchTerm, actionFilter, dateFilter])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(actionFilter && { action: actionFilter }),
        ...(dateFilter && { date: dateFilter })
      })

      const response = await fetch(`/api/admin/audit-log?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.auditLogs || [])
        setTotalPages(Math.ceil((data.total || 0) / pageSize))
      } else {
        setError('Failed to load audit logs')
        setAuditLogs([])
      }
    } catch (error) {
      console.error('Audit log loading error:', error)
      setError('Failed to load audit logs')
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(searchTerm && { search: searchTerm }),
        ...(actionFilter && { action: actionFilter }),
        ...(dateFilter && { date: dateFilter })
      })

      const response = await fetch(`/api/admin/audit-log/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError('Failed to export audit logs')
      }
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export audit logs')
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return '#10b981'
    if (action.includes('UPDATE')) return '#3b82f6'
    if (action.includes('DELETE')) return '#ef4444'
    if (action.includes('LOGIN')) return '#8b5cf6'
    if (action.includes('LOGOUT')) return '#6b7280'
    return '#6b7280'
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading audit logs...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Platform Audit Log
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              margin: 0
            }}>
              Complete audit trail of all platform activities and user actions
            </p>
          </div>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, action, or details..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {formatAction(action)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Audit Entries ({auditLogs.length} total)
          </h3>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No audit logs found
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchTerm || actionFilter || dateFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'Audit logs will appear here as users perform actions on the platform.'
              }
            </div>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            {auditLogs.map((log, index) => (
              <div
                key={log.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < auditLogs.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: index % 2 === 0 ? 'white' : '#fafafa'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white',
                        background: getActionColor(log.action)
                      }}
                    >
                      {formatAction(log.action)}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {log.userName}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  <strong>Entity:</strong> {log.entityType} {log.entityId && `(${log.entityId})`}
                </div>

                {log.details && (
                  <div style={{
                    fontSize: '13px',
                    color: '#374151',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <strong>Details:</strong> {log.details}
                  </div>
                )}

                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '8px'
                }}>
                  IP: {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  background: currentPage === totalPages ? '#f3f4f6' : 'white',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
