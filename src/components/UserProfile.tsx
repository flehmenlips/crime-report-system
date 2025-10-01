'use client'

import { useState, useEffect } from 'react'
import { User, getRoleDisplayName, canReadAll, canWriteAll, canManageUsers, canAccessAdmin, getRoleIcon, getRoleColor, isStakeholder, isPropertyOwner } from '@/lib/auth'
import { UserProfileManagement } from './UserProfileManagement'

interface UserProfileProps {
  className?: string
  showDetails?: boolean
  onProfileUpdate?: (updatedUser: User) => void
}

export function UserProfile({ className = '', showDetails = true, onProfileUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProfileManagement, setShowProfileManagement] = useState(false)

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  if (!user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-400 rounded animate-pulse w-24"></div>
          <div className="h-3 bg-gray-400 rounded animate-pulse w-16"></div>
        </div>
      </div>
    )
  }

  // Enhanced tenant and access information
  const tenantInfo = user.tenant ? {
    name: user.tenant.name,
    description: user.tenant.description || 'No description available',
    isActive: user.tenant.isActive
  } : null

  const accessLevelInfo = user.accessLevel ? {
    level: user.accessLevel,
    displayName: user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1).replace('_', ' ')
  } : null

  const permissions = [
    ...(canReadAll(user) ? ['Read All Data'] : []),
    ...(canWriteAll(user) ? ['Write All Data'] : []),
    ...(canManageUsers(user) ? ['Manage Users'] : []),
    ...(canAccessAdmin(user) ? ['Admin Access'] : [])
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Compact Profile Display */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          opacity: isExpanded ? 0.7 : 1
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          background: user.role === 'property_owner' 
            ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
            : user.role === 'law_enforcement'
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <span style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {showDetails && !isExpanded && (
          <div style={{
            flex: 1,
            minWidth: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <p style={{
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.name}
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        )}
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
      </div>

      {/* Expanded Profile Details */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
          <div className="p-6">
            {/* Header - Modern, clean design */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{
                fontWeight: 'bold',
                color: '#111827',
                fontSize: '20px',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {user.name}
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                {getRoleDisplayName(user.role)}
              </p>
            </div>

            {/* User Details - Modern Card Design */}
            <div className="space-y-4">
              {/* Quick Actions Card - MOVED TO TOP */}
              <div style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#6b7280',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}></span>
                  Quick Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => setShowProfileManagement(true)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: '1px solid #93c5fd',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#bfdbfe'
                      e.currentTarget.style.borderColor = '#60a5fa'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe'
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>⚙️</span>
                    Manage Profile
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setIsExpanded(false)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: 'white',
                        color: '#374151',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                        e.currentTarget.style.borderColor = '#9ca3af'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                        e.currentTarget.style.borderColor = '#d1d5db'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      Close
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { method: 'POST' })
                          window.location.href = '/login-simple'
                        } catch (error) {
                          console.error('Logout failed:', error)
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2'
                        e.currentTarget.style.borderColor = '#fca5a5'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2'
                        e.currentTarget.style.borderColor = '#fecaca'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #dbeafe',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}></span>
                  Account Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Email: </span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{user.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>User ID: </span>
                    <span style={{ 
                      color: '#111827', 
                      fontFamily: 'monospace', 
                      fontSize: '12px', 
                      backgroundColor: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      border: '1px solid #e5e7eb' 
                    }}>{user.id}</span>
                  </div>
                  {accessLevelInfo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Access Level: </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid',
                        ...(accessLevelInfo.level === 'owner' ? {
                          backgroundColor: '#f3e8ff',
                          color: '#6b21a8',
                          borderColor: '#d8b4fe'
                        } : accessLevelInfo.level === 'staff' ? {
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          borderColor: '#93c5fd'
                        } : accessLevelInfo.level === 'stakeholder' ? {
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderColor: '#86efac'
                        } : {
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderColor: '#d1d5db'
                        })
                      }}>
                        {accessLevelInfo.displayName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant Information Card */}
              {tenantInfo && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #bbf7d0',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#111827',
                    fontSize: '14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#22c55e',
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}></span>
                    Tenant Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Property: </span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{tenantInfo.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Status: </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid',
                        ...(tenantInfo.isActive ? {
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderColor: '#86efac'
                        } : {
                          backgroundColor: '#fef2f2',
                          color: '#991b1b',
                          borderColor: '#fecaca'
                        })
                      }}>
                        {tenantInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {tenantInfo.description && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Description: </span>
                        <span style={{ 
                          color: '#374151', 
                          fontSize: '12px', 
                          lineHeight: '1.5', 
                          backgroundColor: 'white', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: '1px solid #bbf7d0',
                          display: 'block'
                        }}>{tenantInfo.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Access Type Card */}
              <div style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e9d5ff',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}></span>
                  Access Type
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isPropertyOwner(user) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500' }}>Property Owner</span>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Full control over your property data</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>Stakeholder Access</span>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Controlled access to property data</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Card */}
              {permissions.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #fed7aa',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#111827',
                    fontSize: '14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#f97316',
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}></span>
                    Permissions
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {permissions.map((permission, index) => (
                      <span 
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: 'white',
                          color: '#ea580c',
                          border: '1px solid #fed7aa',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      {showProfileManagement && (
        <UserProfileManagement
          user={user}
          onClose={() => setShowProfileManagement(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}
