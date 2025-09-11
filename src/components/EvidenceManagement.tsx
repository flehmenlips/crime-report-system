'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface EvidenceManagementProps {
  item: StolenItem
  onClose: () => void
  onUpdate: () => void
}

interface Evidence {
  id: number
  type: string
  cloudinaryId: string
  originalName: string | null
  description: string | null
  createdAt: string
}

export function EvidenceManagement({ item, onClose, onUpdate }: EvidenceManagementProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents'>('photos')
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null)
  const [newDescription, setNewDescription] = useState('')

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

  const deleteEvidence = async (evidenceId: number, evidenceName: string) => {
    if (!confirm(`Are you sure you want to delete "${evidenceName}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/evidence?id=${evidenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvidence(prev => prev.filter(e => e.id !== evidenceId))
        onUpdate()
        alert(`✅ "${evidenceName}" deleted successfully`)
      } else {
        alert('❌ Failed to delete evidence')
      }
    } catch (error) {
      console.error('Error deleting evidence:', error)
      alert('❌ Error deleting evidence')
    }
  }

  const updateEvidenceDescription = async (evidenceId: number) => {
    if (!newDescription.trim()) {
      alert('Please enter a description')
      return
    }

    try {
      const response = await fetch('/api/evidence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: evidenceId,
          description: newDescription
        })
      })

      if (response.ok) {
        setEvidence(prev => prev.map(e => 
          e.id === evidenceId ? { ...e, description: newDescription } : e
        ))
        setEditingEvidence(null)
        setNewDescription('')
        onUpdate()
        alert('✅ Description updated successfully')
      } else {
        alert('❌ Failed to update description')
      }
    } catch (error) {
      console.error('Error updating evidence:', error)
      alert('❌ Error updating evidence')
    }
  }

  const getCloudinaryThumbnailUrl = (cloudinaryId: string) => {
    const cloudName = 'dhaacekdd'
    
    if (cloudinaryId.startsWith('demo/')) {
      return `https://via.placeholder.com/200x150/6366f1/ffffff?text=Demo+File`
    }
    
    // Try to construct the correct Cloudinary URL
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_150,c_fill,f_auto,q_auto/${cloudinaryId}`
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
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              📸
            </div>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>
                Evidence Management
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
                {item.name} • Total: {evidence.length} files
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <div style={{ display: 'flex', padding: '0 32px' }}>
            {(['photos', 'videos', 'documents'] as const).map((tab) => {
              const count = evidence.filter(e => e.type === tab.slice(0, -1)).length
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeTab === tab ? '3px solid #6366f1' : '3px solid transparent',
                    color: activeTab === tab ? '#6366f1' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{getTabIcon(tab)}</span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={{
                    background: activeTab === tab ? '#6366f1' : '#d1d5db',
                    color: activeTab === tab ? 'white' : '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading evidence...</p>
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{getTabIcon(activeTab)}</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                No {activeTab} yet
              </h3>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Upload {activeTab} to provide evidence for this stolen item
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredEvidence.map((evidenceItem) => (
                <div key={evidenceItem.id} style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}>
                  {/* Evidence Preview */}
                  <div style={{ height: '200px', background: '#f3f4f6', position: 'relative' }}>
                    {evidenceItem.type === 'photo' ? (
                      <img
                        src={getCloudinaryThumbnailUrl(evidenceItem.cloudinaryId)}
                        alt={evidenceItem.originalName || 'Evidence'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                            parent.innerHTML = `
                              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #1e40af; padding: 20px; text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 12px;">📷</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${evidenceItem.originalName || 'Photo'}</div>
                                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 12px;">Cloudinary ID: ${evidenceItem.cloudinaryId}</div>
                                <button onclick="alert('Debug: ${evidenceItem.cloudinaryId}')" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer;">Debug URL</button>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : evidenceItem.type === 'video' ? (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#166534'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎥</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>Video File</div>
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#92400e'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>Document</div>
                      </div>
                    )}

                    {/* Evidence Type Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: evidenceItem.type === 'photo' ? '#3b82f6' : 
                                 evidenceItem.type === 'video' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {evidenceItem.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Evidence Info */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        {evidenceItem.originalName || 'Untitled'}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        Uploaded: {new Date(evidenceItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Description */}
                    {editingEvidence?.id === evidenceItem.id ? (
                      <div style={{ marginBottom: '12px' }}>
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Add description for this evidence..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            onClick={() => updateEvidenceDescription(evidenceItem.id)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingEvidence(null)
                              setNewDescription('')
                            }}
                            style={{
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4', minHeight: '40px' }}>
                          {evidenceItem.description || 'No description added'}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => {
                          setEditingEvidence(evidenceItem)
                          setNewDescription(evidenceItem.description || '')
                        }}
                        style={{
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          color: '#374151',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      
                      <button
                        onClick={() => {
                          if (evidenceItem.type === 'photo') {
                            window.open(getCloudinaryThumbnailUrl(evidenceItem.cloudinaryId).replace('w_200,h_150,c_fill', 'w_1200,h_800,c_limit'), '_blank')
                          } else {
                            alert(`View ${evidenceItem.type}: ${evidenceItem.originalName}`)
                          }
                        }}
                        style={{
                          background: '#dbeafe',
                          border: '1px solid #93c5fd',
                          color: '#1e40af',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        👁️ View
                      </button>

                      <button
                        onClick={() => deleteEvidence(evidenceItem.id, evidenceItem.originalName || 'file')}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Total Evidence: {evidence.length} files ({evidence.filter(e => e.type === 'photo').length} photos, {evidence.filter(e => e.type === 'video').length} videos, {evidence.filter(e => e.type === 'document').length} documents)
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
