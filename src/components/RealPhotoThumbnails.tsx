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
    const cloudName = 'dhaacekdd' // Your cloud name
    
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      // For demo files, show a placeholder
      return `https://via.placeholder.com/120x80/6366f1/ffffff?text=Demo+File`
    }
    
    // For real Cloudinary uploads, try different URL formats
    // The issue might be the path structure, so let's try the raw public_id
    const cleanId = cloudinaryId.replace(/^evidence\/item_\d+\//, '')
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_120,h_80,c_fill,f_auto,q_auto/${cleanId}`
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
    <div style={{ marginBottom: '16px' }}>
      {/* Real Photo Thumbnails */}
      {photos.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
            📷 Photos ({photos.length}) - Real Uploads
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px', maxHeight: '80px' }}>
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
                  aspectRatio: '3/2',
                  border: '2px solid #10b981'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
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
                    // If image fails to load, show file info instead
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                      parent.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #1e40af; font-size: 10px; font-weight: 600; text-align: center; padding: 4px;">
                          <div style="font-size: 16px; margin-bottom: 2px;">📷</div>
                          <div>${photo.originalName?.split('_').pop()?.substring(0, 10) || 'Photo'}</div>
                          <div style="font-size: 8px; opacity: 0.7;">Click to debug</div>
                        </div>
                      `
                      parent.onclick = () => {
                        alert(`Debug Info:\nCloudinary ID: ${photo.cloudinaryId}\nOriginal Name: ${photo.originalName}\nGenerated URL: ${getCloudinaryThumbnailUrl(photo.cloudinaryId)}\n\nTry uploading a new photo to test the latest upload path structure.`)
                      }
                    }
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', photo.cloudinaryId)
                  }}
                />
                
                {/* Success indicator for loaded images */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '12px',
                  height: '12px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}></div>
                
                {/* Photo overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                  padding: '4px 6px',
                  fontSize: '9px',
                  fontWeight: '600'
                }}>
                  {photo.originalName?.split('_').pop()?.substring(0, 15) || 'Photo'}
                </div>
              </div>
            ))}
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
