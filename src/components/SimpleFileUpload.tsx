'use client'

import { useState, useRef } from 'react'
import { StolenItem } from '@/types'

interface SimpleFileUploadProps {
  item: StolenItem
  onClose: () => void
  onSuccess: () => void
}

export function SimpleFileUpload({ item, onClose, onSuccess }: SimpleFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const results: string[] = []
    const progressMap: { [key: string]: number } = {}

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `${file.name}-${i}`
      
      try {
        console.log('Uploading file:', file.name)
        
        // Initialize progress
        progressMap[fileKey] = 0
        setUploadProgress({ ...progressMap })
        
        // Determine file type
        let evidenceType = 'document'
        if (file.type.startsWith('image/')) evidenceType = 'photo'
        else if (file.type.startsWith('video/')) evidenceType = 'video'

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('itemId', item.id.toString())
        formData.append('type', evidenceType)

        // Simulate progress for user feedback
        const progressInterval = setInterval(() => {
          progressMap[fileKey] = Math.min(progressMap[fileKey] + 10, 90)
          setUploadProgress({ ...progressMap })
        }, 100)

        // Upload file
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)
        progressMap[fileKey] = 100
        setUploadProgress({ ...progressMap })

        const result = await response.json()
        
        if (response.ok) {
          results.push(`✅ ${file.name} uploaded successfully (${evidenceType})`)
          console.log('Upload successful:', result)
        } else {
          results.push(`❌ ${file.name} failed: ${result.error}`)
          console.error('Upload failed:', result)
        }
        
      } catch (error) {
        results.push(`❌ ${file.name} failed: ${error}`)
        console.error('Upload error:', error)
        progressMap[fileKey] = 0
        setUploadProgress({ ...progressMap })
      }
    }

    setUploadResults(results)
    setUploading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {/* Modern Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
            opacity: 0.1
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                📸
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0' }}>
                  Upload Evidence
                </h2>
                <p style={{ 
                  margin: 0, 
                  opacity: 0.9, 
                  fontSize: '16px',
                  fontWeight: '500',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  {item.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '32px',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto'
        }}>
          {!uploading && uploadResults.length === 0 && (
            <div>
              {/* Drag & Drop Area */}
              <div
                style={{
                  border: dragActive 
                    ? '3px dashed #6366f1' 
                    : '2px dashed #d1d5db',
                  borderRadius: '20px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  marginBottom: '32px',
                  background: dragActive 
                    ? 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' 
                    : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onMouseOver={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = '#9ca3af'
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseOut={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.background = '#fafafa'
                  }
                }}
              >
                <div style={{ fontSize: '72px', marginBottom: '16px' }}>
                  {dragActive ? '📤' : '📁'}
                </div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  {dragActive ? 'Drop files here!' : 'Upload Evidence Files'}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '24px',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  margin: '0 0 24px 0'
                }}>
                  {dragActive 
                    ? 'Release to upload files' 
                    : 'Drag and drop files here, or click to browse'
                  }
                </p>
                <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.4' }}>
                  <p style={{ margin: '0 0 4px 0' }}>Supported: Photos (JPG, PNG), Videos (MP4, MOV), Documents (PDF, DOC)</p>
                  <p style={{ margin: 0 }}>Max file size: 50MB per file</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                style={{ display: 'none' }}
              />

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px', fontWeight: '500' }}>
                  Or choose specific file types:
                </p>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*'
                      fileInputRef.current.click()
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>📷</span>
                  Upload Photos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'video/*'
                      fileInputRef.current.click()
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🎥</span>
                  Upload Videos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.pdf,.doc,.docx,.txt'
                      fileInputRef.current.click()
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>📄</span>
                  Upload Documents
                </button>
              </div>

              <div style={{
                marginTop: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '16px'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#1e40af', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  Supported File Types
                </h4>
                <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>📷 Photos:</strong> JPG, PNG, HEIC, WebP, GIF
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>🎥 Videos:</strong> MP4, MOV, AVI, WebM, MKV
                  </div>
                  <div>
                    <strong>📄 Documents:</strong> PDF, Word (DOC/DOCX), Text files
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploading && (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px'
                }}></div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Uploading Files...
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                  Processing your evidence files
                </p>
              </div>
              
              {/* Progress Bars */}
              <div style={{ textAlign: 'left' }}>
                {Object.entries(uploadProgress).map(([fileKey, progress]) => (
                  <div key={fileKey} style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px' 
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        {fileKey.split('-')[0]}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        background: '#f3f4f6',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        {progress}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      background: '#e5e7eb', 
                      borderRadius: '8px', 
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        width: `${progress}%`
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadResults.length > 0 && (
            <div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '24px',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '28px' }}>📊</span>
                Upload Results
              </h3>
              <div style={{ marginBottom: '32px' }}>
                {uploadResults.map((result, index) => (
                  <div key={index} style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    ...(result.startsWith('✅') 
                      ? {
                          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                          color: '#166534',
                          border: '1px solid #22c55e'
                        }
                      : {
                          background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                          color: '#dc2626',
                          border: '1px solid #ef4444'
                        })
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {result.startsWith('✅') ? '✅' : '❌'}
                    </span>
                    <span>{result.substring(2)}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => {
                    setUploadResults([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(107, 114, 128, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)'
                  }}
                >
                  Upload More Files
                </button>
                <button
                  onClick={() => {
                    onSuccess()
                    onClose()
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ✅ Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
