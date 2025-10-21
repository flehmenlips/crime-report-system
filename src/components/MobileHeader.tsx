'use client'

import { useState } from 'react'
import { User } from '@/types'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  user: User
  textColor: string
  textColorSecondary: string
  onViewModeChange?: (mode: 'cards' | 'list') => void
  currentViewMode?: 'cards' | 'list'
}

export function MobileHeader({ 
  user, 
  textColor, 
  textColorSecondary, 
  onViewModeChange,
  currentViewMode = 'cards'
}: MobileHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: 9999,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Left side - Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          🏠
        </div>
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            color: '#1f2937'
          }}>
            REMISE Asset Barn v2.0
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0
          }}>
            {user.tenant?.name || 'Property Management'}
          </p>
        </div>
      </div>

      {/* Right side - Hamburger Menu */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{
          width: '24px',
          height: '3px',
          background: '#374151',
          borderRadius: '2px',
          transition: 'all 0.3s ease'
        }} />
        <div style={{
          width: '24px',
          height: '3px',
          background: '#374151',
          borderRadius: '2px',
          transition: 'all 0.3s ease'
        }} />
        <div style={{
          width: '24px',
          height: '3px',
          background: '#374151',
          borderRadius: '2px',
          transition: 'all 0.3s ease'
        }} />
      </button>


      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998
            }}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel - Full Width */}
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'white',
            zIndex: 9999,
            padding: '0',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100vw'
          }}>
            {/* Header with Close Button */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 20px',
              borderBottom: 'none',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0
                }}>
                  🏠 REMISE
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{
                fontSize: '14px',
                margin: 0,
                opacity: 0.9
              }}>
                Property Management System
              </p>
            </div>


            {/* Content Area */}
            <div style={{ padding: '20px', flex: 1 }}>
              {/* User Profile Section */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: user.role === 'property_owner'
                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                    : user.role === 'law_enforcement'
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {user.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {user.role === 'property_owner' ? 'Property Owner' : 
                     user.role === 'law_enforcement' ? 'Law Enforcement' : 
                     user.role === 'insurance_agent' ? 'Insurance Agent' : 
                     user.role === 'banker' ? 'Banker' : 'User'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '4px 0 0 0'
                  }}>
                    Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/profile')
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
              
              {user.tenant && (
                <div style={{
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 8px 0'
                  }}>
                    Property Information
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 4px 0'
                  }}>
                    <strong>Property:</strong> {user.tenant.name}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 4px 0'
                  }}>
                    <strong>Address:</strong> {(user.tenant as any).address || 'Not specified'}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    <strong>Status:</strong> <span style={{ color: '#10b981' }}>● Active</span>
                  </p>
                </div>
              )}
            </div>


            {/* Quick Actions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚡</span>Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/search')
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  <span>Advanced Search</span>
                </button>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/analytics')
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📊</span>
                  <span>View Analytics</span>
                </button>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/reports')
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <span>Generate Report</span>
                </button>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/upload')
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📤</span>
                  <span>Bulk Upload</span>
                </button>
                {user.role === 'property_owner' && (
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      transition: 'transform 0.2s ease'
                    }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    router.push('/my-property')
                  }}
                  >
                    <span style={{ fontSize: '20px' }}>🏢</span>
                    <span>Manage Property</span>
                  </button>
                )}
              </div>
            </div>

            </div>
            
            {/* Logout */}
            <button
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '18px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: 'calc(100% - 40px)',
                margin: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/login-simple'
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

    </div>
  )
}
