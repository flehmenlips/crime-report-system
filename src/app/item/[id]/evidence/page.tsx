'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function EvidenceManagerPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [item, setItem] = useState<StolenItem | null>(null)
  const [evidence, setEvidence] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'document'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  // Load item and evidence data
  useEffect(() => {
    if (!authenticated || !itemId) return

    const loadData = async () => {
      try {
        // Load item
        const itemsResponse = await fetch('/api/items')
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          const foundItem = itemsData.items.find((i: StolenItem) => i.id.toString() === itemId.toString())
          if (foundItem) {
            setItem(foundItem)
          } else {
            router.back()
            return
          }
        }

        // Load evidence
        const evidenceResponse = await fetch(`/api/evidence?itemId=${itemId}`)
        if (evidenceResponse.ok) {
          const evidenceData = await evidenceResponse.json()
          setEvidence(evidenceData.evidence || [])
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        router.back()
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authenticated, itemId, router])

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading evidence...'}
        </div>
      </div>
    )
  }

  if (!authenticated || !item) {
    return null
  }

  const filteredEvidence = activeFilter === 'all' 
    ? evidence 
    : evidence.filter(e => e.type === activeFilter)

  const photosCount = evidence.filter(e => e.type === 'photo').length
  const videosCount = evidence.filter(e => e.type === 'video').length
  const documentsCount = evidence.filter(e => e.type === 'document').length

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      paddingBottom: isMobile ? '140px' : '48px'
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
            Evidence Manager
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
          {/* Header with Item Info */}
          <div style={{
            padding: isMobile ? '24px 16px' : '32px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white'
          }}>
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
              opacity: 0.9
            }}>
              Manage evidence files for this item
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f3f4f6',
            padding: isMobile ? '0 16px' : '0 32px',
            gap: isMobile ? '8px' : '16px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'all', label: 'All', icon: '📂', count: evidence.length },
              { id: 'photo', label: 'Photos', icon: '📸', count: photosCount },
              { id: 'video', label: 'Videos', icon: '🎥', count: videosCount },
              { id: 'document', label: 'Docs', icon: '📄', count: documentsCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                style={{
                  padding: '12px 0',
                  fontSize: isMobile ? '13px' : '15px',
                  fontWeight: '600',
                  color: activeFilter === tab.id ? '#8b5cf6' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFilter === tab.id ? '3px solid #8b5cf6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ marginRight: '6px' }}>{tab.icon}</span>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Evidence Stats */}
          <div style={{
            padding: isMobile ? '20px 16px' : '24px 32px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              <div style={{
                background: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#8b5cf6' }}>
                  {evidence.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Total</div>
              </div>
              <div style={{
                background: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {photosCount}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Photos</div>
              </div>
              <div style={{
                background: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#8b5cf6' }}>
                  {videosCount}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Videos</div>
              </div>
              <div style={{
                background: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#f59e0b' }}>
                  {documentsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Docs</div>
              </div>
            </div>
          </div>

          {/* Evidence Grid/List */}
          <div style={{
            padding: isMobile ? '20px 16px' : '32px'
          }}>
            {filteredEvidence.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280'
              }}>
                <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📂</span>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Evidence Files</h3>
                <p style={{ fontSize: '14px' }}>Upload photos, videos, or documents to get started</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile 
                  ? '1fr 1fr' 
                  : viewMode === 'grid' 
                    ? 'repeat(auto-fill, minmax(200px, 1fr))' 
                    : '1fr',
                gap: isMobile ? '12px' : '16px'
              }}>
                {filteredEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: isMobile ? '12px' : '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      // TODO: Open evidence viewer
                      alert('Evidence viewer - Coming soon!')
                    }}
                  >
                    <div style={{
                      fontSize: isMobile ? '40px' : '48px',
                      textAlign: 'center',
                      marginBottom: '12px'
                    }}>
                      {ev.type === 'photo' ? '📷' : ev.type === 'video' ? '🎥' : '📄'}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '13px' : '14px',
                      color: '#1f2937',
                      fontWeight: '600',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px'
                    }}>
                      {ev.originalName || 'Unnamed'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      {new Date(ev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: isMobile ? '16px' : '20px 32px',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={() => router.push(`/item/${itemId}/evidence/upload`)}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📤</span>
            <span>Upload Evidence</span>
          </button>
        </div>
      </div>
    </div>
  )
}

