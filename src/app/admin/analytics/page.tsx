'use client'

import React, { useState, useEffect } from 'react'

interface AnalyticsData {
  platformStats: {
    totalUsers: number
    totalTenants: number
    activeUsers: number
    newUsersThisWeek: number
    totalItems: number
    totalEvidence: number
  }
  userGrowth: Array<{
    date: string
    users: number
  }>
  tenantStats: Array<{
    tenantName: string
    userCount: number
    itemCount: number
    evidenceCount: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError('Failed to load analytics')
      }
    } catch (error) {
      setError('Failed to load analytics')
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
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
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '16px'
              }}
            >
              ← Back
            </button>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
              display: 'inline'
            }}>
              📈 Platform Analytics
            </h1>
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

        {analytics && (
          <>
            {/* Platform Statistics */}
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
                  {analytics.platformStats.totalUsers}
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
                  {analytics.platformStats.totalTenants}
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
                  {analytics.platformStats.activeUsers}
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
                  {analytics.platformStats.newUsersThisWeek}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  New Users This Week
                </div>
              </div>
            </div>

            {/* Data Overview */}
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
                    {analytics.platformStats.totalItems}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Total Items
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                    {analytics.platformStats.totalEvidence}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Total Evidence Files
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Statistics */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                🏢 Tenant Statistics
              </h3>
              
              {analytics.tenantStats.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: '#6b7280'
                }}>
                  No tenant data available
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '12px'
                }}>
                  {analytics.tenantStats.map((tenant, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '16px',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {tenant.tenantName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6' }}>
                          {tenant.userCount}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Users
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                          {tenant.itemCount}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Items
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                          {tenant.evidenceCount}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Evidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
