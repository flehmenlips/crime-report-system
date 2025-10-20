'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accountInfo, setAccountInfo] = useState<{
    email: string
    name: string
    role: string
  } | null>(null)

  useEffect(() => {
    // Get account info from URL params or localStorage
    const email = searchParams.get('email') || localStorage.getItem('newAccountEmail')
    const name = searchParams.get('name') || localStorage.getItem('newAccountName')
    const role = searchParams.get('role') || localStorage.getItem('newAccountRole')
    
    if (email && name && role) {
      setAccountInfo({ email, name, role })
    }
  }, [searchParams])

  const handleLoginRedirect = () => {
    router.push('/login-simple')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px auto',
          fontSize: '40px'
        }}>
          ✅
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Account Created Successfully!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Your REMISE Asset Barn account has been created and is ready to use.
        </p>

        {/* Account Information */}
        {accountInfo && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #22c55e',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#15803d',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Account Details
            </h3>
            
            <div style={{
              fontSize: '14px',
              color: '#166534',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Name:</strong> {accountInfo.name}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Email:</strong> {accountInfo.email}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Username:</strong> {accountInfo.email}
              </div>
              <div>
                <strong>Role:</strong> {accountInfo.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Notice */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0c4a6e',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📧 Email Verification
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: '#075985',
            marginBottom: '16px'
          }}>
            We've sent a verification email to your registered email address.
          </p>

          <div style={{
            background: '#e0f2fe',
            border: '1px solid #0891b2',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0c4a6e',
              marginBottom: '8px'
            }}>
              📋 Next Steps:
            </h4>
            <ol style={{
              fontSize: '14px',
              color: '#075985',
              margin: 0,
              paddingLeft: '20px',
              lineHeight: '1.5'
            }}>
              <li>Check your email inbox for the verification email</li>
              <li>Click the verification link in the email</li>
              <li>Return here and click "Continue to Login" below</li>
            </ol>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#92400e',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>
                <strong>Don't see the email?</strong> Check your spam/junk folder. 
                If you still don't receive it within 10 minutes, please contact support.
              </span>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔒 Security Information
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Your account is protected with enterprise-grade security. All data is encrypted 
            and access is logged for audit purposes. This system meets CJIS compliance 
            standards for law enforcement use.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Continue to Login Button */}
          <button
            onClick={handleLoginRedirect}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)'
            }}
          >
            Continue to Login
          </button>

          {/* Property Setup Button - Disabled until verified */}
          <button
            onClick={() => window.location.href = '/property-onboarding'}
            disabled={true}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: '#e5e7eb',
              color: '#9ca3af',
              fontSize: '18px',
              fontWeight: '600',
              borderRadius: '16px',
              border: 'none',
              cursor: 'not-allowed',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            title="Complete email verification first"
          >
            Set Up My Property
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              fontSize: '12px',
              background: '#f59e0b',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              Verify Email First
            </div>
          </button>
        </div>

        {/* Help Text */}
        <p style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginTop: '24px',
          margin: '24px 0 0 0'
        }}>
          Need help? Contact support at{' '}
          <a 
            href="mailto:support@remise.farm" 
            style={{ 
              color: '#2563eb', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            support@remise.farm
          </a>
        </p>

        {/* Skip Option */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px'
        }}>
          <button
            type="button"
            onClick={() => window.location.href = '/login-simple'}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip property setup for now
          </button>
        </div>
      </div>
    </div>
  )
}
