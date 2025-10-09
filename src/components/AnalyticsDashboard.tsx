'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface AnalyticsDashboardProps {
  items: StolenItem[]
  onClose: () => void
}

interface AnalyticsData {
  totalValue: number
  itemCount: number
  averageValue: number
  categories: { [key: string]: { count: number; value: number } }
  monthlyTrend: { [key: string]: { count: number; value: number } }
  evidenceStats: {
    totalEvidence: number
    photosCount: number
    videosCount: number
    documentsCount: number
  }
  topItems: StolenItem[]
  recentActivity: Array<{
    type: 'item_added' | 'evidence_added' | 'status_changed'
    description: string
    date: Date
  }>
}

export function AnalyticsDashboard({ items, onClose }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'evidence'>('overview')

  useEffect(() => {
    if (items.length === 0) {
      setAnalyticsData(null)
      return
    }

    // Calculate analytics data
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

    // Monthly trend (using created dates)
    const monthlyTrend: { [key: string]: { count: number; value: number } } = {}
    items.forEach(item => {
      const month = new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { count: 0, value: 0 }
      }
      monthlyTrend[month].count += 1
      monthlyTrend[month].value += item.estimatedValue
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
        item.evidence.forEach(evidence => {
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

    // Recent activity (simulated based on creation dates)
    const recentActivity = items
      .map(item => ({
        type: 'item_added' as const,
        description: `Added "${item.name}" - $${item.estimatedValue.toLocaleString()}`,
        date: new Date(item.createdAt)
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)

    setAnalyticsData({
      totalValue,
      itemCount,
      averageValue,
      categories,
      monthlyTrend,
      evidenceStats,
      topItems,
      recentActivity
    })
  }, [items])

  if (!analyticsData) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            padding: '32px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            color: 'white',
            position: 'relative',
            flexShrink: 0
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

            <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
              📊 Analytics Dashboard
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Comprehensive analysis of stolen items and evidence
            </p>
          </div>

          {/* Content */}
          <div style={{
            padding: '64px 32px',
            textAlign: 'center',
            flex: 1
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              No Data Available
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              No items found for analytics. Add some stolen items to see comprehensive analysis.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            flexShrink: 0
          }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
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
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercent = (value: number, total: number) => ((value / total) * 100).toFixed(1)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          padding: '32px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          color: 'white',
          position: 'relative',
          flexShrink: 0
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

          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            📊 Analytics Dashboard
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Comprehensive analysis of stolen items and evidence
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          padding: '24px 32px 0 32px',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📈' },
              { id: 'trends', label: 'Trends', icon: '📊' },
              { id: 'categories', label: 'Categories', icon: '📂' },
              { id: 'evidence', label: 'Evidence', icon: '📎' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  color: activeTab === tab.id ? '#7c3aed' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px'
        }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Key Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {analyticsData.itemCount}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    Total Items
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {formatCurrency(analyticsData.totalValue)}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    Total Value
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {formatCurrency(analyticsData.averageValue)}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    Average Value
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {analyticsData.evidenceStats.totalEvidence}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    Evidence Files
                  </div>
                </div>
              </div>

              {/* Top Items */}
              <div style={{
                background: '#f9fafb',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  🏆 Top Items by Value
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analyticsData.topItems.map((item, index) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'white',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          borderRadius: '50%',
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
                          <div style={{
                            fontWeight: '600',
                            color: '#1f2937',
                            fontSize: '16px'
                          }}>
                            {item.name}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            {item.category || 'other'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: '700',
                          color: '#1f2937',
                          fontSize: '16px'
                        }}>
                          {formatCurrency(item.estimatedValue)}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {item.evidence?.length || 0} evidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{
                background: '#f9fafb',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  🕒 Recent Activity
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '256px',
                  overflowY: 'auto'
                }}>
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%'
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          color: '#1f2937',
                          marginBottom: '2px'
                        }}>
                          {activity.description}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {activity.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* Monthly Trend */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Monthly Trends</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.monthlyTrend).map(([month, data]) => (
                    <div key={month} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{month}</span>
                        <span className="text-sm text-gray-600">{data.count} items • {formatCurrency(data.value)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${formatPercent(data.value, analyticsData.totalValue)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Category Breakdown */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📂 Category Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analyticsData.categories).map(([category, data]) => (
                    <div key={category} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{category}</h4>
                          <p className="text-sm text-gray-600">{data.count} items</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(data.value)}</div>
                          <div className="text-sm text-gray-600">{formatPercent(data.value, analyticsData.totalValue)}% of total</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${formatPercent(data.value, analyticsData.totalValue)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Evidence Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{analyticsData.evidenceStats.photosCount}</div>
                  <div className="text-pink-100">📸 Photos</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{analyticsData.evidenceStats.videosCount}</div>
                  <div className="text-red-100">🎥 Videos</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{analyticsData.evidenceStats.documentsCount}</div>
                  <div className="text-indigo-100">📄 Documents</div>
                </div>
              </div>

              {/* Evidence Distribution */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Evidence Distribution</h3>
                <div className="space-y-4">
                  {[
                    { type: 'Photos', count: analyticsData.evidenceStats.photosCount, color: 'from-pink-500 to-pink-600' },
                    { type: 'Videos', count: analyticsData.evidenceStats.videosCount, color: 'from-red-500 to-red-600' },
                    { type: 'Documents', count: analyticsData.evidenceStats.documentsCount, color: 'from-indigo-500 to-indigo-600' }
                  ].map(({ type, count, color }) => (
                    <div key={type} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{type}</span>
                        <span className="text-sm text-gray-600">{count} files</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${analyticsData.evidenceStats.totalEvidence > 0 ? formatPercent(count, analyticsData.evidenceStats.totalEvidence) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
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
  )
}
