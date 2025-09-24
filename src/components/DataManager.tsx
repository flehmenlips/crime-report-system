'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { StolenItem, User } from '@/types'
import { getAllItems, getTotalValue } from '@/lib/data'

interface DataManagerProps {
  user: User | null
  onDataUpdate?: (items: StolenItem[], totalValue: number) => void
  onLoadingChange?: (loading: boolean) => void
  onErrorChange?: (error: string | null) => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export function DataManager({ 
  user, 
  onDataUpdate, 
  onLoadingChange, 
  onErrorChange,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: DataManagerProps) {
  const [items, setItems] = useState<StolenItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Memoized statistics for performance
  const stats = useMemo(() => {
    const evidenceCount = items.reduce((total, item) => 
      total + (item.evidence?.filter(e => e.type === 'photo')?.length || 0) + 
      (item.evidence?.filter(e => e.type === 'video')?.length || 0) + 
      (item.evidence?.filter(e => e.type === 'document')?.length || 0), 0
    )
    
    const itemsWithPhotos = items.filter(item => 
      item.evidence?.filter(e => e.type === 'photo')?.length > 0
    ).length

    const recentItems = items.filter(item => {
      const itemDate = new Date(item.createdAt)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return itemDate > sevenDaysAgo
    }).length

    const categories = items.reduce((acc, item) => {
      const category = (item as any).category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return {
      totalItems: items.length,
      totalValue,
      evidenceCount,
      itemsWithPhotos,
      recentItems,
      topCategories,
      averageValue: items.length > 0 ? totalValue / items.length : 0
    }
  }, [items, totalValue])

  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setError(null)
      } else {
        setLoading(true)
        setError(null)
      }
      
      console.log('DataManager: Loading data...')
      const loadedItems = await getAllItems()
      const total = await getTotalValue()
      
      console.log('DataManager: Loaded', loadedItems.length, 'items, total value:', total)
      
      setItems(loadedItems)
      setTotalValue(total)
      setLastRefresh(new Date())
      setLoading(false)
      setError(null)
      
      if (onDataUpdate) {
        onDataUpdate(loadedItems, total)
      }
    } catch (error) {
      console.error('DataManager: Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      setError(errorMessage)
      setLoading(false)
      
      if (onErrorChange) {
        onErrorChange(errorMessage)
      }
    }
  }, [user, onDataUpdate, onErrorChange])

  const refreshData = useCallback(() => {
    loadData(true)
  }, [loadData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !user) return

    const interval = setInterval(() => {
      refreshData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshData, user])

  // Load data on mount and user change
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  // Notify parent components of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading)
    }
  }, [loading, onLoadingChange])

  // Notify parent components of error state changes
  useEffect(() => {
    if (onErrorChange) {
      onErrorChange(error)
    }
  }, [error, onErrorChange])

  // Optimized search function
  const searchItems = useCallback((query: string, filters?: {
    category?: string
    minValue?: number
    maxValue?: number
    hasPhotos?: boolean
    dateRange?: { start: string; end: string }
  }) => {
    if (!query && !filters) return items

    return items.filter(item => {
      // Text search
      if (query) {
        const searchQuery = query.toLowerCase()
        const matchesText = 
          item.name.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery) ||
          item.serialNumber?.toLowerCase().includes(searchQuery) ||
          item.locationLastSeen.toLowerCase().includes(searchQuery)
        
        if (!matchesText) return false
      }

      // Category filter
      if (filters?.category && filters.category !== 'all') {
        const itemCategory = (item as any).category || 'Uncategorized'
        if (itemCategory !== filters.category) return false
      }

      // Value range filter
      if (filters?.minValue !== undefined && item.estimatedValue < filters.minValue) return false
      if (filters?.maxValue !== undefined && item.estimatedValue > filters.maxValue) return false

      // Photos filter
      if (filters?.hasPhotos) {
        const hasPhotos = item.evidence?.filter(e => e.type === 'photo')?.length > 0
        if (!hasPhotos) return false
      }

      // Date range filter
      if (filters?.dateRange) {
        const itemDate = new Date(item.createdAt)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        if (itemDate < startDate || itemDate > endDate) return false
      }

      return true
    })
  }, [items])

  // Optimized sorting function
  const sortItems = useCallback((items: StolenItem[], sortBy: 'name' | 'value' | 'date' | 'category', order: 'asc' | 'desc' = 'asc') => {
    return [...items].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'value':
          aValue = a.estimatedValue
          bValue = b.estimatedValue
          break
        case 'date':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'category':
          aValue = (a as any).category || 'Uncategorized'
          bValue = (b as any).category || 'Uncategorized'
          break
        default:
          return 0
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
  }, [])

  // Export data function
  const exportData = useCallback((format: 'json' | 'csv' | 'summary') => {
    switch (format) {
      case 'json':
        return JSON.stringify(items, null, 2)
      
      case 'csv':
        const headers = ['Name', 'Description', 'Serial Number', 'Value', 'Category', 'Date Created', 'Location']
        const csvRows = [
          headers.join(','),
          ...items.map(item => [
            `"${item.name}"`,
            `"${item.description}"`,
            `"${item.serialNumber || ''}"`,
            item.estimatedValue,
            `"${(item as any).category || 'Uncategorized'}"`,
            new Date(item.createdAt).toLocaleDateString(),
            `"${item.locationLastSeen}"`
          ].join(','))
        ]
        return csvRows.join('\n')
      
      case 'summary':
        return {
          totalItems: stats.totalItems,
          totalValue: stats.totalValue,
          averageValue: stats.averageValue,
          evidenceCount: stats.evidenceCount,
          itemsWithPhotos: stats.itemsWithPhotos,
          recentItems: stats.recentItems,
          topCategories: stats.topCategories,
          lastRefresh: lastRefresh.toISOString()
        }
      
      default:
        return ''
    }
  }, [items, stats, lastRefresh])

  return {
    // Data
    items,
    totalValue,
    stats,
    
    // State
    loading,
    error,
    lastRefresh,
    
    // Actions
    refreshData,
    searchItems,
    sortItems,
    exportData,
    
    // Utilities
    setItems,
    setTotalValue
  }
}
