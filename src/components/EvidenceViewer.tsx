'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
  description: string | null
  createdAt: string
}

interface EvidenceViewerProps {
  item: StolenItem
  onClose: () => void
  onUpdate: () => void
}

export function EvidenceViewer({ item, onClose, onUpdate }: EvidenceViewerProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents'>('photos')
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)

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

  const deleteEvidence = async (evidenceId: number) => {
    if (!confirm('Are you sure you want to delete this evidence file?')) {
      return
    }

    try {
      const response = await fetch(`/api/evidence?id=${evidenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvidence(prev => prev.filter(e => e.id !== evidenceId))
        onUpdate()
        alert('Evidence deleted successfully')
      } else {
        alert('Error deleting evidence')
      }
    } catch (error) {
      console.error('Error deleting evidence:', error)
      alert('Error deleting evidence')
    }
  }

  const getCloudinaryUrl = (cloudinaryId: string, type: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
    const baseUrl = `https://res.cloudinary.com/${cloudName}`

    if (type === 'photo') {
      return `${baseUrl}/image/upload/w_300,h_200,c_fill,f_auto,q_auto/${cloudinaryId}`
    } else if (type === 'video') {
      return `${baseUrl}/video/upload/w_300,h_200,c_fill,f_mp4/${cloudinaryId}`
    } else {
      return `${baseUrl}/image/upload/f_auto,q_auto/${cloudinaryId}`
    }
  }

  const getFullSizeUrl = (cloudinaryId: string, type: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
    const baseUrl = `https://res.cloudinary.com/${cloudName}`

    if (type === 'photo') {
      return `${baseUrl}/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/${cloudinaryId}`
    } else if (type === 'video') {
      return `${baseUrl}/video/upload/w_1200,h_800,c_limit,f_mp4/${cloudinaryId}`
    } else {
      return `${baseUrl}/raw/upload/${cloudinaryId}`
    }
  }

  const filteredEvidence = evidence.filter(e => {
    if (activeTab === 'photos') return e.type === 'photo'
    if (activeTab === 'videos') return e.type === 'video'
    if (activeTab === 'documents') return e.type === 'document'
    return true
  })

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'photos': return '📷'
      case 'videos': return '🎥'
      case 'documents': return '📄'
      default: return '📁'
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'photo': return '📷'
      case 'video': return '🎥'
      case 'document': return '📄'
      default: return '📁'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading evidence...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Evidence Gallery</h2>
              <p className="text-blue-100 text-sm">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(['photos', 'videos', 'documents'] as const).map((tab) => {
                const count = evidence.filter(e => e.type === tab.slice(0, -1)).length
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{getTabIcon(tab)}</span>
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredEvidence.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{getTabIcon(activeTab)}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} uploaded yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload {activeTab} to provide evidence for this stolen item
                </p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Upload {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEvidence.map((evidenceItem) => (
                  <div key={evidenceItem.id} className="group relative">
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Thumbnail */}
                      <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                        {evidenceItem.type === 'photo' ? (
                          <img
                            src={getCloudinaryUrl(evidenceItem.cloudinaryId, evidenceItem.type)}
                            alt={evidenceItem.originalName || 'Evidence'}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => {
                              setSelectedEvidence(evidenceItem)
                              setShowFullscreen(true)
                            }}
                          />
                        ) : evidenceItem.type === 'video' ? (
                          <div 
                            className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              setSelectedEvidence(evidenceItem)
                              setShowFullscreen(true)
                            }}
                          >
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎥</div>
                              <div className="text-sm text-gray-600">Click to play</div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer"
                            onClick={() => window.open(getFullSizeUrl(evidenceItem.cloudinaryId, evidenceItem.type), '_blank')}
                          >
                            <div className="text-center">
                              <div className="text-4xl mb-2">📄</div>
                              <div className="text-sm text-gray-600">Click to download</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {evidenceItem.originalName || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(evidenceItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteEvidence(evidenceItem.id)}
                            className="ml-2 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total evidence files: {evidence.length}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Upload More Evidence
                </button>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Viewer */}
      {showFullscreen && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
          <div className="max-w-5xl max-h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <h3 className="text-lg font-medium">{selectedEvidence.originalName}</h3>
                <p className="text-sm text-gray-300">
                  {new Date(selectedEvidence.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowFullscreen(false)}
                className="text-white hover:text-gray-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              {selectedEvidence.type === 'photo' ? (
                <img
                  src={getFullSizeUrl(selectedEvidence.cloudinaryId, selectedEvidence.type)}
                  alt={selectedEvidence.originalName || 'Evidence'}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : selectedEvidence.type === 'video' ? (
                <video
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                  src={getFullSizeUrl(selectedEvidence.cloudinaryId, selectedEvidence.type)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedEvidence.originalName}
                  </h3>
                  <a
                    href={getFullSizeUrl(selectedEvidence.cloudinaryId, selectedEvidence.type)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-block"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}