'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { DynamicCategorySelector } from './DynamicCategorySelector'
import { EnhancedTagDisplay } from './EnhancedTagDisplay'
import { EvidenceCaption } from './EvidenceCaption'

interface ItemDetailViewProps {
  item: StolenItem
  onClose: () => void
  onEdit: (item: StolenItem) => void
  onDelete: (item: StolenItem) => void
  onDuplicate: (item: StolenItem) => void
  onUploadEvidence: (item: StolenItem) => void
  onViewNotes?: (item: StolenItem) => void
  evidence?: any[] // Optional evidence data to avoid API calls
  permissions?: {
    canEdit?: boolean
    canDelete?: boolean
    canUpload?: boolean
    canAddNotes?: boolean
  }
  user?: any
  onCategoryUpdate?: (itemId: number, newCategory: string) => void
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  url?: string
  originalName: string | null
  description: string | null
  uploadedBy?: string
  uploadedByName?: string
  uploadedByRole?: string
  createdAt: string
  documentData?: any  // Binary data for documents (Uint8Array or Buffer in frontend)
}

export function ItemDetailView({ item, onClose, onEdit, onDelete, onDuplicate, onUploadEvidence, onViewNotes, evidence: propEvidence, permissions = { canEdit: true, canDelete: true, canUpload: true, canAddNotes: true }, user, onCategoryUpdate }: ItemDetailViewProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loadingEvidence, setLoadingEvidence] = useState(true)
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [failedThumbnails, setFailedThumbnails] = useState<Set<number>>(new Set())
  const [investigationNotes, setInvestigationNotes] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(item.category || '')
  const [loadingNotes, setLoadingNotes] = useState(true)

  useEffect(() => {
    if (propEvidence && Array.isArray(propEvidence)) {
      // Use provided evidence data (no API call needed)
      console.log('✅ ItemDetailView using provided evidence data for item:', item.id, 'Evidence count:', propEvidence.length)
      setEvidence(propEvidence)
      setLoadingEvidence(false)
    } else {
      // Fallback to API call if no evidence provided
      console.log('⚠️ ItemDetailView no evidence prop provided for item:', item.id, 'Making API call')
      loadEvidence()
    }
    
    // Load investigation notes
    loadInvestigationNotes()
  }, [item.id, propEvidence])

  const loadInvestigationNotes = async () => {
    try {
      console.log('Loading investigation notes for item:', item.id)
      const response = await fetch(`/api/notes?itemId=${item.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Investigation notes data received:', data)
        setInvestigationNotes(data.notes || [])
      } else {
        console.error('Failed to load investigation notes:', response.status)
      }
    } catch (error) {
      console.error('Error loading investigation notes:', error)
    } finally {
      setLoadingNotes(false)
    }
  }

  const loadEvidence = async () => {
    try {
      console.log('Loading evidence for item:', item.id)
      const response = await fetch(`/api/evidence?itemId=${item.id}`)
      console.log('Evidence API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Evidence data received:', data)
        setEvidence(data.evidence || [])
        console.log('Evidence set:', data.evidence || [])
      } else {
        const errorData = await response.json()
        console.error('Evidence API error:', errorData)
      }
    } catch (error) {
      console.error('Error loading evidence:', error)
    } finally {
      setLoadingEvidence(false)
    }
  }

  const handleCategoryUpdate = async (newCategory: string) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...item,
          category: newCategory
        })
      })

      if (response.ok) {
        setCurrentCategory(newCategory)
        setEditingCategory(false)
        // Call the parent callback if provided
        if (onCategoryUpdate) {
          onCategoryUpdate(item.id, newCategory)
        }
        console.log('✅ Category updated successfully')
      } else {
        console.error('Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const getCloudinaryThumbnailUrl = (cloudinaryId: string, url?: string) => {
    // Handle different cloudinaryId formats
    if (cloudinaryId.startsWith('demo/')) {
      return `https://via.placeholder.com/200x150/6366f1/ffffff?text=Demo+File`
    }
    
    // If we have a direct URL, convert it to thumbnail format
    if (url && url.startsWith('https://res.cloudinary.com/')) {
      return url.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_200,h_150,c_fill,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_200,h_150,c_fill,f_auto,q_auto/'
      )
    }
    
    // If it's already a full URL in cloudinaryId, convert to thumbnail
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

  const getCloudinaryFullUrl = (cloudinaryId: string, url?: string) => {
    // If we have a direct URL, convert it to full size format
    if (url && url.startsWith('https://res.cloudinary.com/')) {
      return url.replace(
        /\/image\/upload\/[^/]*\//,
        '/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/'
      ).replace(
        /\/raw\/upload\/[^/]*\//,
        '/image/upload/w_1200,h_800,c_limit,f_auto,q_auto/'
      )
    }
    
    // If it's already a full URL in cloudinaryId, convert to full size
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
  
  // Debug logging
  console.log('ItemDetailView - Evidence breakdown:', {
    total: evidence.length,
    photos: photos.length,
    videos: videos.length,
    documents: documents.length,
    evidenceTypes: evidence.map(e => e.type)
  })

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
                  {permissions.canEdit && (
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
                  )}
                  
                  {permissions.canUpload && (
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
                  )}

                  {permissions.canAddNotes && onViewNotes && (
                    <button
                      onClick={() => {
                        setShowActionMenu(false)
                        onViewNotes(item)
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
                      <span style={{ fontSize: '16px' }}>🔍</span>
                      <span style={{ fontWeight: '500' }}>Investigation Notes</span>
                    </button>
                  )}
                  
                  {permissions.canEdit && (
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
                  )}
                  
                  {permissions.canDelete && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '140px' }}>
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
          </div>
          
          {/* Current Value - positioned below the main header */}
          <div style={{ 
            position: 'absolute', 
            top: '24px', 
            right: '140px',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', marginBottom: '2px' }}>
              {formatCurrency(item.estimatedValue)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Current Value</div>
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
                {currentCategory && (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '2px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>📂 Category</div>
                      {permissions.canEdit && user && (
                        <button
                          onClick={() => setEditingCategory(!editingCategory)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                        >
                          {editingCategory ? '✖️ Cancel' : '✏️ Edit'}
                        </button>
                      )}
                    </div>
                    
                    {editingCategory && user ? (
                      <div style={{ marginTop: '12px' }}>
                        <DynamicCategorySelector
                          value={currentCategory}
                          onChange={handleCategoryUpdate}
                          tenantId={user.tenant?.id}
                          userId={user.id}
                        />
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#166534',
                        textTransform: 'capitalize'
                      }}>
                        {currentCategory}
                      </div>
                    )}
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div style={{ background: '#fef7ff', padding: '20px', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', fontWeight: '600' }}>🏷️ Tags</div>
                    <EnhancedTagDisplay 
                      tags={item.tags} 
                      maxDisplay={6}
                      showAll={false}
                    />
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

          {/* Investigation Notes */}
          {permissions.canAddNotes && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  🔍 Investigation Notes
                </h2>
                {onViewNotes && (
                  <button
                    onClick={() => onViewNotes(item)}
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>📝</span>
                    Add Note
                  </button>
                )}
              </div>
              
              {loadingNotes ? (
                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #dc2626',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px'
                  }}></div>
                  <p style={{ color: '#6b7280', margin: 0 }}>Loading investigation notes...</p>
                </div>
              ) : investigationNotes.length === 0 ? (
                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    No investigation notes yet. Click "Add Note" to add the first note.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {investigationNotes.map((note) => (
                    <div key={note.id} style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '12px',
                      border: note.isConfidential ? '2px solid #fef3c7' : '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            background: note.createdByRole === 'law_enforcement' ? '#fee2e2' : '#dbeafe',
                            color: note.createdByRole === 'law_enforcement' ? '#991b1b' : '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>{note.createdByRole === 'law_enforcement' ? '🚔' : '👤'}</span>
                            <span>{note.createdByName}</span>
                          </div>
                          {note.isConfidential && (
                            <div style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              🔒 Confidential
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p style={{
                        color: '#374151',
                        lineHeight: '1.5',
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Evidence Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                📸 Evidence Files
              </h2>
              {permissions.canUpload && (
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
              )}
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
                          onClick={() => setSelectedEvidence(photo)}
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
                            src={getCloudinaryThumbnailUrl(photo.cloudinaryId, photo.url || undefined)}
                            alt={photo.originalName || 'Evidence photo'}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{ padding: '12px', background: 'white' }}>
                            {photo.description ? (
                              <>
                                <p style={{ 
                                  fontSize: '13px', 
                                  color: '#1f2937', 
                                  margin: '0 0 4px 0', 
                                  lineHeight: '1.5',
                                  fontWeight: '500'
                                }}>
                                  {photo.description}
                                </p>
                                <p style={{ 
                                  fontSize: '10px', 
                                  color: '#9ca3af', 
                                  margin: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {photo.originalName || 'Photo Evidence'}
                                </p>
                              </>
                            ) : (
                              <>
                                <p style={{ 
                                  fontSize: '12px', 
                                  color: '#f59e0b', 
                                  margin: '0 0 4px 0',
                                  fontStyle: 'italic',
                                  fontWeight: '500'
                                }}>
                                  ⚠️ No description added
                                </p>
                                <p style={{ 
                                  fontSize: '10px', 
                                  color: '#9ca3af', 
                                  margin: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {photo.originalName || 'Photo Evidence'}
                                </p>
                              </>
                            )}
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
                          onClick={() => setSelectedEvidence(video)}
                          style={{
                            background: '#f3f4f6',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '2px solid #e5e7eb',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#e5e7eb'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f3f4f6'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          {/* Video Thumbnail */}
                          <div style={{ 
                            position: 'relative',
                            width: '100%',
                            height: '120px',
                            background: '#1f2937',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {video.cloudinaryId && !failedThumbnails.has(video.id) ? (
                              <>
                                <img
                                  src={getCloudinaryThumbnailUrl(video.cloudinaryId, video.url || undefined)}
                                  alt="Video thumbnail"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={() => {
                                    // Mark this thumbnail as failed using React state
                                    setFailedThumbnails(prev => new Set(prev).add(video.id))
                                  }}
                                />
                                {/* Play button overlay */}
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: '50%',
                                  width: '48px',
                                  height: '48px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '20px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
                                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'
                                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                                }}
                                >
                                  ▶️
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: '48px', color: '#6b7280' }}>🎥</div>
                            )}
                          </div>
                          {video.description ? (
                            <>
                              <p style={{ 
                                fontSize: '13px', 
                                color: '#1f2937', 
                                fontWeight: '500', 
                                margin: '0 0 4px 0',
                                lineHeight: '1.5'
                              }}>
                                {video.description}
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#9ca3af', 
                                margin: 0
                              }}>
                                {video.originalName || 'Video Evidence'}
                              </p>
                            </>
                          ) : (
                            <>
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#f59e0b', 
                                margin: '0 0 4px 0',
                                fontStyle: 'italic',
                                fontWeight: '500'
                              }}>
                                ⚠️ No description added
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#9ca3af', 
                                margin: 0
                              }}>
                                {video.originalName || 'Video Evidence'}
                              </p>
                            </>
                          )}
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
                          onClick={() => setSelectedEvidence(doc)}
                          style={{
                            background: '#fffbeb',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '2px solid #fde68a',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fef3c7'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.2)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#fffbeb'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                          {doc.description ? (
                            <>
                              <p style={{ 
                                fontSize: '13px', 
                                color: '#1f2937', 
                                fontWeight: '500', 
                                margin: '0 0 4px 0',
                                lineHeight: '1.5'
                              }}>
                                {doc.description}
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#92400e', 
                                margin: '0 0 4px 0'
                              }}>
                                {doc.originalName?.split('.').pop()?.toUpperCase() || 'DOC'} • Click to view/edit
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#d97706', 
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {doc.originalName || 'Document'}
                              </p>
                            </>
                          ) : (
                            <>
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#f59e0b', 
                                margin: '0 0 4px 0',
                                fontStyle: 'italic',
                                fontWeight: '500'
                              }}>
                                ⚠️ No description added
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#92400e', 
                                margin: '0 0 4px 0'
                              }}>
                                {doc.originalName?.split('.').pop()?.toUpperCase() || 'DOC'} • Click to view/edit
                              </p>
                              <p style={{ 
                                fontSize: '10px', 
                                color: '#d97706', 
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {doc.originalName || 'Document'}
                              </p>
                            </>
                          )}
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
            {permissions.canEdit && (
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
            )}
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
      {selectedEvidence && (
        <div
          onClick={() => setSelectedEvidence(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '32px',
            overflowY: 'auto'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'relative', 
              maxWidth: '1200px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setSelectedEvidence(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                padding: '12px',
                cursor: 'pointer',
                zIndex: 61,
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
            >
              <svg style={{ width: '20px', height: '20px', color: '#1f2937' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* File Name */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '16px',
              paddingRight: '40px'
            }}>
              {selectedEvidence.originalName || 'Evidence File'}
            </h3>

            {/* Evidence Preview */}
            <div style={{ 
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center',
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px'
            }}>
              {selectedEvidence.type === 'photo' && (
                <img
                  src={getCloudinaryFullUrl(selectedEvidence.cloudinaryId, selectedEvidence.url || undefined)}
                  alt="Evidence"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              )}
              
              {selectedEvidence.type === 'video' && (
                <div style={{ textAlign: 'center' }}>
                  {selectedEvidence.cloudinaryId ? (
                    <>
                      {/* Video Player */}
                      <video
                        controls
                        style={{
                          maxWidth: '100%',
                          maxHeight: '600px',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#000'
                        }}
                        poster={getCloudinaryThumbnailUrl(selectedEvidence.cloudinaryId, selectedEvidence.url || undefined)}
                      >
                        <source src={selectedEvidence.url || getCloudinaryFullUrl(selectedEvidence.cloudinaryId, selectedEvidence.url || undefined)} type="video/mp4" />
                        <source src={selectedEvidence.url || getCloudinaryFullUrl(selectedEvidence.cloudinaryId, selectedEvidence.url || undefined)} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Fallback Link */}
                      <div style={{ marginTop: '16px' }}>
                        <a
                          href={selectedEvidence.url || getCloudinaryFullUrl(selectedEvidence.cloudinaryId, selectedEvidence.url || undefined)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            background: '#6b7280',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          🔗 Open in New Tab
                        </a>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎥</div>
                      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
                        Video File: {selectedEvidence.originalName}
                      </p>
                      <p style={{ fontSize: '14px', color: '#ef4444' }}>
                        ⚠️ Video source not available
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedEvidence.type === 'document' && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px' }}>📄</div>
                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
                    Document: {selectedEvidence.originalName}
                  </p>
                  <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '16px', fontWeight: '600' }}>
                    {selectedEvidence.originalName?.split('.').pop()?.toUpperCase() || 'DOCUMENT'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const originalName = selectedEvidence.originalName || 'document'
                      let viewUrl = ''
                      
                      if (selectedEvidence.documentData) {
                        viewUrl = `/api/serve-document/${selectedEvidence.id}?mode=view`
                      } else if (selectedEvidence.cloudinaryId) {
                        let url = selectedEvidence.cloudinaryId
                        if (url?.includes('/raw/upload/')) {
                          url = url.replace('/raw/upload/', '/image/upload/')
                        }
                        url = url?.replace(/(\.[a-zA-Z0-9]+)\.\1$/, '$1') || '#'
                        viewUrl = `/api/document-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(originalName)}`
                      }
                      
                      if (viewUrl) {
                        window.open(viewUrl, '_blank', 'width=800,height=600')
                      }
                    }}
                    style={{
                      background: '#f59e0b',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    📄 Open Document in New Tab
                  </button>
                </div>
              )}
            </div>

            {/* Evidence Caption */}
            <EvidenceCaption
              evidenceId={selectedEvidence.id}
              initialDescription={selectedEvidence.description}
              canEdit={permissions.canEdit || false}
              onUpdate={(newDescription) => {
                // Update local evidence state
                setEvidence(prevEvidence => 
                  prevEvidence.map(e => 
                    e.id === selectedEvidence.id 
                      ? { ...e, description: newDescription }
                      : e
                  )
                )
                // Update selected evidence
                setSelectedEvidence(prev => prev ? { ...prev, description: newDescription } : null)
              }}
            />

            {/* Metadata */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Uploaded by:</strong> {selectedEvidence.uploadedByName || 'Unknown'} ({selectedEvidence.uploadedByRole || 'Unknown'})
              </div>
              <div>
                <strong>Upload date:</strong> {new Date(selectedEvidence.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
