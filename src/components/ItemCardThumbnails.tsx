'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { StolenItem } from '@/types'

interface ItemCardThumbnailsProps {
  item: StolenItem
  onImageClick?: (cloudinaryId: string) => void
  compact?: boolean // New prop for compact mode
  evidence?: any[] // Optional evidence data to avoid API calls
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  url?: string | null
  originalName: string | null
}

export function ItemCardThumbnails({ item, onImageClick, compact = false, evidence: propEvidence }: ItemCardThumbnailsProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(!propEvidence) // Only show loading if no evidence provided
  const [imageLoading, setImageLoading] = useState<Set<number>>(new Set()) // Track individual image loading states

  // Debug logging
  console.log('ItemCardThumbnails rendered for item:', item.name, 'ID:', item.id, 'Has evidence prop:', !!propEvidence, 'Evidence count:', propEvidence?.length || 0)

  useEffect(() => {
    if (propEvidence && Array.isArray(propEvidence)) {
      // Use provided evidence data (no API call needed)
      console.log('✅ Using provided evidence data for item:', item.id, 'Evidence count:', propEvidence.length)
      setEvidence(propEvidence)
      setLoading(false)
    } else if (!loading) {
      // Only make API call if we haven't already loaded evidence
      console.log('⚠️ No evidence prop provided for item:', item.id, 'Making API call')
      loadEvidence()
    }
  }, [item.id, propEvidence])

  const loadEvidence = async () => {
    try {
      console.log('ItemCardThumbnails loading evidence for item:', item.id)
      const response = await fetch(`/api/evidence?itemId=${item.id}`)
      console.log('ItemCardThumbnails evidence response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('ItemCardThumbnails evidence data:', data)
        setEvidence(data.evidence || [])
      } else {
        const errorData = await response.json()
        console.error('ItemCardThumbnails evidence API error:', errorData)
      }
    } catch (error) {
      console.error('ItemCardThumbnails error loading evidence:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCloudinaryThumbnailUrl = useCallback((cloudinaryId: string, url?: string | null) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhaacekdd'
    
    console.log('ItemCardThumbnails getCloudinaryThumbnailUrl - cloudinaryId:', cloudinaryId, 'url:', url)
    
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      // Demo mode - show placeholder
      console.log('ItemCardThumbnails using demo placeholder')
      return `https://via.placeholder.com/120x80/3b82f6/ffffff?text=Demo+Photo`
    }
    
    // If we have a direct URL, convert it to thumbnail format
    if (url && url.startsWith('https://res.cloudinary.com/')) {
      const thumbnailUrl = url.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_120,h_80,c_fill,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_120,h_80,c_fill,f_auto,q_auto/'
      )
      console.log('ItemCardThumbnails using url field:', thumbnailUrl)
      return thumbnailUrl
    }
    
    // If it's already a full URL in cloudinaryId, convert to thumbnail
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      const thumbnailUrl = cloudinaryId.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_120,h_80,c_fill,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_120,h_80,c_fill,f_auto,q_auto/'
      )
      console.log('ItemCardThumbnails cloudinaryId is already a full URL, converted:', thumbnailUrl)
      return thumbnailUrl
    }
    
    // Real Cloudinary image - construct URL from public_id
    const constructedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_80,c_fill,f_auto,q_auto/${cloudinaryId}`
    console.log('ItemCardThumbnails constructed URL from public_id:', constructedUrl)
    return constructedUrl
  }, [])

  const photos = useMemo(() => evidence.filter(e => e.type === 'photo'), [evidence])
  const videos = useMemo(() => evidence.filter(e => e.type === 'video'), [evidence])
  const documents = useMemo(() => evidence.filter(e => e.type === 'document'), [evidence])

  if (loading) {
    return (
      <div style={{
        height: compact ? '48px' : '80px',
        width: compact ? '48px' : '100%',
        background: '#f9fafb',
        borderRadius: compact ? '8px' : '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: compact ? '0' : '16px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #6b7280',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  if (photos.length === 0 && videos.length === 0 && documents.length === 0) {
    if (compact) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>📁</div>
          </div>
        </div>
      )
    }
    
    return (
      <div style={{
        height: '80px',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: '2px dashed #d1d5db',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
          <div style={{ fontSize: '12px', fontWeight: '500' }}>No Evidence</div>
        </div>
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: '#f59e0b',
          color: 'white',
          fontSize: '8px',
          padding: '2px 4px',
          borderRadius: '4px'
        }}>
          NO PHOTOS
        </div>
      </div>
    )
  }

  // Compact mode - just show first photo without labels
  if (compact && photos.length > 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onClick={() => onImageClick?.(photos[0].cloudinaryId)}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}>
        <img
          src={getCloudinaryThumbnailUrl(photos[0].cloudinaryId, photos[0].url)}
          alt={photos[0].originalName || 'Evidence photo'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoad={() => {
            setImageLoading(prev => {
              const newSet = new Set(prev)
              newSet.delete(photos[0].id)
              return newSet
            })
          }}
          onError={() => {
            console.log('Image failed to load for', photos[0].originalName)
            setImageLoading(prev => {
              const newSet = new Set(prev)
              newSet.delete(photos[0].id)
              return newSet
            })
          }}
        />
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
                  src={getCloudinaryThumbnailUrl(photo.cloudinaryId, photo.url)}
                  alt={photo.originalName || 'Evidence photo'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onLoad={() => {
                    setImageLoading(prev => {
                      const newSet = new Set(prev)
                      newSet.delete(photo.id)
                      return newSet
                    })
                  }}
                  onError={() => {
                    console.log('Image failed to load for', photo.originalName)
                    setImageLoading(prev => {
                      const newSet = new Set(prev)
                      newSet.delete(photo.id)
                      return newSet
                    })
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
