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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg">No data available for analytics</p>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercent = (value: number, total: number) => ((value / total) * 100).toFixed(1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📈' },
            { id: 'trends', label: 'Trends', icon: '📊' },
            { id: 'categories', label: 'Categories', icon: '📂' },
            { id: 'evidence', label: 'Evidence', icon: '📎' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{analyticsData.itemCount}</div>
                  <div className="text-blue-100">Total Items</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{formatCurrency(analyticsData.totalValue)}</div>
                  <div className="text-green-100">Total Value</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{formatCurrency(analyticsData.averageValue)}</div>
                  <div className="text-purple-100">Average Value</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                  <div className="text-3xl font-bold">{analyticsData.evidenceStats.totalEvidence}</div>
                  <div className="text-orange-100">Evidence Files</div>
                </div>
              </div>

              {/* Top Items */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Items by Value</h3>
                <div className="space-y-3">
                  {analyticsData.topItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category || 'other'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(item.estimatedValue)}</div>
                        <div className="text-sm text-gray-600">{item.evidence?.length || 0} evidence</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🕒 Recent Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{activity.description}</div>
                        <div className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</div>
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
      </div>
    </div>
  )
}
