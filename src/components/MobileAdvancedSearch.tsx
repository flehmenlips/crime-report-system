'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { StolenItem } from '@/types'
import { useCategories } from '@/hooks/useCategories'

interface MobileAdvancedSearchProps {
  items: StolenItem[]
  user?: any
  evidenceCache?: Record<string, any[]> // Optional evidence cache for filtering
}

interface SearchFilters {
  name: string
  description: string
  category: string
  tags: string[]
  serialNumber: string
  minValue: number | null
  maxValue: number | null
  dateLastSeenFrom: string
  dateLastSeenTo: string
  purchaseDateFrom: string
  purchaseDateTo: string
  location: string
  hasPhotos: boolean | null
  hasVideos: boolean | null
  hasDocuments: boolean | null
}

export function MobileAdvancedSearch({ items, user, evidenceCache }: MobileAdvancedSearchProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    description: '',
    category: '',
    tags: [],
    serialNumber: '',
    minValue: null,
    maxValue: null,
    dateLastSeenFrom: '',
    dateLastSeenTo: '',
    purchaseDateFrom: '',
    purchaseDateTo: '',
    location: '',
    hasPhotos: null,
    hasVideos: null,
    hasDocuments: null
  })

  const [searchResultsState, setSearchResultsState] = useState<StolenItem[]>([])
  const [showResults, setShowResults] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Get categories from API (includes all categories, even those without items)
  const { categories: apiCategories, loading: categoriesLoading } = useCategories(user?.tenant?.id)
  
  useEffect(() => {
    // Extract unique categories and tags from items
    const itemCategories = new Set<string>()
    const tags = new Set<string>()
    
    items.forEach(item => {
      if (item.category) {
        itemCategories.add(item.category)
      }
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => tags.add(tag))
      }
    })
    
    // Combine API categories with item categories
    const allCategories = new Set<string>()
    apiCategories.forEach(cat => allCategories.add(cat.name))
    itemCategories.forEach(cat => allCategories.add(cat))
    
    setAvailableCategories(Array.from(allCategories).sort())
    setAvailableTags(Array.from(tags).sort())
  }, [items, apiCategories])

  // Memoized search results for performance
  const searchResults = useMemo(() => {
    if (!showResults) return []
    
    console.log('🔍 Mobile Advanced Search - Starting search with filters:', filters)
    const startTime = performance.now()
    
    const results = items.filter(item => {
      try {
        // Name filter with null safety
        if (filters.name && filters.name.trim()) {
          const searchName = filters.name.toLowerCase().trim()
          const itemName = (item.name || '').toLowerCase()
          if (!itemName.includes(searchName)) {
            return false
          }
        }

        // Description filter with null safety
        if (filters.description && filters.description.trim()) {
          const searchDescription = filters.description.toLowerCase().trim()
          const itemDescription = (item.description || '').toLowerCase()
          if (!itemDescription.includes(searchDescription)) {
            return false
          }
        }

        // Serial number filter with null safety
        if (filters.serialNumber && filters.serialNumber.trim()) {
          const searchSerial = filters.serialNumber.toLowerCase().trim()
          const itemSerial = (item.serialNumber || '').toLowerCase()
          if (!itemSerial.includes(searchSerial)) {
            return false
          }
        }

        // Category filter with null safety
        if (filters.category && filters.category.trim()) {
          const itemCategory = (item.category || '').toLowerCase()
          const searchCategory = filters.category.toLowerCase()
          if (itemCategory !== searchCategory) {
            return false
          }
        }

        // Value range filters with null safety
        if (filters.minValue !== null && filters.minValue !== undefined) {
          if ((item.estimatedValue || 0) < filters.minValue) {
            return false
          }
        }
        if (filters.maxValue !== null && filters.maxValue !== undefined) {
          if ((item.estimatedValue || 0) > filters.maxValue) {
            return false
          }
        }

        // Date range filters with null safety
        if (filters.dateLastSeenFrom && filters.dateLastSeenFrom.trim()) {
          const itemDate = new Date(item.dateLastSeen || item.createdAt || 0)
          const fromDate = new Date(filters.dateLastSeenFrom)
          if (itemDate < fromDate) {
            return false
          }
        }
        if (filters.dateLastSeenTo && filters.dateLastSeenTo.trim()) {
          const itemDate = new Date(item.dateLastSeen || item.createdAt || 0)
          const toDate = new Date(filters.dateLastSeenTo)
          if (itemDate > toDate) {
            return false
          }
        }

        // Location filter with null safety
        if (filters.location && filters.location.trim()) {
          const searchLocation = filters.location.toLowerCase().trim()
          const itemLocation = (item.locationLastSeen || '').toLowerCase()
          if (!itemLocation.includes(searchLocation)) {
            return false
          }
        }

        // Evidence filters with null safety - use evidenceCache if available, fallback to item.evidence
        if (filters.hasPhotos === true) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const photoCount = itemEvidence.filter(e => e.type === 'photo').length
          if (photoCount === 0) return false
        }
        if (filters.hasPhotos === false) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const photoCount = itemEvidence.filter(e => e.type === 'photo').length
          if (photoCount > 0) return false
        }
        if (filters.hasVideos === true) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const videoCount = itemEvidence.filter(e => e.type === 'video').length
          if (videoCount === 0) return false
        }
        if (filters.hasVideos === false) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const videoCount = itemEvidence.filter(e => e.type === 'video').length
          if (videoCount > 0) return false
        }
        if (filters.hasDocuments === true) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const docCount = itemEvidence.filter(e => e.type === 'document').length
          if (docCount === 0) return false
        }
        if (filters.hasDocuments === false) {
          const itemEvidence = evidenceCache && evidenceCache[item.id] ? evidenceCache[item.id] : (item.evidence || [])
          const docCount = itemEvidence.filter(e => e.type === 'document').length
          if (docCount > 0) return false
        }

        return true
      } catch (error) {
        console.error('Error filtering item:', item.id, error)
        return false
      }
    })

    const endTime = performance.now()
    const searchTime = endTime - startTime
    
    console.log(`✅ MOBILE SEARCH COMPLETED: ${results.length} results in ${searchTime.toFixed(2)}ms`)

    return results
  }, [items, filters, showResults, evidenceCache])

  const performSearch = () => {
    setShowResults(true)
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      description: '',
      category: '',
      tags: [],
      serialNumber: '',
      minValue: null,
      maxValue: null,
      dateLastSeenFrom: '',
      dateLastSeenTo: '',
      purchaseDateFrom: '',
      purchaseDateTo: '',
      location: '',
      hasPhotos: null,
      hasVideos: null,
      hasDocuments: null
    })
    setShowResults(false)
  }

  const toggleEvidenceFilter = (type: 'hasPhotos' | 'hasVideos' | 'hasDocuments') => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === true ? false : (prev[type] === false ? null : true)
    }))
  }

  const getEvidenceFilterLabel = (type: 'hasPhotos' | 'hasVideos' | 'hasDocuments') => {
    const value = filters[type]
    if (value === true) return '✓ Has'
    if (value === false) return '✗ No'
    return 'Any'
  }

  const getEvidenceFilterColor = (type: 'hasPhotos' | 'hasVideos' | 'hasDocuments') => {
    const value = filters[type]
    if (value === true) return '#10b981'
    if (value === false) return '#ef4444'
    return '#6b7280'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: '0',
        zIndex: '100',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
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
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0',
            color: '#1f2937'
          }}>
            🔍 Advanced Search
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0'
          }}>
            Find items using multiple criteria
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Basic Search */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              🔍 Basic Search
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Item Name
                </label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                  placeholder="Search by item name..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={filters.description}
                  onChange={(e) => setFilters({...filters, description: e.target.value})}
                  placeholder="Search in descriptions..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Serial Number
                </label>
                <input
                  type="text"
                  value={filters.serialNumber}
                  onChange={(e) => setFilters({...filters, serialNumber: e.target.value})}
                  placeholder="Search by serial number..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Location Last Seen
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  placeholder="Search by location..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              🎛️ Advanced Filters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Value Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={filters.minValue || ''}
                    onChange={(e) => setFilters({...filters, minValue: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="$0"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={filters.maxValue || ''}
                    onChange={(e) => setFilters({...filters, maxValue: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="$999,999"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateLastSeenFrom}
                    onChange={(e) => setFilters({...filters, dateLastSeenFrom: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateLastSeenTo}
                    onChange={(e) => setFilters({...filters, dateLastSeenTo: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Evidence Requirements */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  Evidence Requirements
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => toggleEvidenceFilter('hasPhotos')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📷</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Has Photos</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: getEvidenceFilterColor('hasPhotos') }}>
                      {getEvidenceFilterLabel('hasPhotos')}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleEvidenceFilter('hasVideos')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🎥</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Has Videos</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: getEvidenceFilterColor('hasVideos') }}>
                      {getEvidenceFilterLabel('hasVideos')}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleEvidenceFilter('hasDocuments')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📄</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Has Documents</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: getEvidenceFilterColor('hasDocuments') }}>
                      {getEvidenceFilterLabel('hasDocuments')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div style={{
          background: 'white',
          margin: '16px',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            🔍 Search Results: {searchResults.length} items found
          </h3>
          
          {searchResults.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280'
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
              <p>No items match your search criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {searchResults.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    router.push(`/item/${item.id}`)
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      ${item.estimatedValue.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    {item.description || 'No description'}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>📁 {item.category || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fixed Footer */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: '100'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          <button
            onClick={clearFilters}
            style={{
              padding: '14px 24px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Clear All
          </button>
          <button
            onClick={performSearch}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            🔍 Search ({items.length} items)
          </button>
        </div>
      </div>
    </div>
  )
}
