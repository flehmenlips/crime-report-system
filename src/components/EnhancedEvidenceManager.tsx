'use client'

import { useState, useEffect } from 'react'
import { StolenItem, Evidence } from '@/types'
import { EnhancedEvidenceUpload } from './EnhancedEvidenceUpload'

interface EnhancedEvidenceManagerProps {
  item: StolenItem
  onClose: () => void
  onUpdate?: (item: StolenItem) => void
}

export function EnhancedEvidenceManager({ item, onClose, onUpdate }: EnhancedEvidenceManagerProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents' | 'all'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [evidence, setEvidence] = useState<Evidence[]>(item.evidence || [])
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter evidence based on active tab
  const filteredEvidence = evidence.filter(e => {
    if (activeTab === 'all') return true
    return e.type === activeTab.slice(0, -1) // Remove 's' from 'photos', 'videos', 'documents'
  })

  // Group evidence by type
  const evidenceByType = {
    photos: evidence.filter(e => e.type === 'photo'),
    videos: evidence.filter(e => e.type === 'video'),
    documents: evidence.filter(e => e.type === 'document')
  }

  // Handle successful upload
  const handleUploadSuccess = (newEvidence: Evidence[]) => {
    setEvidence(prev => [...prev, ...newEvidence])
    setShowUploadModal(false)
    
    // Update parent component
    const updatedItem = { ...item, evidence: [...evidence, ...newEvidence] }
    onUpdate?.(updatedItem)
  }

  // Delete evidence
  const deleteEvidence = async (evidenceId: number) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvidence(prev => prev.filter(e => e.id !== evidenceId))
        
        // Update parent component
        const updatedItem = { 
          ...item, 
          evidence: evidence.filter(e => e.id !== evidenceId) 
        }
        onUpdate?.(updatedItem)
      } else {
        console.error('Failed to delete evidence')
      }
    } catch (error) {
      console.error('Error deleting evidence:', error)
    }
  }

  // Download evidence
  const downloadEvidence = async (evidenceItem: Evidence) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceItem.id}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = evidenceItem.originalName || `evidence-${evidenceItem.id}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading evidence:', error)
    }
  }

  // Get file icon based on type
  const getFileIcon = (evidence: Evidence) => {
    switch (evidence.type) {
      case 'photo':
        return '📸'
      case 'video':
        return '🎥'
      case 'document':
        return '📄'
      default:
        return '📎'
    }
  }

  // Get file size in human readable format
  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
            opacity: 0.1
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                📁
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  margin: '0 0 8px 0',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  Evidence Manager
                </h2>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{item.name}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                fontSize: '20px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '32px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {/* Stats and Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>
                  {evidenceByType.photos.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Photos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6' }}>
                  {evidenceByType.videos.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Videos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                  {evidenceByType.documents.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Documents</div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                  color: viewMode === 'grid' ? 'white' : '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                  color: viewMode === 'list' ? 'white' : '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                List
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              📤 Upload Evidence
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '16px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {[
              { id: 'all', label: 'All Files', count: evidence.length },
              { id: 'photos', label: 'Photos', count: evidenceByType.photos.length },
              { id: 'videos', label: 'Videos', count: evidenceByType.videos.length },
              { id: 'documents', label: 'Documents', count: evidenceByType.documents.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'rgba(107, 114, 128, 0.8)',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === tab.id ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                  color: activeTab === tab.id ? 'white' : 'rgba(107, 114, 128, 0.8)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Evidence List */}
          {filteredEvidence.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '64px 32px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                No evidence files
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '24px' }}>
                {activeTab === 'all' 
                  ? 'No evidence files have been uploaded for this item yet.'
                  : `No ${activeTab} have been uploaded for this item yet.`
                }
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                📤 Upload First File
              </button>
            </div>
          ) : (
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
              flexDirection: viewMode === 'list' ? 'column' : 'row',
              gap: '16px'
            }}>
              {filteredEvidence.map((evidenceItem) => (
                <div
                  key={evidenceItem.id}
                  style={{
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                    alignItems: viewMode === 'grid' ? 'stretch' : 'center',
                    gap: viewMode === 'grid' ? '16px' : '20px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                  onClick={() => setSelectedEvidence(evidenceItem)}
                >
                  {/* File Icon/Preview */}
                  <div style={{
                    width: viewMode === 'grid' ? '100%' : '60px',
                    height: viewMode === 'grid' ? '120px' : '60px',
                    borderRadius: '12px',
                    background: evidenceItem.type === 'photo' ? '#fef3c7' : 
                               evidenceItem.type === 'video' ? '#dbeafe' : '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: viewMode === 'grid' ? '48px' : '24px',
                    flexShrink: 0,
                    border: '2px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    {getFileIcon(evidenceItem)}
                  </div>

                  {/* File Info */}
                  <div style={{ 
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {evidenceItem.originalName || `Evidence ${evidenceItem.id}`}
                    </div>
                    
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: evidenceItem.type === 'photo' ? '#fef3c7' : 
                                   evidenceItem.type === 'video' ? '#dbeafe' : '#f3e8ff',
                        color: evidenceItem.type === 'photo' ? '#92400e' : 
                               evidenceItem.type === 'video' ? '#1e40af' : '#7c3aed',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {evidenceItem.type.toUpperCase()}
                      </span>
                      <span>{formatDate(evidenceItem.createdAt)}</span>
                    </div>

                    {evidenceItem.description && (
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {evidenceItem.description}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexDirection: viewMode === 'grid' ? 'row' : 'column',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadEvidence(evidenceItem)
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      ⬇️ Download
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this evidence file?')) {
                          deleteEvidence(evidenceItem.id)
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#dc2626',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <EnhancedEvidenceUpload
          item={item}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}
