'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function UploadEvidencePage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  
  const [isMobile, setIsMobile] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [item, setItem] = useState<StolenItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication and load item
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

  // Load item
  useEffect(() => {
    if (!authenticated || !itemId) return

    const loadItem = async () => {
      try {
        const response = await fetch('/api/items')
        if (response.ok) {
          const data = await response.json()
          const foundItem = data.items.find((i: StolenItem) => i.id.toString() === itemId.toString())
          if (foundItem) {
            setItem(foundItem)
          } else {
            router.back()
          }
        }
      } catch (err) {
        console.error('Failed to load item:', err)
        router.back()
      }
    }
    loadItem()
  }, [authenticated, itemId, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setError('')
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('itemId', itemId)

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(interval)
      setUploadProgress(100)

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/item/${itemId}/evidence`)
        }, 1500)
      } else {
        const result = await response.json()
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || !item) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading...'}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            Upload Evidence
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
            {/* Success Message */}
            {success && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                color: '#059669',
                textAlign: 'center'
              }}>
                ✓ Evidence uploaded successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            {/* Item Info */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              padding: isMobile ? '20px' : '24px',
              borderRadius: '16px',
              color: 'white',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                margin: '0 0 4px 0'
              }}>
                {item.name}
              </h2>
              <p style={{
                fontSize: isMobile ? '14px' : '16px',
                margin: 0,
                opacity: 0.9
              }}>
                Upload photos, videos, or documents
              </p>
            </div>

            {/* File Upload Area */}
            <div
              style={{
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
                accept="image/*,video/*,.pdf,.doc,.docx"
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
                      <span style={{ color: '#1f2937', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
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
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
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
              setError('')
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
            disabled={uploading || files.length === 0 || success}
            style={{
              padding: '14px 24px',
              background: (uploading || files.length === 0 || success) 
                ? 'rgba(139, 92, 246, 0.7)' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (uploading || files.length === 0 || success) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              flex: isMobile ? 'none' : 2,
              opacity: (uploading || files.length === 0 || success) ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📤</span>
            <span>
              {uploading ? 'Uploading...' : success ? '✓ Uploaded!' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

