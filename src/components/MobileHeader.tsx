'use client'

import { useState } from 'react'
import { User } from '@/types'
import { UserProfileManagement } from '@/components/UserProfileManagement'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  user: User
  textColor: string
  textColorSecondary: string
  onProfileUpdate: (updatedUser: User) => void
  onAnalyticsClick?: () => void
  onReportClick?: () => void
  onPropertyClick?: () => void
  onViewModeChange?: (mode: 'cards' | 'list') => void
  currentViewMode?: 'cards' | 'list'
}

export function MobileHeader({ 
  user, 
  textColor, 
  textColorSecondary, 
  onProfileUpdate,
  onAnalyticsClick,
  onReportClick,
  onPropertyClick,
  onViewModeChange,
  currentViewMode = 'cards'
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)

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
        onClick={() => {
          console.log('Menu clicked, current state:', isMenuOpen)
          setIsMenuOpen(!isMenuOpen)
        }}
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

      {/* Debug: Menu State */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '50px',
          left: '10px',
          background: 'red',
          color: 'white',
          padding: '5px',
          zIndex: 10000,
          fontSize: '12px'
        }}>
          Menu is OPEN - isMenuOpen: {isMenuOpen.toString()}
        </div>
      )}

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
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100vw'
          }}>
            {/* Close Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Menu
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Debug Test Content */}
            <div style={{
              background: 'red',
              color: 'white',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}>
              DEBUG: Menu content is rendering!
            </div>

            {/* User Profile Section */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
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
                  onClick={() => setShowProfileEdit(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
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

            {/* View Mode Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                View Mode
              </h3>
              <div style={{ 
                display: 'flex', 
                background: '#f3f4f6', 
                borderRadius: '12px', 
                padding: '4px'
              }}>
                <button
                  onClick={() => {
                    onViewModeChange?.('cards')
                    setIsMenuOpen(false)
                  }}
                  style={{
                    background: currentViewMode === 'cards' ? '#3b82f6' : 'transparent',
                    color: currentViewMode === 'cards' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    justifyContent: 'center'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => {
                    onViewModeChange?.('list')
                    setIsMenuOpen(false)
                  }}
                  style={{
                    background: currentViewMode === 'list' ? '#3b82f6' : 'transparent',
                    color: currentViewMode === 'list' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    justifyContent: 'center'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    onAnalyticsClick?.()
                    setIsMenuOpen(false)
                  }}
                >
                  📊 View Analytics
                </button>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    onReportClick?.()
                    setIsMenuOpen(false)
                  }}
                >
                  📄 Generate Report
                </button>
                {user.role === 'property_owner' && (
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => {
                      onPropertyClick?.()
                      setIsMenuOpen(false)
                    }}
                  >
                    🏢 Manage Property
                  </button>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
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
              🚪 Logout
            </button>
          </div>
        </>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                Edit Profile
              </h2>
              <button
                onClick={() => setShowProfileEdit(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <UserProfileManagement
              user={user}
              onProfileUpdate={(updatedUser) => {
                onProfileUpdate(updatedUser)
                setShowProfileEdit(false)
              }}
              onClose={() => setShowProfileEdit(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
