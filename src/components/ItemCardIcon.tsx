'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface ItemCardIconProps {
  item: StolenItem
  size?: number
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
}

export function ItemCardIcon({ item, size = 64 }: ItemCardIconProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

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
      console.error('Error loading evidence for icon:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCloudinaryThumbnailUrl = (cloudinaryId: string) => {
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      return `https://via.placeholder.com/${size}x${size}/6366f1/ffffff?text=Demo`
    }
    
    // If it's already a full URL, convert to thumbnail
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      return cloudinaryId.replace(
        /\/image\/upload\/[^/]*\//,
        `/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        `/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`
      )
    }
    
    // For public_id format, construct URL
    const cloudName = 'dhaacekdd'
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/${cloudinaryId}`
  }

  const photos = evidence.filter(e => e.type === 'photo')
  const firstPhoto = photos[0]

  // Show loading state
  if (loading) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #9ca3af',
          borderTop: '2px solid #6b7280',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  // Show photo thumbnail if available and not errored
  if (firstPhoto && !imageError) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        border: '3px solid #10b981',
        position: 'relative'
      }}>
        <img
          src={getCloudinaryThumbnailUrl(firstPhoto.cloudinaryId)}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => {
            console.log('Image failed to load for', item.name, '- falling back to letter icon')
            setImageError(true)
          }}
          onLoad={() => {
            console.log('Image loaded successfully for', item.name)
          }}
        />
        
        {/* Photo indicator */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '16px',
          height: '16px',
          background: '#10b981',
          borderRadius: '50%',
          border: '2px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '8px', color: 'white' }}>📷</span>
        </div>
      </div>
    )
  }

  // Fallback to letter icon
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
      color: 'white',
      fontWeight: 'bold',
      fontSize: `${size * 0.375}px` // Responsive font size
    }}>
      {item.name.charAt(0).toUpperCase()}
    </div>
  )
}
