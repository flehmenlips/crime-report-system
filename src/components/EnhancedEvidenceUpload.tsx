'use client'

import { useState, useRef, useCallback } from 'react'
import { StolenItem, Evidence } from '@/types'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  evidenceType: 'photo' | 'video' | 'document'
  preview?: string
}

interface EnhancedEvidenceUploadProps {
  item: StolenItem
  onClose: () => void
  onSuccess: (evidence: Evidence[]) => void
}

export function EnhancedEvidenceUpload({ item, onClose, onSuccess }: EnhancedEvidenceUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Generate preview for images
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve('')
      }
    })
  }

  // Determine evidence type from file
  const getEvidenceType = (file: File): 'photo' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'photo'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      // Only set dragActive to false if we're leaving the drop zone
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
        setDragActive(false)
      }
    }
  }, [])

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
    }
  }, [])

  // Handle file input change
  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processFiles(files)
    }
  }, [])

  // Process and validate files
  const processFiles = async (files: File[]) => {
    const newUploadFiles: UploadFile[] = []
    
    for (const file of files) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        newUploadFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'error',
          error: 'File too large (max 50MB)',
          evidenceType: getEvidenceType(file)
        })
        continue
      }

      // Validate file type
      const evidenceType = getEvidenceType(file)
      const allowedTypes = {
        photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      }

      if (!allowedTypes[evidenceType].includes(file.type)) {
        newUploadFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'error',
          error: `Unsupported file type: ${file.type}`,
          evidenceType
        })
        continue
      }

      // Generate preview for images
      const preview = await generatePreview(file)

      newUploadFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'pending',
        evidenceType,
        preview
      })
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles])
  }

  // Upload single file
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<Evidence | null> => {
    const { file, id } = uploadFile
    
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('itemId', item.id.toString())
      formData.append('type', uploadFile.evidenceType)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === id && f.status === 'uploading' 
            ? { ...f, progress: Math.min(f.progress + 10, 90) } 
            : f
        ))
      }, 200)

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (response.ok) {
        // Update status to completed
        setUploadFiles(prev => prev.map(f => 
          f.id === id ? { ...f, status: 'completed', progress: 100 } : f
        ))

        return result.evidence
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      // Update status to error
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
      return null
    }
  }

  // Upload all pending files
  const handleUploadAll = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setUploading(true)
    const uploadedEvidence: Evidence[] = []

    for (const uploadFile of pendingFiles) {
      const evidence = await uploadSingleFile(uploadFile)
      if (evidence) {
        uploadedEvidence.push(evidence)
      }
    }

    setUploading(false)

    if (uploadedEvidence.length > 0) {
      onSuccess(uploadedEvidence)
    }
  }

  // Remove file from list
  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  // Retry failed upload
  const retryUpload = async (id: string) => {
    const uploadFile = uploadFiles.find(f => f.id === id)
    if (!uploadFile) return

    const evidence = await uploadSingleFile(uploadFile)
    if (evidence) {
      onSuccess([evidence])
    }
  }

  // Clear all files
  const clearAll = () => {
    setUploadFiles([])
  }

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length
  const completedCount = uploadFiles.filter(f => f.status === 'completed').length
  const errorCount = uploadFiles.filter(f => f.status === 'error').length

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
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
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                📸
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  margin: '0 0 8px 0',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  Enhanced Evidence Upload
                </h2>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{item.name}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                fontSize: '20px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '32px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {uploadFiles.length === 0 ? (
            /* Drag & Drop Area */
            <div
              ref={dropZoneRef}
              style={{
                border: dragActive 
                  ? '3px dashed #667eea' 
                  : '2px dashed #d1d5db',
                borderRadius: '24px',
                padding: '64px 32px',
                textAlign: 'center',
                background: dragActive 
                  ? 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' 
                  : 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
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
            >
              {/* Animated background pattern */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23667eea" fill-opacity="0.03"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E") repeat',
                opacity: dragActive ? 0.1 : 0.05,
                transition: 'opacity 0.3s ease'
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '80px', 
                  marginBottom: '24px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                  transform: dragActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  {dragActive ? '📤' : '📁'}
                </div>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  {dragActive ? 'Drop files here!' : 'Upload Evidence Files'}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '32px',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  margin: '0 0 32px 0'
                }}>
                  {dragActive 
                    ? 'Release to upload files' 
                    : 'Drag and drop files here, or click to browse'
                  }
                </p>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Supported Formats:</p>
                    <p style={{ margin: '0 0 4px 0' }}>📸 Photos: JPG, PNG, GIF, WebP</p>
                    <p style={{ margin: '0 0 4px 0' }}>🎥 Videos: MP4, MOV, AVI, WebM</p>
                    <p style={{ margin: '0 0 8px 0' }}>📄 Documents: PDF, DOC, DOCX, TXT</p>
                    <p style={{ margin: 0, fontWeight: '600' }}>Max file size: 50MB per file</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* File List */
            <div>
              {/* Upload Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                    Upload Progress
                  </h3>
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>{pendingCount}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{completedCount}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{errorCount}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Failed</div>
                  </div>
                </div>
              </div>

              {/* File List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    style={{
                      background: 'white',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {/* File Preview/Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: uploadFile.preview 
                        ? `url(${uploadFile.preview}) center/cover`
                        : uploadFile.evidenceType === 'photo' ? '#fef3c7' : 
                          uploadFile.evidenceType === 'video' ? '#dbeafe' : '#f3e8ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}>
                      {uploadFile.preview ? '' : 
                       uploadFile.evidenceType === 'photo' ? '📸' :
                       uploadFile.evidenceType === 'video' ? '🎥' : '📄'}
                    </div>

                    {/* File Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {uploadFile.file.name}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB • {uploadFile.evidenceType.toUpperCase()}
                      </div>
                      
                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${uploadFile.progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      )}
                      
                      {/* Status */}
                      {uploadFile.status === 'completed' && (
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#10b981',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          ✅ Upload completed
                        </div>
                      )}
                      
                      {uploadFile.status === 'error' && (
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#ef4444',
                          fontWeight: '600'
                        }}>
                          ❌ {uploadFile.error}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {uploadFile.status === 'error' && (
                        <button
                          onClick={() => retryUpload(uploadFile.id)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#2563eb'
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#3b82f6'
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          Retry
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(107, 114, 128, 0.1)',
                    color: '#374151',
                    border: '1px solid rgba(107, 114, 128, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Cancel
                </button>
                
                {pendingCount > 0 && (
                  <button
                    onClick={handleUploadAll}
                    disabled={uploading}
                    style={{
                      background: uploading 
                        ? 'rgba(59, 130, 246, 0.7)' 
                        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)'
                      }
                    }}
                  >
                    {uploading ? 'Uploading...' : `Upload ${pendingCount} Files`}
                  </button>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
