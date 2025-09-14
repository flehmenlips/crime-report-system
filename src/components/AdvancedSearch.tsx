'use client'

import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

interface AdvancedSearchProps {
  items: StolenItem[]
  onClose: () => void
  onResults: (filteredItems: StolenItem[]) => void
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

export function AdvancedSearch({ items, onClose, onResults }: AdvancedSearchProps) {
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

  const [searchResults, setSearchResults] = useState<StolenItem[]>([])
  const [showResults, setShowResults] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    // Extract unique categories and tags from items
    const categories = new Set<string>()
    const tags = new Set<string>()
    
    items.forEach(item => {
      if ((item as any).category) {
        categories.add((item as any).category)
      }
      if ((item as any).tags && Array.isArray((item as any).tags)) {
        (item as any).tags.forEach((tag: string) => tags.add(tag))
      }
    })
    
    setAvailableCategories(Array.from(categories).sort())
    setAvailableTags(Array.from(tags).sort())
  }, [items])

  const performSearch = () => {
    const results = items.filter(item => {
      // Name filter
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false
      }

      // Description filter
      if (filters.description && !item.description.toLowerCase().includes(filters.description.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.category && (item as any).category !== filters.category) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const itemTags = (item as any).tags || []
        const hasAllTags = filters.tags.every(tag => itemTags.includes(tag))
        if (!hasAllTags) return false
      }

      // Serial number filter
      if (filters.serialNumber && !item.serialNumber?.toLowerCase().includes(filters.serialNumber.toLowerCase())) {
        return false
      }

      // Value range filter
      if (filters.minValue !== null && item.estimatedValue < filters.minValue) {
        return false
      }
      if (filters.maxValue !== null && item.estimatedValue > filters.maxValue) {
        return false
      }

      // Date last seen range filter
      if (filters.dateLastSeenFrom && item.dateLastSeen < filters.dateLastSeenFrom) {
        return false
      }
      if (filters.dateLastSeenTo && item.dateLastSeen > filters.dateLastSeenTo) {
        return false
      }

      // Purchase date range filter
      if (filters.purchaseDateFrom && item.purchaseDate < filters.purchaseDateFrom) {
        return false
      }
      if (filters.purchaseDateTo && item.purchaseDate > filters.purchaseDateTo) {
        return false
      }

      // Location filter
      if (filters.location && !item.locationLastSeen.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Evidence filters
      if (filters.hasPhotos === true && item.evidence?.filter(e => e.type === 'photo')?.length === 0) { return false }
      if (filters.hasPhotos === false && item.evidence?.filter(e => e.type === 'photo')?.length > 0) { return false }
      if (filters.hasVideos === true && item.evidence?.filter(e => e.type === 'video')?.length === 0) { return false }
      if (filters.hasVideos === false && item.evidence?.filter(e => e.type === 'video')?.length > 0) { return false }
      if (filters.hasDocuments === true && item.evidence?.filter(e => e.type === 'document')?.length === 0) { return false }
      if (filters.hasDocuments === false && item.evidence?.filter(e => e.type === 'document')?.length > 0) { return false }

      return true
    })

    setSearchResults(results)
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

  const applyResults = () => {
    onResults(searchResults)
    onClose()
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
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
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
            opacity: 0.1
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                🔍
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
                  Advanced Search
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', fontWeight: '500' }}>
                  Find items using multiple criteria and filters
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          {!showResults ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Basic Search */}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    Basic Search
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={filters.name}
                      onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Search by item name..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669'
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={filters.description}
                      onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Search in descriptions..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669'
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={filters.serialNumber}
                      onChange={(e) => setFilters(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="Search by serial number..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669'
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Location Last Seen
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Search by location..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669'
                        e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    Advanced Filters
                  </h3>

                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Value Range */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Value Range
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        value={filters.minValue || ''}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          minValue: e.target.value ? parseFloat(e.target.value) : null 
                        }))}
                        placeholder="Min value"
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px'
                        }}
                      />
                      <input
                        type="number"
                        value={filters.maxValue || ''}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          maxValue: e.target.value ? parseFloat(e.target.value) : null 
                        }))}
                        placeholder="Max value"
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Date Ranges */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Date Last Seen
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="date"
                        value={filters.dateLastSeenFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateLastSeenFrom: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px'
                        }}
                      />
                      <input
                        type="date"
                        value={filters.dateLastSeenTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateLastSeenTo: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Evidence Filters */}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'block' }}>
                      Evidence Requirements
                    </label>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={filters.hasPhotos === true}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            hasPhotos: e.target.checked ? true : null 
                          }))}
                          style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>Has Photos</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={filters.hasVideos === true}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            hasVideos: e.target.checked ? true : null 
                          }))}
                          style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>Has Videos</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={filters.hasDocuments === true}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            hasDocuments: e.target.checked ? true : null 
                          }))}
                          style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>Has Documents</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    Filter by Tags
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          background: filters.tags.includes(tag) 
                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            : '#f3f4f6',
                          color: filters.tags.includes(tag) ? 'white' : '#374151',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Active Filters
                </h4>
                <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
                  {Object.entries(filters).some(([key, value]) => 
                    value !== '' && value !== null && (Array.isArray(value) ? value.length > 0 : true)
                  ) ? (
                    <div>
                      {filters.name && <div>• Name contains: "{filters.name}"</div>}
                      {filters.description && <div>• Description contains: "{filters.description}"</div>}
                      {filters.serialNumber && <div>• Serial number: "{filters.serialNumber}"</div>}
                      {filters.category && <div>• Category: {filters.category}</div>}
                      {filters.tags.length > 0 && <div>• Tags: {filters.tags.join(', ')}</div>}
                      {(filters.minValue !== null || filters.maxValue !== null) && (
                        <div>• Value: ${filters.minValue || 0} - ${filters.maxValue || '∞'}</div>
                      )}
                      {filters.location && <div>• Location contains: "{filters.location}"</div>}
                      {filters.hasPhotos === true && <div>• Must have photos</div>}
                      {filters.hasVideos === true && <div>• Must have videos</div>}
                      {filters.hasDocuments === true && <div>• Must have documents</div>}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic' }}>No active filters</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Search Results
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                  Found {searchResults.length} of {items.length} items matching your criteria
                </p>
              </div>

              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px', margin: '0 0 8px 0' }}>
                    No items found
                  </h4>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <div style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Item</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Value</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Evidence</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item, index) => (
                        <tr key={item.id} style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          background: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {item.serialNumber && `Serial: ${item.serialNumber}`}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#059669' }}>
                              ${item.estimatedValue.toLocaleString()}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {item.evidence?.filter(e => e.type === 'photo')?.length > 0 && (
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  📷 {item.evidence.filter(e => e.type === 'photo').length}
                                </span>
                              )}
                              {item.evidence?.filter(e => e.type === 'video')?.length > 0 && (
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  🎥 {item.evidence.filter(e => e.type === 'video').length}
                                </span>
                              )}
                              {item.evidence?.filter(e => e.type === 'document')?.length > 0 && (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  📄 {item.evidence.filter(e => e.type === 'document').length}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: '13px', color: '#374151' }}>
                              {new Date(item.dateLastSeen).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {item.locationLastSeen}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            {showResults && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {searchResults.length} results • Total value: ${searchResults.reduce((sum, item) => sum + item.estimatedValue, 0).toLocaleString()}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {showResults && (
              <button
                onClick={() => setShowResults(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Filters
              </button>
            )}
            
            <button
              onClick={clearFilters}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Clear All
            </button>
            
            {!showResults ? (
              <button
                onClick={performSearch}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                🔍 Search ({items.length} items)
              </button>
            ) : (
              <button
                onClick={applyResults}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                ✅ Apply Results ({searchResults.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}