'use client'

import { useState } from 'react'
import { User } from '@/types'

interface MobileHeaderProps {
  user: User
  textColor: string
  textColorSecondary: string
  onProfileUpdate: (updatedUser: User) => void
}

export function MobileHeader({ user, textColor, textColorSecondary, onProfileUpdate }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: 1000,
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
            REMISE Asset Barn
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
              zIndex: 1001
            }}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '280px',
            height: '100vh',
            background: 'white',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1002,
            padding: '20px',
            overflowY: 'auto'
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
                <div>
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
                </div>
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
                    textAlign: 'left'
                  }}
                  onClick={() => setIsMenuOpen(false)}
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
                    textAlign: 'left'
                  }}
                  onClick={() => setIsMenuOpen(false)}
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
                      textAlign: 'left'
                    }}
                    onClick={() => setIsMenuOpen(false)}
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
    </div>
  )
}
