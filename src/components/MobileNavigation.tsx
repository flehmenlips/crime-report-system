'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'

interface MobileNavigationProps {
  user: User | null
  onMenuToggle: () => void
  onAction: (action: string) => void
  canAddItems: boolean
  canBulkUpload: boolean
  canGenerateReports: boolean
  canAccessAdminFeatures: boolean
}

export function MobileNavigation({ 
  user, 
  onMenuToggle, 
  onAction, 
  canAddItems, 
  canBulkUpload, 
  canGenerateReports, 
  canAccessAdminFeatures 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    onMenuToggle()
  }

  const handleAction = (action: string) => {
    onAction(action)
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <>
      {/* Mobile Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: isScrolled 
          ? 'rgba(15, 23, 42, 0.95)' 
          : 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        {/* Logo/Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            🚔
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              lineHeight: 1
            }}>
              Crime Report
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1
            }}>
              {user.name}
            </div>
          </div>
        </div>

        {/* Menu Toggle */}
        <button
          onClick={toggleMenu}
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'white'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around'
          }}>
            <div style={{
              width: '100%',
              height: '2px',
              background: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></div>
            <div style={{
              width: '100%',
              height: '2px',
              background: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              opacity: isOpen ? 0 : 1
            }}></div>
            <div style={{
              width: '100%',
              height: '2px',
              background: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></div>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setIsOpen(false)}>
          {/* Menu Panel */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '280px',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '80px 24px 24px',
            overflowY: 'auto',
            animation: 'slideInRight 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            {/* User Info */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {user.role === 'law_enforcement' ? '🚔' : 
                   user.role === 'property_owner' ? '🏠' : '👤'}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Quick Actions
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {canAddItems && (
                  <button
                    onClick={() => handleAction('add')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                      color: '#3b82f6',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>➕</span>
                    Add New Item
                  </button>
                )}

                {canBulkUpload && (
                  <button
                    onClick={() => handleAction('bulk')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '12px',
                      color: '#d97706',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📤</span>
                    Bulk Upload
                  </button>
                )}

                {canGenerateReports && (
                  <button
                    onClick={() => handleAction('reports')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      color: '#059669',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📊</span>
                    Generate Reports
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Navigation
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { action: 'search', label: 'Advanced Search', icon: '🔍' },
                  { action: 'analytics', label: 'Analytics', icon: '📈' },
                  { action: 'export', label: 'Export Data', icon: '📤' },
                  { action: 'profile', label: 'Profile Settings', icon: '👤' }
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleAction(item.action)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)'
                      e.currentTarget.style.color = '#374151'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#6b7280'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => handleAction('logout')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left',
                marginTop: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <span style={{ fontSize: '18px' }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
