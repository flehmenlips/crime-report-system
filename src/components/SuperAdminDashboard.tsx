'use client'

import { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { users, tenants } from '@/lib/auth'
import { CreateTenantModal } from './CreateTenantModal'
import { TenantUserManagement } from './TenantUserManagement'

interface SuperAdminDashboardProps {
  currentUser: User
  onClose: () => void
}

interface UserWithTenant extends User {
  tenant?: Tenant
  itemCount?: number
  lastLogin?: string
}

interface TenantWithStats extends Tenant {
  userCount?: number
  itemCount?: number
  totalValue?: number
}

export function SuperAdminDashboard({ currentUser, onClose }: SuperAdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<UserWithTenant[]>([])
  const [allTenants, setAllTenants] = useState<TenantWithStats[]>([])
  const [selectedTab, setSelectedTab] = useState<'users' | 'tenants' | 'system'>('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateTenant, setShowCreateTenant] = useState(false)
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<Tenant | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load users from real database
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) {
        throw new Error('Failed to load users')
      }
      const usersData = await usersResponse.json()
      
      // Load tenants from real database
      const tenantsResponse = await fetch('/api/admin/tenants')
      if (!tenantsResponse.ok) {
        throw new Error('Failed to load tenants')
      }
      const tenantsData = await tenantsResponse.json()
      
      setAllUsers(usersData.users)
      setAllTenants(tenantsData.tenants)
      setError(null)
    } catch (err) {
      setError('Failed to load admin data')
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      const user = allUsers.find(u => u.id === userId)
      if (!user) return

      let confirmMessage = ''
      let isDestructive = false

      switch (action) {
        case 'activate':
          confirmMessage = `Are you sure you want to activate user "${user.name}" (${user.email})?`
          break
        case 'deactivate':
          confirmMessage = `Are you sure you want to deactivate user "${user.name}" (${user.email})?\n\nThis will prevent them from logging in.`
          isDestructive = true
          break
        case 'delete':
          confirmMessage = `⚠️ DANGER: Are you sure you want to DELETE user "${user.name}" (${user.email})?\n\nThis action is PERMANENT and cannot be undone!\n\nUser has ${user.itemCount || 0} items that will be affected.\n\nType "DELETE" to confirm:`
          isDestructive = true
          break
      }

      if (isDestructive && action === 'delete') {
        const confirmation = prompt(confirmMessage)
        if (confirmation !== 'DELETE') {
          alert('User deletion cancelled. You must type "DELETE" to confirm.')
          return
        }
      } else {
        if (!confirm(confirmMessage)) {
          return
        }
      }

      let response
      if (action === 'delete') {
        response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        })
      } else {
        response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isActive: action === 'activate' 
          })
        })
      }

      const result = await response.json()

      if (response.ok) {
        alert(`✅ User ${action} successful!`)
        loadData() // Refresh data
      } else {
        alert(`❌ Failed to ${action} user: ${result.error}`)
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error)
      alert(`❌ Failed to ${action} user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleTenantAction = async (tenantId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      const tenant = allTenants.find(t => t.id === tenantId)
      if (!tenant) return

      let confirmMessage = ''
      let isDestructive = false

      switch (action) {
        case 'activate':
          confirmMessage = `Are you sure you want to activate tenant "${tenant.name}"?`
          break
        case 'deactivate':
          confirmMessage = `Are you sure you want to deactivate tenant "${tenant.name}"?\n\nThis will affect ${tenant.userCount || 0} users and ${tenant.itemCount || 0} items.`
          isDestructive = true
          break
        case 'delete':
          confirmMessage = `⚠️ DANGER: Are you sure you want to DELETE tenant "${tenant.name}"?\n\nThis action is PERMANENT and cannot be undone!\n\nTenant has:\n- ${tenant.userCount || 0} users\n- ${tenant.itemCount || 0} items\n- Total value: $${(tenant.totalValue || 0).toLocaleString()}\n\nType "DELETE" to confirm:`
          isDestructive = true
          break
      }

      if (isDestructive && action === 'delete') {
        const confirmation = prompt(confirmMessage)
        if (confirmation !== 'DELETE') {
          alert('Tenant deletion cancelled. You must type "DELETE" to confirm.')
          return
        }
      } else {
        if (!confirm(confirmMessage)) {
          return
        }
      }

      let response
      if (action === 'delete') {
        response = await fetch(`/api/admin/tenants/${tenantId}`, {
          method: 'DELETE'
        })
      } else {
        response = await fetch(`/api/admin/tenants/${tenantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isActive: action === 'activate' 
          })
        })
      }

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Tenant ${action} successful!`)
        loadData() // Refresh data
      } else {
        alert(`❌ Failed to ${action} tenant: ${result.error}`)
      }
    } catch (error) {
      console.error(`Error performing ${action} on tenant:`, error)
      alert(`❌ Failed to ${action} tenant: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return '#dc2626' // Red
      case 'law_enforcement': return '#2563eb' // Blue
      case 'property_owner': return '#059669' // Green
      case 'insurance_agent': return '#7c3aed' // Purple
      case 'broker': return '#ea580c' // Orange
      case 'banker': return '#0891b2' // Cyan
      case 'asset_manager': return '#be185d' // Pink
      default: return '#6b7280' // Gray
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return '👑'
      case 'law_enforcement': return '👮'
      case 'property_owner': return '🏠'
      case 'insurance_agent': return '🛡️'
      case 'broker': return '💰'
      case 'banker': return '🏦'
      case 'asset_manager': return '📊'
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
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading Super Admin Dashboard...</p>
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
        maxWidth: '1200px',
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
              👑 Super Admin Dashboard
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              System administration and user management
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

        {/* Tabs */}
        <div style={{
          padding: '0 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '0'
        }}>
          {[
            { id: 'users', label: '👥 Users', count: allUsers.length },
            { id: 'tenants', label: '🏢 Tenants', count: allTenants.length },
            { id: 'system', label: '⚙️ System', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: selectedTab === tab.id ? '#dc2626' : 'transparent',
                color: selectedTab === tab.id ? 'white' : '#6b7280',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: selectedTab === tab.id ? '3px solid #dc2626' : '3px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
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

          {selectedTab === 'users' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                User Management ({allUsers.length} users)
              </h3>
              
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '0'
                }}>
                  {allUsers.map(user => (
                    <div key={user.id} style={{
                      padding: '20px',
                      borderBottom: '1px solid #e5e7eb',
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                            {getRoleIcon(user.role)} {user.name}
                          </h4>
                          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '2px' }}>
                            {user.email}
                          </p>
                          <p style={{ color: '#6b7280', fontSize: '12px' }}>
                            @{user.username}
                          </p>
                        </div>
                        
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
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          <strong>Tenant:</strong> {user.tenant?.name || 'No tenant'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          <strong>Items:</strong> {user.itemCount || 0}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Last Login:</strong> {user.lastLogin || 'Never'}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {user.isActive ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            style={{
                              background: '#dcfce7',
                              color: '#166534',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
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
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'tenants' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Tenant Management ({allTenants.length} tenants)
                </h3>
                <button
                  onClick={() => setShowCreateTenant(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span>➕</span>
                  Create Tenant
                </button>
              </div>
              
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                {allTenants.map(tenant => (
                  <div key={tenant.id} style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    background: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        🏢 {tenant.name}
                      </h4>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                        {tenant.description}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '12px' }}>
                        Created: {new Date(tenant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'white',
                        background: tenant.isActive ? '#059669' : '#6b7280'
                      }}>
                        {tenant.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {tenant.isActive ? (
                          <button
                            onClick={() => handleTenantAction(tenant.id, 'deactivate')}
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTenantAction(tenant.id, 'activate')}
                            style={{
                              background: '#dcfce7',
                              color: '#166534',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedTenantForUsers(tenant)}
                          style={{
                            background: '#dbeafe',
                            color: '#2563eb',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginRight: '8px'
                          }}
                        >
                          👥 Manage Users
                        </button>
                        
                        <button
                          onClick={() => handleTenantAction(tenant.id, 'delete')}
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
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'system' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                System Administration
              </h3>
              
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    📊 System Statistics
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Users</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{allUsers.length}</p>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Tenants</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{allTenants.length}</p>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Active Users</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {allUsers.filter(u => u.isActive).length}
                      </p>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Active Tenants</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {allTenants.filter(t => t.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    ⚙️ System Actions
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      🔄 Refresh System Cache
                    </button>
                    <button style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      📊 Generate System Report
                    </button>
                    <button style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      🗑️ Cleanup Old Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Tenant Modal */}
      {showCreateTenant && (
        <CreateTenantModal
          onClose={() => setShowCreateTenant(false)}
          onSuccess={loadData}
        />
      )}

      {/* Tenant User Management Modal */}
      {selectedTenantForUsers && (
        <TenantUserManagement
          tenant={selectedTenantForUsers}
          onClose={() => setSelectedTenantForUsers(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  )
}
