'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [items, setItems] = useState<StolenItem[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'evidence'>('overview')
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication first
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

  // Load items data (only after authentication)
  useEffect(() => {
    if (!authenticated) return

    const loadData = async () => {
      try {
        const response = await fetch('/api/items')
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } catch (err) {
        console.error('Failed to load items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authenticated])

  // Calculate analytics
  useEffect(() => {
    if (items.length === 0) {
      setAnalyticsData(null)
      return
    }

    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
    const itemCount = items.length
    const averageValue = totalValue / itemCount

    // Category analysis
    const categories: { [key: string]: { count: number; value: number } } = {}
    items.forEach(item => {
      const category = item.category || 'other'
      if (!categories[category]) {
        categories[category] = { count: 0, value: 0 }
      }
      categories[category].count += 1
      categories[category].value += item.estimatedValue
    })

    // Evidence statistics
    const evidenceStats = {
      totalEvidence: 0,
      photosCount: 0,
      videosCount: 0,
      documentsCount: 0
    }

    items.forEach(item => {
      if (item.evidence) {
        evidenceStats.totalEvidence += item.evidence.length
        item.evidence.forEach((evidence: any) => {
          switch (evidence.type) {
            case 'photo':
              evidenceStats.photosCount++
              break
            case 'video':
              evidenceStats.videosCount++
              break
            case 'document':
              evidenceStats.documentsCount++
              break
          }
        })
      }
    })

    // Top items by value
    const topItems = [...items]
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 5)

    setAnalyticsData({
      totalValue,
      itemCount,
      averageValue,
      categories,
      evidenceStats,
      topItems
    })
  }, [items])

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading analytics...'}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            Analytics
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
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f3f4f6',
            padding: isMobile ? '0 16px' : '0 32px',
            gap: isMobile ? '12px' : '24px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'categories', label: 'Categories', icon: '📁' },
              { id: 'evidence', label: 'Evidence', icon: '📸' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '16px 0',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#667eea' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
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
            {!analyticsData ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Data Available</h3>
                <p>Add items to your inventory to see analytics.</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Summary Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '16px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Value</div>
                        <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700' }}>
                          ${analyticsData.totalValue.toLocaleString()}
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Items</div>
                        <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700' }}>
                          {analyticsData.itemCount}
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Average Value</div>
                        <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700' }}>
                          ${Math.round(analyticsData.averageValue).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Top Items */}
                    <div style={{
                      background: '#f9fafb',
                      padding: isMobile ? '20px' : '24px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '16px'
                      }}>
                        🏆 Top 5 Items by Value
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analyticsData.topItems.map((item: StolenItem, index: number) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '12px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#667eea',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '14px'
                              }}>
                                {index + 1}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                                  {item.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  {item.category || 'Uncategorized'}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              fontWeight: '700',
                              color: '#10b981',
                              fontSize: '16px'
                            }}>
                              ${item.estimatedValue.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      📁 Items by Category
                    </h3>
                    {Object.entries(analyticsData.categories)
                      .sort(([, a]: any, [, b]: any) => b.value - a.value)
                      .map(([category, data]: any) => (
                        <div
                          key={category}
                          style={{
                            background: '#f9fafb',
                            padding: isMobile ? '16px' : '20px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1f2937',
                              textTransform: 'capitalize'
                            }}>
                              {category}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              {data.count} items
                            </div>
                          </div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#667eea'
                          }}>
                            ${data.value.toLocaleString()}
                          </div>
                          <div style={{
                            marginTop: '12px',
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              width: `${(data.value / analyticsData.totalValue) * 100}%`,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Evidence Tab */}
                {activeTab === 'evidence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      📸 Evidence Statistics
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        padding: '20px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📸 Photos</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {analyticsData.evidenceStats.photosCount}
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                        padding: '20px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>🎥 Videos</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {analyticsData.evidenceStats.videosCount}
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        padding: '20px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📄 Documents</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {analyticsData.evidenceStats.documentsCount}
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                        padding: '20px',
                        borderRadius: '16px',
                        color: 'white'
                      }}>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📦 Total</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {analyticsData.evidenceStats.totalEvidence}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

