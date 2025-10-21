'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function UploadPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          setAuthenticated(true)
        } else {
          router.push('/login-simple')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login-simple')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // TODO: Implement actual bulk upload
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      alert('Upload complete! (Full implementation coming soon)')
      setUploading(false)
      setFiles([])
    }, 2500)
  }

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Checking authentication...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      paddingBottom: isMobile ? '140px' : '48px'
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
            Bulk Upload
          </h1>
        </div>
      </div>

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
            padding: isMobile ? '24px 16px' : '32px'
          }}>
            {/* Upload Info */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: isMobile ? '20px' : '24px',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid #fbbf24'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e',
                margin: '0 0 12px 0'
              }}>
                📤 Bulk Upload Instructions
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#78350f',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: '1.8'
              }}>
                <li>Select multiple images or CSV files</li>
                <li>Images will be processed for evidence</li>
                <li>CSV files will create new items</li>
                <li>Maximum 50 files per upload</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div style={{
              border: '2px dashed #e5e7eb',
              borderRadius: '16px',
              padding: isMobile ? '40px 20px' : '60px 40px',
              textAlign: 'center',
              marginBottom: '24px',
              background: '#fafafa',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-input')?.click()}
            >
              <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📁</span>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Click to select files
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                or drag and drop files here
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div style={{
                background: '#f9fafb',
                padding: isMobile ? '16px' : '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  📎 Selected Files ({files.length})
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <span style={{ color: '#1f2937' }}>{file.name}</span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div style={{
                background: '#f9fafb',
                padding: isMobile ? '20px' : '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Uploading... {uploadProgress}%
                </div>
                <div style={{
                  height: '12px',
                  background: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
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
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={() => {
              setFiles([])
              setUploadProgress(0)
            }}
            disabled={uploading}
            style={{
              padding: '14px 24px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              flex: isMobile ? 'none' : 1,
              opacity: uploading ? 0.5 : 1
            }}
          >
            Clear Files
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            style={{
              padding: '14px 24px',
              background: (uploading || files.length === 0) ? 'rgba(245, 158, 11, 0.7)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (uploading || files.length === 0) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              flex: isMobile ? 'none' : 2,
              opacity: (uploading || files.length === 0) ? 0.7 : 1
            }}
          >
            {uploading ? '📤 Uploading...' : `📤 Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

