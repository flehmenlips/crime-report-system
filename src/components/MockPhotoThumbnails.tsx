'use client'

import { StolenItem } from '@/types'

interface MockPhotoThumbnailsProps {
  item: StolenItem
  onImageClick?: (index: number) => void
}

export function MockPhotoThumbnails({ item, onImageClick }: MockPhotoThumbnailsProps) {
  // Create mock photos based on item type for demonstration
  const getMockPhotos = () => {
    const itemType = item.name.toLowerCase()
    
    if (itemType.includes('tractor')) {
      return [
        { id: 1, name: 'Front View', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop' },
        { id: 2, name: 'Side View', url: 'https://images.unsplash.com/photo-1574091981089-5b8f0e8e6e8f?w=300&h=200&fit=crop' },
        { id: 3, name: 'Serial Plate', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop' }
      ]
    } else if (itemType.includes('combine')) {
      return [
        { id: 1, name: 'Full View', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=200&fit=crop' },
        { id: 2, name: 'Header Close-up', url: 'https://images.unsplash.com/photo-1574091981089-5b8f0e8e6e8f?w=300&h=200&fit=crop' }
      ]
    } else if (itemType.includes('harrow') || itemType.includes('disc')) {
      return [
        { id: 1, name: 'Equipment View', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=200&fit=crop' },
        { id: 2, name: 'Working Position', url: 'https://images.unsplash.com/photo-1574091981089-5b8f0e8e6e8f?w=300&h=200&fit=crop' }
      ]
    } else {
      // Default photos for other items
      return [
        { id: 1, name: 'Item Photo', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop' }
      ]
    }
  }

  const mockPhotos = getMockPhotos()
  const totalEvidence = item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Mock Photo Thumbnails */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
          📷 Evidence Photos ({mockPhotos.length}) - Demo Images
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px', maxHeight: '80px' }}>
          {mockPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => onImageClick?.(index)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                position: 'relative',
                aspectRatio: '3/2',
                border: '2px solid #e5e7eb'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  // Fallback to a solid color if image fails to load
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 100%)'
                    parent.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #7c3aed; font-size: 12px; font-weight: 600;"><div style="font-size: 20px; margin-bottom: 4px;">📷</div>${photo.name}</div>`
                  }
                }}
              />
              
              {/* Photo overlay with name */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: 'white',
                padding: '4px 6px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {photo.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Summary */}
      {totalEvidence > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.evidence.photos.length > 0 && (
            <div style={{
              background: '#dbeafe',
              color: '#1e40af',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              📷 {item.evidence.photos.length} Real
            </div>
          )}
          {item.evidence.videos.length > 0 && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              🎥 {item.evidence.videos.length}
            </div>
          )}
          {item.evidence.documents.length > 0 && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              📄 {item.evidence.documents.length}
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px'
      }}>
        <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
          📸 Photo Setup Instructions
        </div>
        <div style={{ fontSize: '11px', color: '#3730a3', lineHeight: '1.4' }}>
          To see real uploaded photos: Set up your Cloudinary credentials in .env.local
          <br />
          Currently showing demo images for visual reference
        </div>
      </div>
    </div>
  )
}
