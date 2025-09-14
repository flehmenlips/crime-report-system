'use client'

import { StolenItem } from '@/types'

interface DataVisualizationProps {
  items: StolenItem[]
  totalValue: number
}

export function DataVisualization({ items, totalValue }: DataVisualizationProps) {
  // Calculate data for visualizations
  const categoryData = items.reduce((acc, item) => {
    const category = item.serialNumber?.includes('JD') ? 'John Deere' :
                    item.serialNumber?.includes('CIH') ? 'Case IH' :
                    item.serialNumber?.includes('KK') ? 'Kuhn Krause' :
                    item.serialNumber?.includes('NH') ? 'New Holland' :
                    item.serialNumber?.includes('F') ? 'Fendt' : 'Other'
    
    acc[category] = (acc[category] || 0) + item.estimatedValue
    return acc
  }, {} as Record<string, number>)

  const maxValue = Math.max(...Object.values(categoryData))

  const valueRanges = [
    { range: '$0 - $100K', count: items.filter(i => i.estimatedValue < 100000).length, color: 'bg-blue-500' },
    { range: '$100K - $300K', count: items.filter(i => i.estimatedValue >= 100000 && i.estimatedValue < 300000).length, color: 'bg-green-500' },
    { range: '$300K+', count: items.filter(i => i.estimatedValue >= 300000).length, color: 'bg-red-500' }
  ]

  const photoCount = items.reduce((sum, item) => sum + item.evidence?.filter(e => e.type === 'photo')?.length, 0) ?? 0
  const videoCount = items.reduce((sum, item) => sum + item.evidence?.filter(e => e.type === 'video')?.length, 0) ?? 0
  const documentCount = items.reduce((sum, item) => sum + item.evidence?.filter(e => e.type === 'document')?.length, 0) ?? 0

  const evidenceStats = [
    { type: 'Photos', count: photoCount, icon: '📷', color: 'blue' },
    { type: 'Videos', count: videoCount, icon: '🎥', color: 'green' },
    { type: 'Documents', count: documentCount, icon: '📄', color: 'orange' }
  ]

  return (
    <div className="space-y-8">
      {/* Value Distribution Chart */}
      <div className="card-modern p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Value Distribution by Brand</h3>
        <div className="space-y-4">
          {Object.entries(categoryData).map(([category, value]) => (
            <div key={category} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{category}</span>
                <span className="font-bold text-green-600">${value.toLocaleString()}</span>
              </div>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {((value / totalValue) * 100).toFixed(1)}% of total value
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Range Analysis */}
      <div className="card-modern p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Items by Value Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valueRanges.map((range, index) => (
            <div key={index} className="text-center group">
              <div className={`w-20 h-20 ${range.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300`}>
                <span className="text-white text-2xl font-bold">{range.count}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{range.range}</h4>
              <p className="text-sm text-gray-600">{range.count} items</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Overview */}
      <div className="card-modern p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Evidence Collection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evidenceStats.map((stat, index) => (
            <div key={index} className="group">
              <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'green' ? 'from-green-500 to-green-600' :
                  'from-orange-500 to-orange-600'
                } rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.count}</div>
                  <div className="text-gray-600 font-medium">{stat.type}</div>
                  <div className="text-sm text-gray-500">
                    {(stat.count / Math.max(items.length, 1)).toFixed(1)} avg per item
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      <div className="card-modern p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Theft Timeline</h3>
        <div className="space-y-4">
          {items
            .sort((a, b) => new Date(a.dateLastSeen).getTime() - new Date(b.dateLastSeen).getTime())
            .map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(item.dateLastSeen).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.locationLastSeen}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">${item.estimatedValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {item.evidence?.filter(e => e.type === 'photo')?.length + 
                   item.evidence?.filter(e => e.type === 'video')?.length + 
                   item.evidence?.filter(e => e.type === 'document')?.length} evidence
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
