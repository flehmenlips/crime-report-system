'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'
import { useCategories } from '@/hooks/useCategories'

interface AnalyticsDashboardProps {
  items: StolenItem[]
  onClose: () => void
  user?: any
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

export function AnalyticsDashboard({ items, onClose, user }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'evidence'>('overview')
  
  // Get all available categories from API
  const { categories: availableCategories } = useCategories(user?.tenant?.id)

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Monthly Trend */}
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
                  📈 Monthly Trends
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.entries(analyticsData.monthlyTrend)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([month, data]) => (
                    <div key={month} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          fontSize: '16px'
                        }}>
                          {month}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}>
                            {data.count} items
                          </span>
                          <span style={{
                            fontSize: '14px',
                            color: '#059669',
                            fontWeight: '700'
                          }}>
                            {formatCurrency(data.value)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        background: '#e5e7eb',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                            height: '100%',
                            borderRadius: '8px',
                            transition: 'width 0.5s ease',
                            width: `${formatPercent(data.value, analyticsData.totalValue)}%`
                          }}
                        ></div>
                      </div>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#6b7280',
                        textAlign: 'right'
                      }}>
                        {formatPercent(data.value, analyticsData.totalValue)}% of total value
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Summary */}
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
                  📊 Trend Analysis
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {Object.keys(analyticsData.monthlyTrend).length}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Active Months
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#059669',
                      marginBottom: '4px'
                    }}>
                      {formatCurrency(
                        Object.values(analyticsData.monthlyTrend)
                          .reduce((sum, data) => sum + data.value, 0) / 
                        Object.keys(analyticsData.monthlyTrend).length
                      )}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Avg Monthly Value
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#dc2626',
                      marginBottom: '4px'
                    }}>
                      {Math.max(...Object.values(analyticsData.monthlyTrend).map(d => d.count))}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Peak Items/Month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Category Breakdown */}
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
                  📂 Category Analysis
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {availableCategories
                    .map(cat => {
                      const itemData = analyticsData.categories[cat.name]
                      return {
                        name: cat.name,
                        description: cat.description,
                        isSystem: cat.isSystem,
                        count: itemData?.count || 0,
                        value: itemData?.value || 0
                      }
                    })
                    .sort((a, b) => b.value - a.value)
                    .map((category) => (
                    <div key={category} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      position: 'relative'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{
                              fontWeight: '600',
                              color: '#1f2937',
                              fontSize: '16px',
                              margin: 0,
                              textTransform: 'capitalize'
                            }}>
                              {category.name}
                            </h4>
                            {category.isSystem && (
                              <span style={{
                                background: '#f3f4f6',
                                color: '#6b7280',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                SYSTEM
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p style={{
                              fontSize: '12px',
                              color: '#9ca3af',
                              margin: '0 0 8px 0',
                              fontStyle: 'italic'
                            }}>
                              {category.description}
                            </p>
                          )}
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {category.count} {category.count === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontWeight: '700',
                            color: '#1f2937',
                            fontSize: '16px',
                            marginBottom: '2px'
                          }}>
                            {formatCurrency(data.value)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#059669',
                            fontWeight: '600',
                            background: '#dcfce7',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {formatPercent(data.value, analyticsData.totalValue)}% of total
                          </div>
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        background: '#e5e7eb',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{
                            background: 'linear-gradient(135deg, #059669 0%, #3b82f6 100%)',
                            height: '100%',
                            borderRadius: '8px',
                            transition: 'width 0.5s ease',
                            width: `${formatPercent(data.value, analyticsData.totalValue)}%`
                          }}
                        ></div>
                      </div>
                      <div style={{
                        marginTop: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <span>Avg: {formatCurrency(data.value / data.count)}</span>
                        <span>{data.count} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Summary */}
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
                  📊 Category Summary
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {Object.keys(analyticsData.categories).length}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Total Categories
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#059669',
                      marginBottom: '4px'
                    }}>
                      {Object.entries(analyticsData.categories)
                        .sort(([,a], [,b]) => b.value - a.value)[0]?.[0] || 'N/A'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Top Category
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#dc2626',
                      marginBottom: '4px'
                    }}>
                      {Math.max(...Object.values(analyticsData.categories).map(d => d.count))}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Most Items/Category
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Evidence Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {analyticsData.evidenceStats.photosCount}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    📸 Photos
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {analyticsData.evidenceStats.videosCount}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    🎥 Videos
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
                    {analyticsData.evidenceStats.documentsCount}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600' }}>
                    📄 Documents
                  </div>
                </div>
              </div>

              {/* Evidence Distribution */}
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
                  📊 Evidence Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { 
                      type: 'Photos', 
                      count: analyticsData.evidenceStats.photosCount, 
                      color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      icon: '📸'
                    },
                    { 
                      type: 'Videos', 
                      count: analyticsData.evidenceStats.videosCount, 
                      color: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      icon: '🎥'
                    },
                    { 
                      type: 'Documents', 
                      count: analyticsData.evidenceStats.documentsCount, 
                      color: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      icon: '📄'
                    }
                  ].map(({ type, count, color, icon }) => (
                    <div key={type} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '20px' }}>{icon}</span>
                          <span style={{
                            fontWeight: '600',
                            color: '#1f2937',
                            fontSize: '16px'
                          }}>
                            {type}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          background: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          {count} {count === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        background: '#e5e7eb',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{
                            background: color,
                            height: '100%',
                            borderRadius: '8px',
                            transition: 'width 0.5s ease',
                            width: `${analyticsData.evidenceStats.totalEvidence > 0 ? formatPercent(count, analyticsData.evidenceStats.totalEvidence) : 0}%`
                          }}
                        ></div>
                      </div>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#6b7280',
                        textAlign: 'right'
                      }}>
                        {analyticsData.evidenceStats.totalEvidence > 0 ? formatPercent(count, analyticsData.evidenceStats.totalEvidence) : 0}% of total evidence
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Summary */}
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
                  📈 Evidence Summary
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {analyticsData.evidenceStats.totalEvidence}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Total Evidence Files
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#059669',
                      marginBottom: '4px'
                    }}>
                      {analyticsData.evidenceStats.totalEvidence > 0 
                        ? (analyticsData.evidenceStats.totalEvidence / analyticsData.itemCount).toFixed(1)
                        : '0'
                      }
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Avg Files/Item
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#dc2626',
                      marginBottom: '4px'
                    }}>
                      {analyticsData.evidenceStats.totalEvidence > 0 
                        ? Math.max(analyticsData.evidenceStats.photosCount, analyticsData.evidenceStats.videosCount, analyticsData.evidenceStats.documentsCount)
                        : '0'
                      }
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      Most Common Type
                    </div>
                  </div>
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
