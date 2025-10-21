'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface MobilePageTemplateProps {
  title: string
  subtitle?: string
  showGradientHeader?: boolean
  headerIcon?: string
  children: ReactNode
  isMobile?: boolean
  footer?: ReactNode
}

export function MobilePageTemplate({
  title,
  subtitle,
  showGradientHeader = false,
  headerIcon,
  children,
  isMobile = true,
  footer
}: MobilePageTemplateProps) {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: isMobile ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb',
      paddingBottom: isMobile ? '0' : '48px'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Optional Gradient Header Section */}
      {showGradientHeader && (
        <div style={{
          padding: isMobile ? '24px 16px' : '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {headerIcon && (
              <div style={{
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '32px' : '40px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}>
                {headerIcon}
              </div>
            )}
            <div>
              <h2 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '700',
                margin: '0 0 4px 0'
              }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0',
                  opacity: 0.9
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px 16px 100px' : '32px',
            minHeight: isMobile ? 'calc(100vh - 200px)' : 'auto'
          }}>
            {children}
          </div>
        </div>
      </div>

      {/* Optional Footer */}
      {footer && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: isMobile ? '16px' : '20px 32px',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 100
        }}>
          <div style={{
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto'
          }}>
            {footer}
          </div>
        </div>
      )}
    </div>
  )
}

