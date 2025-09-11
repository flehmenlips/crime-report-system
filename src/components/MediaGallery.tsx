'use client'

import { StolenItem } from '@/types'
import { EvidenceViewer } from './EvidenceViewer'
import { useState } from 'react'

interface MediaGalleryProps {
  item: StolenItem
  compact?: boolean
}

export function MediaGallery({ item, compact = false }: MediaGalleryProps) {
  const [showViewer, setShowViewer] = useState(false)

  const getCloudinaryUrl = (publicId: string, type: 'photo' | 'video' | 'document') => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
    const baseUrl = `https://res.cloudinary.com/${cloudName}`

    if (type === 'photo') {
      return `${baseUrl}/image/upload/w_150,h_150,c_fill,f_auto,q_auto/${publicId}`
    } else if (type === 'video') {
      return `${baseUrl}/video/upload/w_150,h_150,c_fill,f_mp4/${publicId}`
    } else {
      return `${baseUrl}/image/upload/f_auto,q_auto/${publicId}`
    }
  }

  const totalEvidence = item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length

  if (totalEvidence === 0) {
    return (
      <span className="text-sm text-gray-500 italic">
        No evidence
      </span>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {item.evidence.photos.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              📷 {item.evidence.photos.length}
            </span>
          )}
          {item.evidence.videos.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              🎥 {item.evidence.videos.length}
            </span>
          )}
          {item.evidence.documents.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              📄 {item.evidence.documents.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowViewer(true)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          View
        </button>

        {showViewer && (
          <EvidenceViewer
            item={item}
            onClose={() => setShowViewer(false)}
          />
        )}
      </div>
    )
  }

  // Full gallery view
  const allEvidence = [
    ...item.evidence.photos.map(id => ({ id, type: 'photo' as const })),
    ...item.evidence.videos.map(id => ({ id, type: 'video' as const })),
    ...item.evidence.documents.map(id => ({ id, type: 'document' as const }))
  ]

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {allEvidence.slice(0, 4).map((evidence, index) => (
          <div key={evidence.id} className="relative">
            {evidence.type === 'photo' ? (
              <img
                src={getCloudinaryUrl(evidence.id, 'photo')}
                alt={`Evidence ${index + 1}`}
                className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowViewer(true)}
              />
            ) : evidence.type === 'video' ? (
              <div
                className="w-full h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => setShowViewer(true)}
              >
                <span className="text-lg">🎥</span>
              </div>
            ) : (
              <div
                className="w-full h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => setShowViewer(true)}
              >
                <span className="text-lg">📄</span>
              </div>
            )}
          </div>
        ))}
        {allEvidence.length > 4 && (
          <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
               onClick={() => setShowViewer(true)}>
            <span className="text-sm text-gray-600">+{allEvidence.length - 4} more</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowViewer(true)}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        View all evidence ({totalEvidence} items)
      </button>

      {showViewer && (
        <EvidenceViewer
          item={item}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  )
}
