'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface ItemCardThumbnailsProps {
  item: StolenItem
  onImageClick?: (cloudinaryId: string) => void
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
}

export function ItemCardThumbnails({ item, onImageClick }: ItemCardThumbnailsProps) {
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
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhaacekdd'
    
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      // Demo mode - show placeholder
      return `https://via.placeholder.com/120x80/3b82f6/ffffff?text=Demo+Photo`
    }
    
    // Real Cloudinary image
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

  if (photos.length === 0 && videos.length === 0 && documents.length === 0) {
    return (
      <div style={{
        height: '80px',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
          <div style={{ fontSize: '12px', fontWeight: '500' }}>No Evidence</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Photo Thumbnails */}
      {photos.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
            📷 Photos ({photos.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '6px', maxHeight: '80px', overflow: 'hidden' }}>
            {photos.slice(0, 4).map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => onImageClick?.(photo.cloudinaryId)}
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  position: 'relative',
                  aspectRatio: '3/2'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
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
                />
                {index === 3 && photos.length > 4 && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>
                    +{photos.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video and Document Indicators */}
      {(videos.length > 0 || documents.length > 0) && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {videos.length > 0 && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🎥 {videos.length}
            </div>
          )}
          {documents.length > 0 && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              📄 {documents.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
