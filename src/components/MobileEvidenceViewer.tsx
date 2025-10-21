'use client'

import { useState, useEffect } from 'react'

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  url?: string | null
  originalName: string | null
  description: string | null
  createdAt: string
}

interface MobileEvidenceViewerProps {
  evidence: Evidence[]
  initialIndex: number
  onClose: () => void
  onDelete?: (evidenceId: number) => void
}

export function MobileEvidenceViewer({ evidence, initialIndex, onClose, onDelete }: MobileEvidenceViewerProps) {
  // Initialize with validated index
  const [currentIndex, setCurrentIndex] = useState(() => {
    return Math.max(0, Math.min(initialIndex, evidence.length - 1))
  })
  const [isMobile, setIsMobile] = useState(false)
  
  const currentEvidence = evidence[currentIndex]
  
  // If no valid evidence, close the viewer
  useEffect(() => {
    if (!currentEvidence || evidence.length === 0) {
      onClose()
    }
  }, [currentEvidence, evidence.length, onClose])
  
  // Validate currentIndex if evidence array changes
  useEffect(() => {
    if (currentIndex >= evidence.length && evidence.length > 0) {
      setCurrentIndex(evidence.length - 1)
    } else if (currentIndex < 0 && evidence.length > 0) {
      setCurrentIndex(0)
    }
  }, [currentIndex, evidence.length])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      } else if (e.key === 'ArrowRight' && currentIndex < evidence.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, evidence.length, onClose])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < evidence.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Delete ${currentEvidence.originalName}?`)) {
      if (onDelete) {
        await onDelete(currentEvidence.id)
        // Parent component will handle the deletion and state updates
        // We just close the viewer or let parent decide
      }
    }
  }

  const getCloudinaryUrl = (cloudinaryId: string, url?: string | null, type?: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhaacekdd'
    
    // If we have a direct URL, use it
    if (url && url.startsWith('https://res.cloudinary.com/')) {
      return url
    }
    
    // If it's already a full URL in cloudinaryId
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      return cloudinaryId
    }
    
    // Determine resource type based on evidence type
    const resourceType = type === 'video' ? 'video' : type === 'document' ? 'raw' : 'image'
    
    // Construct URL from public_id with correct resource type
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${cloudinaryId}`
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
        
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          {currentIndex + 1} / {evidence.length}
        </div>
        
        {onDelete && (
          <button
            onClick={handleDelete}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🗑️</span>
            Delete
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}
          >
            ‹
          </button>
        )}

        {/* Evidence Display */}
        <div style={{
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {currentEvidence.type === 'photo' ? (
            <img
              src={getCloudinaryUrl(currentEvidence.cloudinaryId, currentEvidence.url, currentEvidence.type)}
              alt={currentEvidence.originalName || 'Evidence photo'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          ) : currentEvidence.type === 'video' ? (
            <video
              src={getCloudinaryUrl(currentEvidence.cloudinaryId, currentEvidence.url, currentEvidence.type)}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '12px'
              }}
            />
          ) : (
            // Document
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>📄</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {currentEvidence.originalName}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Document viewing coming soon
              </p>
              <a
                href={getCloudinaryUrl(currentEvidence.cloudinaryId, currentEvidence.url, currentEvidence.type)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Download Document
              </a>
            </div>
          )}
        </div>

        {/* Next Button */}
        {currentIndex < evidence.length - 1 && (
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Footer with Info */}
      <div style={{
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        color: 'white'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 8px 0'
        }}>
          {currentEvidence.originalName}
        </h3>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span>
            {currentEvidence.type === 'photo' ? '📷' : currentEvidence.type === 'video' ? '🎥' : '📄'} 
            {' '}{currentEvidence.type.charAt(0).toUpperCase() + currentEvidence.type.slice(1)}
          </span>
          <span>
            📅 {new Date(currentEvidence.createdAt).toLocaleDateString()}
          </span>
        </div>
        {currentEvidence.description && (
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '12px 0 0 0',
            lineHeight: '1.5'
          }}>
            {currentEvidence.description}
          </p>
        )}
      </div>
    </div>
  )
}

