'use client'

import React, { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { SuperAdminProfileEditModal } from './SuperAdminProfileEditModal'
import { SuperAdminAuditLog } from './SuperAdminAuditLog'

interface SuperAdminDashboardProps {
  currentUser: User | null
  onClose?: () => void
}

interface PlatformStats {
  totalUsers: number
  totalTenants: number
  activeUsers: number
  newUsersThisWeek: number
  totalItems: number
  totalEvidence: number
}

export function SuperAdminDashboard({ currentUser, onClose }: SuperAdminDashboardProps) {
  const isModal = onClose !== undefined && onClose !== null
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showProfileEditModal, setShowProfileEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'audit-log'>('overview')

  useEffect(() => {
    loadPlatformStats()
  }, [])

  const loadPlatformStats = async () => {
    try {
      console.log('SuperAdminDashboard: Starting to load platform stats...')
      setLoading(true)
      const response = await fetch('/api/admin/platform-stats')
      console.log('SuperAdminDashboard: API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('SuperAdminDashboard: Loaded platform stats:', data.stats)
        setStats(data.stats)
      } else {
        // Don't show error for authentication issues - just show default stats
        console.log('SuperAdminDashboard: Platform stats API not accessible, using default values')
        setStats({
          totalUsers: 0,
          totalTenants: 0,
          activeUsers: 0,
          newUsersThisWeek: 0,
          totalItems: 0,
          totalEvidence: 0
        })
      }
    } catch (error) {
      // Don't show error for network issues - just show default stats
      console.log('SuperAdminDashboard: Platform stats API not accessible, using default values')
      setStats({
        totalUsers: 0,
        totalTenants: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        totalItems: 0,
        totalEvidence: 0
      })
    } finally {
      console.log('SuperAdminDashboard: Setting loading to false')
      setLoading(false)
    }
  }

  const handleManageTenants = () => {
    window.location.href = '/tenant-management'
  }

  const handleManageUsers = () => {
    window.location.href = '/admin/users'
  }

  const handleViewAnalytics = () => {
    window.location.href = '/admin/analytics'
  }

  const handleProfileSave = (updatedUser: Partial<User>) => {
    // Update the current user data
    if (currentUser) {
      Object.assign(currentUser, updatedUser)
    }
    setShowProfileEditModal(false)
  }

  if (loading) {
    const containerStyle = isModal ? {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    } : {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px'
    }

    return (
      <div style={containerStyle}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading platform statistics...</div>
        </div>
      </div>
    )
  }

  const outerContainerStyle = isModal ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  } : {}

  const innerContainerStyle = isModal ? {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
  } : {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div style={outerContainerStyle}>
      <div style={innerContainerStyle}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              🛡️ Platform Administration
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0
            }}>
              Manage platform users, tenants, and system analytics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  if (response.ok) {
                    window.location.href = '/login-simple';
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                  window.location.href = '/login-simple';
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '32px',
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: activeTab === 'overview' ? 'white' : 'transparent',
              color: activeTab === 'overview' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: activeTab === 'overview' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('audit-log')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: activeTab === 'audit-log' ? 'white' : 'transparent',
              color: activeTab === 'audit-log' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit-log' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            📋 Audit Log
          </button>
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

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            {/* SuperAdmin Profile Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👤 SuperAdmin Profile
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0
              }}>
                Manage your platform administrator account and credentials
              </p>
            </div>
            <button
              onClick={() => setShowProfileEditModal(true)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Profile Information Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Account Information */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔐 Account Information
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Full Name
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {currentUser?.name || 'Not specified'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Username
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {currentUser?.username || 'Not specified'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email Address
                </label>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {currentUser?.email || 'Not specified'}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Account Status
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentUser?.isActive ? '#059669' : '#dc2626',
                  padding: '6px 12px',
                  background: currentUser?.isActive ? '#d1fae5' : '#fee2e2',
                  borderRadius: '20px',
                  border: `1px solid ${currentUser?.isActive ? '#a7f3d0' : '#fecaca'}`
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentUser?.isActive ? '#059669' : '#dc2626'
                  }}></div>
                  {currentUser?.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {/* Role & Privileges */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🛡️ Role & Privileges
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Role
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#dc2626',
                  padding: '8px 16px',
                  background: '#fef2f2',
                  borderRadius: '20px',
                  border: '1px solid #fecaca'
                }}>
                  <span style={{ fontSize: '16px' }}>👑</span>
                  Super Administrator
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Platform Access Level
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa'
                }}>
                  Full Platform Access
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Administrative Privileges
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['User Management', 'Tenant Management', 'Platform Analytics', 'System Configuration'].map((privilege) => (
                    <div
                      key={privilege}
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#059669',
                        padding: '4px 8px',
                        background: '#d1fae5',
                        borderRadius: '12px',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      ✅ {privilege}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Security Level
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f3e8ff',
                  borderRadius: '8px',
                  border: '1px solid #e9d5ff'
                }}>
                  🔒 CJIS Compliant
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📋 Account Details
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Account Created
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not available'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Last Updated
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not available'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email Verification
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentUser?.emailVerified ? '#059669' : '#dc2626',
                  padding: '6px 12px',
                  background: currentUser?.emailVerified ? '#d1fae5' : '#fee2e2',
                  borderRadius: '20px',
                  border: `1px solid ${currentUser?.emailVerified ? '#a7f3d0' : '#fecaca'}`
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentUser?.emailVerified ? '#059669' : '#dc2626'
                  }}></div>
                  {currentUser?.emailVerified ? 'Verified' : 'Not Verified'}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Tenant Assignment
                </label>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  SuperAdmin Platform
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Statistics */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Users
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {stats.totalTenants}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Tenants
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {stats.activeUsers}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Active Users
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {stats.newUsersThisWeek}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                New Users This Week
              </div>
            </div>
          </div>
        )}

        {/* Platform Data Overview */}
        {stats && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📊 Platform Data Overview
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                  {stats.totalItems}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Total Items
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                  {stats.totalEvidence}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Total Evidence Files
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Management Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Tenant Management */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '24px'
            }}>
              🏢
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Tenant Management
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Create, edit, and manage tenant properties
            </p>
            <button
              onClick={handleManageTenants}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Manage Tenants
            </button>
          </div>

          {/* User Management */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '24px'
            }}>
              👥
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              User Management
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Create, edit, and manage platform users
            </p>
            <button
              onClick={handleManageUsers}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Manage Users
            </button>
          </div>

          {/* Platform Analytics */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '24px'
            }}>
              📈
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Platform Analytics
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              View platform usage and performance metrics
            </p>
            <button
              onClick={handleViewAnalytics}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View Analytics
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <strong style={{ color: '#92400e', fontSize: '14px' }}>
              Platform Administration Access
            </strong>
          </div>
          <p style={{
            color: '#92400e',
            fontSize: '13px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            You have full platform administration access. All actions are logged for audit purposes. 
            Use this access responsibly and in accordance with platform policies.
          </p>
          </div>
          </>
        ) : (
          <SuperAdminAuditLog currentUser={currentUser} />
        )}

        {/* Profile Edit Modal */}
        <SuperAdminProfileEditModal
          currentUser={currentUser}
          isOpen={showProfileEditModal}
          onClose={() => setShowProfileEditModal(false)}
          onSave={handleProfileSave}
        />
      </div>
    </div>
  )
}