'use client'

import { useState, useEffect, useMemo } from 'react'
import { StolenItem, User } from '@/types'

interface EnhancedSearchProps {
  items: StolenItem[]
  user: User | null
  onResults: (results: StolenItem[]) => void
  onClose: () => void
}

interface SearchFilters {
  query: string
  category: string
  minValue: number | ''
  maxValue: number | ''
  hasPhotos: boolean
  hasVideos: boolean
  hasDocuments: boolean
  dateRange: {
    start: string
    end: string
  }
  location: string
  sortBy: 'name' | 'value' | 'date' | 'category'
  sortOrder: 'asc' | 'desc'
}

export function EnhancedSearch({ items, user, onResults, onClose }: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    minValue: '',
    maxValue: '',
    hasPhotos: false,
    hasVideos: false,
    hasDocuments: false,
    dateRange: {
      start: '',
      end: ''
    },
    location: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Get unique categories from items
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    items.forEach(item => {
      const category = (item as any).category || 'Uncategorized'
      categorySet.add(category)
    })
    return Array.from(categorySet).sort()
  }, [items])

  // Get unique locations from items
  const locations = useMemo(() => {
    const locationSet = new Set<string>()
    items.forEach(item => {
      if (item.locationLastSeen) {
        locationSet.add(item.locationLastSeen)
      }
    })
    return Array.from(locationSet).sort()
  }, [items])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.serialNumber?.toLowerCase().includes(query) ||
        item.locationLastSeen.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = (item as any).category || 'Uncategorized'
        return itemCategory === filters.category
      })
    }

    // Value range filter
    if (filters.minValue !== '') {
      filtered = filtered.filter(item => item.estimatedValue >= filters.minValue)
    }
    if (filters.maxValue !== '') {
      filtered = filtered.filter(item => item.estimatedValue <= filters.maxValue)
    }

    // Evidence filters
    if (filters.hasPhotos) {
      filtered = filtered.filter(item => 
        item.evidence?.filter(e => e.type === 'photo')?.length > 0
      )
    }
    if (filters.hasVideos) {
      filtered = filtered.filter(item => 
        item.evidence?.filter(e => e.type === 'video')?.length > 0
      )
    }
    if (filters.hasDocuments) {
      filtered = filtered.filter(item => 
        item.evidence?.filter(e => e.type === 'document')?.length > 0
      )
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)
        const startDate = new Date(filters.dateRange.start)
        return itemDate >= startDate
      })
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)
        const endDate = new Date(filters.dateRange.end)
        return itemDate <= endDate
      })
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(item =>
        item.locationLastSeen.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
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

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [items, filters])

  // Update results when filters change
  useEffect(() => {
    onResults(filteredItems)
  }, [filteredItems, onResults])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      minValue: '',
      maxValue: '',
      hasPhotos: false,
      hasVideos: false,
      hasDocuments: false,
      dateRange: {
        start: '',
        end: ''
      },
      location: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const getTotalValue = () => {
    return filteredItems.reduce((sum, item) => sum + item.estimatedValue, 0)
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
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Enhanced Search
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0'
            }}>
              {filteredItems.length} of {items.length} items found
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '24px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Search Form */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Text Search */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Search Text
                </label>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Search by name, description, serial number..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Value Range */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Value Range
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="number"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Min"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="number"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Max"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Filter by location..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Evidence Filters */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Evidence Type
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'hasPhotos', label: 'Has Photos', icon: '📷' },
                    { key: 'hasVideos', label: 'Has Videos', icon: '🎥' },
                    { key: 'hasDocuments', label: 'Has Documents', icon: '📄' }
                  ].map(({ key, label, icon }) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      <input
                        type="checkbox"
                        checked={filters[key as keyof SearchFilters] as boolean}
                        onChange={(e) => handleFilterChange(key as keyof SearchFilters, e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#3b82f6'
                        }}
                      />
                      <span>{icon}</span>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Date Range
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Sort By
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="value">Value</option>
                    <option value="category">Category</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    style={{
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="desc">↓</option>
                    <option value="asc">↑</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Total value: ${getTotalValue().toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={clearFilters}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              }}
            >
              Apply Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
