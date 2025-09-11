'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'

interface ItemDetailViewProps {
  item: StolenItem
  onClose: () => void
  onEdit: (item: StolenItem) => void
  onDelete: (item: StolenItem) => void
  onDuplicate: (item: StolenItem) => void
  onUploadEvidence: (item: StolenItem) => void
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
  description: string | null
  createdAt: string
}

export function ItemDetailView({ item, onClose, onEdit, onDelete, onDuplicate, onUploadEvidence }: ItemDetailViewProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loadingEvidence, setLoadingEvidence] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showActionMenu, setShowActionMenu] = useState(false)

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
      setLoadingEvidence(false)
    }
  }

  const getCloudinaryThumbnailUrl = (cloudinaryId: string) => {
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      return `https://via.placeholder.com/200x150/6366f1/ffffff?text=Demo+File`
    }
    
    // If it's already a full URL, convert to thumbnail
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      return cloudinaryId.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_200,h_150,c_fill,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_200,h_150,c_fill,f_auto,q_auto/'
      )
    }
    
    // For public_id format, construct URL
    const cloudName = 'dhaacekdd'
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_150,c_fill,f_auto,q_auto/${cloudinaryId}`
  }

  const getCloudinaryFullUrl = (cloudinaryId: string) => {
    // If it's already a full URL, convert to full size
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      return cloudinaryId.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/'
      )
    }
    
    // For public_id format, construct URL
    const cloudName = 'dhaacekdd'
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/${cloudinaryId}`
  }

  const photos = evidence.filter(e => e.type === 'photo')
  const videos = evidence.filter(e => e.type === 'video')
  const documents = evidence.filter(e => e.type === 'document')

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          color: 'white',
          padding: '32px',
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

          {/* Action Menu */}
          <div style={{ position: 'absolute', top: '24px', right: '80px' }}>
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Action Menu Dropdown */}
            {showActionMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                minWidth: '200px'
              }}>
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={() => {
                      setShowActionMenu(false)
                      onEdit(item)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>✏️</span>
                    <span style={{ fontWeight: '500' }}>Edit Item</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowActionMenu(false)
                      onUploadEvidence(item)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📸</span>
                    <span style={{ fontWeight: '500' }}>Upload Evidence</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowActionMenu(false)
                      onDuplicate(item)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#374151'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📋</span>
                    <span style={{ fontWeight: '500' }}>Duplicate Item</span>
                  </button>
                  
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 16px' }}></div>
                  
                  <button
                    onClick={() => {
                      setShowActionMenu(false)
                      onDelete(item)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#dc2626'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🗑️</span>
                    <span style={{ fontWeight: '500' }}>Delete Item</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}>
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>
                {item.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '18px', opacity: 0.8 }}>
                  ID: {item.id}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>
                {formatCurrency(item.estimatedValue)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Current Value</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              📝 Description
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#4b5563',
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #e5e7eb'
            }}>
              {item.description}
            </p>
          </div>

          {/* Serial Number - Prominent Display */}
          {item.serialNumber && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #f59e0b',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', color: '#92400e', marginBottom: '8px', fontWeight: '600' }}>
                  🔢 Serial Number
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#92400e',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  {item.serialNumber}
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              📊 Item Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '2px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Purchase Information</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  {formatDate(item.purchaseDate)}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                  {formatCurrency(item.purchaseCost)}
                </div>
              </div>
              
              <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '16px', border: '2px solid #fecaca' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Last Seen</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  {formatDate(item.dateLastSeen)}
                </div>
                <div style={{ fontSize: '16px', color: '#dc2626', fontWeight: '600' }}>
                  {item.locationLastSeen}
                </div>
              </div>
            </div>
          </div>

          {/* Category, Tags, and Notes */}
          {(item.category || item.tags || item.notes) && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                📋 Organization & Notes
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {item.category && (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '2px solid #bbf7d0' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>📂 Category</div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#166534',
                      textTransform: 'capitalize'
                    }}>
                      {item.category}
                    </div>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div style={{ background: '#fef7ff', padding: '20px', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', fontWeight: '600' }}>🏷️ Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.tags.map((tag, index) => (
                        <span key={index} style={{
                          background: '#ddd6fe',
                          color: '#7c3aed',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '2px solid #bfdbfe' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>📝 Additional Notes</div>
                    <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.6' }}>
                      {item.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evidence Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                📸 Evidence Files
              </h2>
              <button
                onClick={() => onUploadEvidence(item)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Evidence
              </button>
            </div>

            {loadingEvidence ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>Loading evidence...</p>
              </div>
            ) : (
              <div>
                {/* Photos */}
                {photos.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      📷 Photos ({photos.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedImage(photo.cloudinaryId)}
                          style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            border: '2px solid #e5e7eb'
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
                              height: '150px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{ padding: '8px', background: 'white' }}>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: '500' }}>
                              {photo.originalName || 'Photo Evidence'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      🎥 Videos ({videos.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          style={{
                            background: '#f3f4f6',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '2px solid #e5e7eb',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎥</div>
                          <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600', margin: 0 }}>
                            {video.originalName || 'Video Evidence'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      📄 Documents ({documents.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            background: '#fffbeb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '2px solid #fde68a',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                          <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600', margin: 0 }}>
                            {doc.originalName || 'Document'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Evidence */}
                {photos.length === 0 && videos.length === 0 && documents.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                      No Evidence Yet
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                      Upload photos, videos, or documents to provide evidence for this stolen item
                    </p>
                    <button
                      onClick={() => onUploadEvidence(item)}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      📸 Upload First Evidence
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Total Evidence: {evidence.length} files
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onEdit(item)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Item
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '32px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                padding: '12px',
                cursor: 'pointer',
                zIndex: 61
              }}
            >
              <svg style={{ width: '20px', height: '20px', color: '#1f2937' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getCloudinaryFullUrl(selectedImage)}
              alt="Evidence"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '12px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
