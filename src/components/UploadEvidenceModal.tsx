'use client'

import { useState } from 'react'
import { StolenItem, User } from '@/types'

interface UploadEvidenceModalProps {
  item: StolenItem
  user: User
  onClose: () => void
  onUploadComplete: () => void
}

type EvidenceType = 'photo' | 'video' | 'document'

export function UploadEvidenceModal({ item, user, onClose, onUploadComplete }: UploadEvidenceModalProps) {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('photo')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes: { [key in EvidenceType]: string[] } = {
      photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    }

    if (!validTypes[evidenceType].includes(file.type)) {
      setError(`Invalid file type for ${evidenceType}. Please select a valid file.`)
      return
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Generate preview for images
    if (evidenceType === 'photo') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('itemId', item.id.toString())
      formData.append('type', evidenceType)
      formData.append('description', description)
      formData.append('uploadedBy', user.id)
      formData.append('uploadedByName', user.name)
      formData.append('uploadedByRole', user.role)

      // Simulate upload progress (in real implementation, use XMLHttpRequest or fetch with progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to API
      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      setUploadProgress(100)
      
      // Success! Wait a moment to show 100% progress
      setTimeout(() => {
        onUploadComplete()
        onClose()
      }, 500)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const getFileTypeLabel = () => {
    switch (evidenceType) {
      case 'photo': return 'Photos (JPG, PNG, GIF, WebP)'
      case 'video': return 'Videos (MP4, MOV, AVI)'
      case 'document': return 'Documents (PDF, DOC, DOCX, TXT)'
    }
  }

  const getAcceptTypes = () => {
    switch (evidenceType) {
      case 'photo': return 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
      case 'video': return 'video/mp4,video/quicktime,video/x-msvideo'
      case 'document': return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '32px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            📸 Upload Evidence
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {item.name}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Evidence Type Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Evidence Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <button
                onClick={() => {
                  setEvidenceType('photo')
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${evidenceType === 'photo' ? '#6366f1' : '#e5e7eb'}`,
                  background: evidenceType === 'photo' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontWeight: '600', color: evidenceType === 'photo' ? '#6366f1' : '#6b7280' }}>
                  Photo
                </div>
              </button>

              <button
                onClick={() => {
                  setEvidenceType('video')
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${evidenceType === 'video' ? '#6366f1' : '#e5e7eb'}`,
                  background: evidenceType === 'video' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎥</div>
                <div style={{ fontWeight: '600', color: evidenceType === 'video' ? '#6366f1' : '#6b7280' }}>
                  Video
                </div>
              </button>

              <button
                onClick={() => {
                  setEvidenceType('document')
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${evidenceType === 'document' ? '#6366f1' : '#e5e7eb'}`,
                  background: evidenceType === 'document' ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                <div style={{ fontWeight: '600', color: evidenceType === 'document' ? '#6366f1' : '#6b7280' }}>
                  Document
                </div>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Select File
            </label>
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              background: '#f9fafb'
            }}>
              <input
                type="file"
                accept={getAcceptTypes()}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  cursor: 'pointer',
                  display: 'block'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {evidenceType === 'photo' && '📷'}
                  {evidenceType === 'video' && '🎥'}
                  {evidenceType === 'document' && '📄'}
                </div>
                {selectedFile ? (
                  <div>
                    <div style={{ fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                      ✓ {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                      Click to select file
                    </div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                      {getFileTypeLabel()} • Max 50MB
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                Preview
              </label>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  background: '#f3f4f6'
                }}
              />
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this evidence..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                  Uploading...
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                flex: 1,
                background: !selectedFile || uploading
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {uploading ? 'Uploading...' : '📤 Upload Evidence'}
            </button>
            <button
              onClick={onClose}
              disabled={uploading}
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

