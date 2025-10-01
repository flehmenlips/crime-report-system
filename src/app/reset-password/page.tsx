'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [email, setEmail] = useState('')
  const [isInvitationSetup, setIsInvitationSetup] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setError('No reset token provided')
      return
    }

    // Verify token is valid
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTokenValid(true)
          setEmail(data.email)
          // Check if this is an invitation setup (user has temp password)
          setIsInvitationSetup(data.isInvitationSetup || false)
        } else {
          setError(data.error || 'Invalid or expired reset token')
        }
      })
      .catch(error => {
        console.error('Token verification error:', error)
        setError('Failed to verify reset token')
      })
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const token = searchParams.get('token')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        if (isInvitationSetup) {
          setMessage('Password set successfully! Welcome to Crime Report System. Redirecting to login...')
        } else {
          setMessage('Password reset successfully! Redirecting to login...')
        }
        setTimeout(() => {
          router.push('/login-simple')
        }, 2000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid && !error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Verifying Reset Token...
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Please wait while we verify your password reset request.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isInvitationSetup ? 'Set Up Your Password' : 'Reset Password'}
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            {isInvitationSetup 
              ? `Welcome! Set up your password to complete your account setup for ${email}`
              : email && `Enter a new password for ${email}`
            }
          </p>
        </div>

        {message && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            color: '#065f46'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {tokenValid && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your new password"
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#3b82f6'
                  target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  target.style.background = 'white'
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#e5e7eb'
                  target.style.boxShadow = 'none'
                  target.style.background = '#f9fafb'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your new password"
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#3b82f6'
                  target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  target.style.background = 'white'
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#e5e7eb'
                  target.style.boxShadow = 'none'
                  target.style.background = '#f9fafb'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '20px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  const target = e.target as HTMLButtonElement
                  target.style.transform = 'translateY(-2px)'
                  target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to Login
          </button>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Loading...
          </h1>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
