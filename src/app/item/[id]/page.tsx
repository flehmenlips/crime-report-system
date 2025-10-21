'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [item, setItem] = useState<StolenItem | null>(null)
  const [evidence, setEvidence] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'manage'>('details')

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          setAuthenticated(true)
        } else {
          router.push('/login-simple')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login-simple')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Load item data
  useEffect(() => {
    if (!authenticated || !itemId) return

    const loadItem = async () => {
      try {
        const response = await fetch(`/api/items/${itemId}`)
        if (response.ok) {
          const data = await response.json()
          setItem(data.item)
        }
      } catch (err) {
        console.error('Failed to load item:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [authenticated, itemId])

  // Load evidence
  useEffect(() => {
    if (!authenticated || !itemId) return

    const loadEvidence = async () => {
      try {
        const response = await fetch(`/api/evidence?itemId=${itemId}`)
        if (response.ok) {
          const data = await response.json()
          setEvidence(data.evidence || [])
        }
      } catch (err) {
        console.error('Failed to load evidence:', err)
      }
    }
    loadEvidence()
  }, [authenticated, itemId])

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading item...'}
        </div>
      </div>
    )
  }

  if (!authenticated || !item) {
    return null // Will redirect
  }

  const photosCount = evidence.filter(e => e.type === 'photo').length
  const videosCount = evidence.filter(e => e.type === 'video').length
  const documentsCount = evidence.filter(e => e.type === 'document').length

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      paddingBottom: isMobile ? '0' : '48px'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.name}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Item Header */}
          <div style={{
            padding: isMobile ? '24px 16px' : '32px',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                gap: '16px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: isMobile ? '24px' : '32px',
                    fontWeight: '700',
                    margin: '0 0 8px 0'
                  }}>
                    {item.name}
                  </h2>
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    margin: '0',
                    opacity: 0.8
                  }}>
                    ID: {item.id}
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: isMobile ? '12px 20px' : '14px 24px',
                  borderRadius: '12px',
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700'
                }}>
                  ${item.estimatedValue.toLocaleString()}
                </div>
              </div>
              {item.serialNumber && (
                <div style={{
                  background: 'rgba(254, 243, 199, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(254, 243, 199, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  display: 'inline-block'
                }}>
                  Serial: {item.serialNumber}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f3f4f6',
            padding: isMobile ? '0 16px' : '0 32px',
            gap: isMobile ? '12px' : '24px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'details', label: 'Details', icon: '📝' },
              { id: 'evidence', label: 'Evidence', icon: '📸' },
              { id: 'manage', label: 'Manage', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '16px 0',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #1f2937' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{
            padding: isMobile ? '24px 16px 100px' : '32px'
          }}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: '#f9fafb',
                  padding: isMobile ? '16px' : '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    📋 Description
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {item.description || 'No description provided'}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '16px'
                }}>
                  <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Category</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      {item.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date Added</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Tab */}
            {activeTab === 'evidence' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>{photosCount}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Photos</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>{videosCount}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Videos</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>{documentsCount}</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Documents</div>
                  </div>
                </div>

                {evidence.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: '#6b7280'
                  }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📂</span>
                    <p>No evidence files</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {evidence.map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          background: '#f9fafb',
                          borderRadius: '12px',
                          padding: '12px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{
                          fontSize: '32px',
                          textAlign: 'center',
                          marginBottom: '8px'
                        }}>
                          {ev.type === 'photo' ? '📷' : ev.type === 'video' ? '🎥' : '📄'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ev.originalName || 'Unnamed'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manage Tab */}
            {activeTab === 'manage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => router.push(`/item/${itemId}/edit`)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>✏️</span>
                  Edit Item
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement upload evidence
                    alert('Upload evidence - Coming soon!')
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📤</span>
                  Upload Evidence
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                      // TODO: Implement delete
                      alert('Delete item - Coming soon!')
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🗑️</span>
                  Delete Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

