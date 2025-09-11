'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface RealPhotoThumbnailsProps {
  item: StolenItem
  onImageClick?: (cloudinaryId: string) => void
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
}

export function RealPhotoThumbnails({ item, onImageClick }: RealPhotoThumbnailsProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvidence()
  }, [item.id])

  const loadEvidence = async () => {
    try {
      const response = await fetch(`/api/evidence?itemId=${item.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvidence(data.evidence || [])
      }
    } catch (error) {
      console.error('Error loading evidence:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCloudinaryThumbnailUrl = (cloudinaryId: string) => {
    const cloudName = 'dhaacekdd'
    
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      return `https://via.placeholder.com/120x80/6366f1/ffffff?text=Demo+File`
    }
    
    // For real Cloudinary uploads, use the exact cloudinaryId as stored
    // Cloudinary will automatically handle versioning
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_80,c_fill,f_auto,q_auto/${cloudinaryId}`
  }

  const photos = evidence.filter(e => e.type === 'photo')
  const videos = evidence.filter(e => e.type === 'video')
  const documents = evidence.filter(e => e.type === 'document')

  if (loading) {
    return (
      <div style={{
        height: '80px',
        background: '#f3f4f6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #d1d5db',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Compact Photo Thumbnails */}
      {photos.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
            📷 {photos.length} Photos Uploaded
          </div>
          <div style={{ display: 'flex', gap: '4px', maxWidth: '100%', overflowX: 'auto' }}>
            {photos.slice(0, 3).map((photo, index) => (
              <div
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onImageClick?.(photo.cloudinaryId)
                }}
                style={{
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  position: 'relative',
                  width: '60px',
                  height: '40px',
                  flexShrink: 0,
                  border: '1px solid #10b981'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={getCloudinaryThumbnailUrl(photo.cloudinaryId)}
                  alt={photo.originalName || 'Evidence photo'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Compact error display
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.style.background = '#dbeafe'
                      parent.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #1e40af; font-size: 8px; font-weight: 600;">
                          <div style="font-size: 12px;">📷</div>
                          <div>Debug</div>
                        </div>
                      `
                      parent.title = `Debug: ${photo.cloudinaryId}`
                    }
                  }}
                />
              </div>
            ))}
            {photos.length > 3 && (
              <div style={{
                width: '60px',
                height: '40px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                +{photos.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Summary */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {photos.length > 0 && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            📷 {photos.length} Photos
          </div>
        )}
        {videos.length > 0 && (
          <div style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            🎥 {videos.length} Videos
          </div>
        )}
        {documents.length > 0 && (
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            📄 {documents.length} Docs
          </div>
        )}
      </div>

      {/* No Evidence State */}
      {photos.length === 0 && videos.length === 0 && documents.length === 0 && (
        <div style={{
          height: '60px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📁</div>
            <div style={{ fontSize: '11px', fontWeight: '500' }}>No Evidence Yet</div>
          </div>
        </div>
      )}
    </div>
  )
}
