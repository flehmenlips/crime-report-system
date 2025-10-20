'use client'

import React, { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'

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

  useEffect(() => {
    loadPlatformStats()
  }, [])

  const loadPlatformStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/platform-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        setError('Failed to load platform statistics')
      }
    } catch (error) {
      setError('Failed to load platform statistics')
      console.error('Error loading platform stats:', error)
    } finally {
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
          marginBottom: '32px',
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
      </div>
    </div>
  )
}