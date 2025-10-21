'use client'

import { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { InviteUserModal } from './InviteUserModal'

interface TenantUserManagementProps {
  tenant: Tenant
  onClose: () => void
  onUpdate: () => void
}

interface UserWithRole extends User {
  itemCount?: number
  lastLogin?: string
}

export function TenantUserManagement({ tenant, onClose, onUpdate }: TenantUserManagementProps) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTenantUsers()
  }, [tenant.id])

  const loadTenantUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tenant/users?tenantId=${tenant.id}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to load tenant users')
      }
    } catch (err) {
      setError('Failed to load tenant users')
      console.error('Error loading tenant users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmMessage = `Are you sure you want to remove "${user.name}" from this tenant?\n\nThis will revoke their access to ${tenant.name}'s data.`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/tenant/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ User removed from tenant successfully!')
        loadTenantUsers()
        onUpdate()
      } else {
        const result = await response.json()
        alert(`❌ Failed to remove user: ${result.error}`)
      }
    } catch (error) {
      console.error('Error removing user from tenant:', error)
      alert('❌ Failed to remove user from tenant')
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmMessage = `Are you sure you want to change "${user.name}"'s role to "${newRole.replace('_', ' ')}"?`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/tenant/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: newRole
        })
      })

      if (response.ok) {
        alert('✅ User role updated successfully!')
        loadTenantUsers()
        onUpdate()
      } else {
        const result = await response.json()
        alert(`❌ Failed to update user role: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('❌ Failed to update user role')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'property_owner': return '#059669'
      case 'law_enforcement': return '#2563eb'
      case 'insurance_agent': return '#7c3aed'
      case 'broker': return '#ea580c'
      case 'banker': return '#0891b2'
      case 'asset_manager': return '#be185d'
      case 'assistant': return '#6b7280'
      case 'secretary': return '#6b7280'
      case 'manager': return '#059669'
      case 'executive_assistant': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'property_owner': return '🏠'
      case 'law_enforcement': return '👮'
      case 'insurance_agent': return '🛡️'
      case 'broker': return '💰'
      case 'banker': return '🏦'
      case 'asset_manager': return '📊'
      case 'assistant': return '👤'
      case 'secretary': return '👤'
      case 'manager': return '👔'
      case 'executive_assistant': return '👤'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading tenant users...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              👥 {tenant.name} - User Management
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Manage users and their access to this tenant's data
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 32px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {/* Users List */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Users ({users.length})
              </h3>
              <button
                onClick={() => setShowInviteUser(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>➕</span>
                Invite User
              </button>
            </div>

            {users.length === 0 ? (
              <div style={{
                background: '#f9fafb',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No users assigned to this tenant</p>
                <p style={{ fontSize: '14px' }}>Invite users to give them access to {tenant.name}'s data</p>
              </div>
            ) : (
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                {users.map(user => (
                  <div key={user.id} style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    background: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                          {getRoleIcon(user.role)} {user.name}
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '2px' }}>
                          {user.email}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '12px' }}>
                          @{user.username} • {user.itemCount || 0} items
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Verification Status Badge - Only show for non-owners */}
                      {user.role !== 'property_owner' && (
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600',
                          ...((user.isActive && user.lastLoginAt) ? {
                            color: '#059669',
                            background: '#d1fae5',
                            border: '1px solid #6ee7b7'
                          } : {
                            color: '#f59e0b',
                            background: '#fef3c7',
                            border: '1px solid #fde68a'
                          })
                        }}>
                          {(user.isActive && user.lastLoginAt) ? '✓ VERIFIED' : '⏳ INVITED'}
                        </div>
                      )}
                      
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'white',
                        background: getRoleColor(user.role)
                      }}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </div>
                      
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '12px',
                          background: 'white'
                        }}
                      >
                        <option value="property_owner">Property Owner</option>
                        <option value="law_enforcement">Law Enforcement</option>
                        <option value="insurance_agent">Insurance Agent</option>
                        <option value="broker">Broker</option>
                        <option value="banker">Banker</option>
                        <option value="asset_manager">Asset Manager</option>
                        <option value="assistant">Assistant</option>
                        <option value="secretary">Secretary</option>
                        <option value="manager">Manager</option>
                        <option value="executive_assistant">Executive Assistant</option>
                      </select>
                      
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div style={{
            padding: '16px',
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            <strong>💡 Tenant User Management:</strong><br/>
            • <strong>Property Owner</strong>: Full access to manage items and invite users<br/>
            • <strong>Law Enforcement</strong>: Can view all items for investigations<br/>
            • <strong>Other Roles</strong>: Limited access based on their role<br/>
            • Users can only access data from their assigned tenant
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteUser && (
        <InviteUserModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          onClose={() => setShowInviteUser(false)}
          onSuccess={loadTenantUsers}
        />
      )}
    </div>
  )
}
