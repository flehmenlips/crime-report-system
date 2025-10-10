'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'

interface CasePermissionsProps {
  caseId: string
  user: User
  onClose: () => void
}

interface Permission {
  id: string
  userId: string
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  grantedBy: string
  grantedByName: string
}

interface TenantUser {
  id: string
  name: string
  email: string
  role: string
}

export function CasePermissions({ caseId, user, onClose }: CasePermissionsProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [canView, setCanView] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [caseId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load case details to get permissions
      const caseResponse = await fetch(`/api/case-details?tenantId=${user.tenant?.id}&userId=${user.id}`)
      if (caseResponse.ok) {
        const caseData = await caseResponse.json()
        const foundCase = caseData.caseDetails.find((c: any) => c.id === caseId)
        if (foundCase) {
          setPermissions(foundCase.permissions || [])
        }
      }

      // Load tenant users
      if (user.tenant?.id) {
        const usersResponse = await fetch(`/api/tenant/users?tenantId=${user.tenant.id}`)
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setTenantUsers(usersData.users || [])
        }
      }
    } catch (err) {
      console.error('Error loading permissions data:', err)
      setError('Failed to load permissions data')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantPermission = async () => {
    if (!selectedUser) {
      setError('Please select a user')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/case-details/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          userId: selectedUser,
          canView,
          canEdit,
          canDelete,
          grantedBy: user.id,
          grantedByName: user.name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to grant permission')
      }

      // Reload permissions
      await loadData()
      
      // Reset form
      setSelectedUser('')
      setCanView(true)
      setCanEdit(false)
      setCanDelete(false)

    } catch (err) {
      console.error('Error granting permission:', err)
      setError(err instanceof Error ? err.message : 'Failed to grant permission')
    } finally {
      setSaving(false)
    }
  }

  const handleRevokePermission = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke access for this user?')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/case-details/permissions?caseId=${caseId}&userId=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to revoke permission')
      }

      // Reload permissions
      await loadData()

    } catch (err) {
      console.error('Error revoking permission:', err)
      setError(err instanceof Error ? err.message : 'Failed to revoke permission')
    } finally {
      setSaving(false)
    }
  }

  const getUserName = (userId: string) => {
    const foundUser = tenantUsers.find(u => u.id === userId)
    return foundUser ? foundUser.name : userId
  }

  const getUserRole = (userId: string) => {
    const foundUser = tenantUsers.find(u => u.id === userId)
    return foundUser ? foundUser.role : 'unknown'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'law_enforcement':
        return { bg: '#fee2e2', color: '#991b1b', icon: '🚔' }
      case 'insurance_agent':
        return { bg: '#dcfce7', color: '#166534', icon: '🏢' }
      case 'broker':
        return { bg: '#fef3c7', color: '#92400e', icon: '🤝' }
      case 'banker':
        return { bg: '#fef3c7', color: '#92400e', icon: '🏦' }
      case 'asset_manager':
        return { bg: '#e0f2fe', color: '#075985', icon: '📊' }
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: '👤' }
    }
  }

  // Filter out users who already have permissions
  const availableUsers = tenantUsers.filter(u => 
    u.id !== user.id && // Not the current user
    !permissions.some(p => p.userId === u.id) // Not already granted
  )

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            padding: '32px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            color: 'white',
            position: 'relative',
            flexShrink: 0
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
              🔐 Manage Case Access
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Control who can view and edit this case report
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '24px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Grant New Permission */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '2px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Grant Access to User
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Permissions
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px',
                    background: canView ? '#ecfdf5' : 'white',
                    border: canView ? '2px solid #10b981' : '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="checkbox"
                      checked={canView}
                      onChange={(e) => setCanView(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        👁️ Can View
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        User can view case details, timeline, suspects, and evidence
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px',
                    background: canEdit ? '#fef3c7' : 'white',
                    border: canEdit ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="checkbox"
                      checked={canEdit}
                      onChange={(e) => setCanEdit(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        ✏️ Can Edit
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        User can add updates and modify case information
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px',
                    background: canDelete ? '#fee2e2' : 'white',
                    border: canDelete ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="checkbox"
                      checked={canDelete}
                      onChange={(e) => setCanDelete(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        🗑️ Can Delete
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        User can delete the entire case report (use with caution)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleGrantPermission}
                disabled={!selectedUser || saving}
                style={{
                  width: '100%',
                  background: !selectedUser || saving
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  cursor: !selectedUser || saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Granting Access...
                  </>
                ) : (
                  <>
                    ✅ Grant Access
                  </>
                )}
              </button>
            </div>

            {/* Current Permissions */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Current Access ({permissions.length})
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                  }}></div>
                  <p style={{ color: '#6b7280' }}>Loading permissions...</p>
                </div>
              ) : permissions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    No one has been granted access yet. Only you can view this case.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {permissions.map((permission) => {
                    const roleBadge = getRoleBadgeColor(getUserRole(permission.userId))
                    return (
                      <div
                        key={permission.id}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <div style={{
                                background: roleBadge.bg,
                                color: roleBadge.color,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span>{roleBadge.icon}</span>
                                <span>{getUserName(permission.userId)}</span>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {permission.canView && (
                                <span style={{
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  👁️ View
                                </span>
                              )}
                              {permission.canEdit && (
                                <span style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  ✏️ Edit
                                </span>
                              )}
                              {permission.canDelete && (
                                <span style={{
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  🗑️ Delete
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRevokePermission(permission.userId)}
                            disabled={saving}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#991b1b'
                            }}
                          >
                            Revoke Access
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            flexShrink: 0
          }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

