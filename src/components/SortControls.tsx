'use client'

import { useState } from 'react'

export type SortField = 'name' | 'value' | 'date' | 'category' | 'serialNumber' | 'location' | 'evidence'
export type SortOrder = 'asc' | 'desc'

interface SortControlsProps {
  items: any[]
  onSortChange: (sortedItems: any[]) => void
  className?: string
  showLabel?: boolean
}

export function SortControls({ items, onSortChange, className = '', showLabel = true }: SortControlsProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Safety check - don't render if onSortChange is not a function
  if (typeof onSortChange !== 'function') {
    console.warn('SortControls: onSortChange is not a function')
    return null
  }

  const sortItems = (field: SortField, order: SortOrder) => {
    // Safety check for items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return
    }

    const sorted = [...items].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (field) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'value':
          aValue = a.estimatedValue || 0
          bValue = b.estimatedValue || 0
          break
        case 'date':
          aValue = new Date(a.dateLastSeen || a.createdAt || 0)
          bValue = new Date(b.dateLastSeen || b.createdAt || 0)
          break
        case 'category':
          aValue = a.category?.toLowerCase() || 'uncategorized'
          bValue = b.category?.toLowerCase() || 'uncategorized'
          break
        case 'serialNumber':
          aValue = a.serialNumber?.toLowerCase() || ''
          bValue = b.serialNumber?.toLowerCase() || ''
          break
        case 'location':
          aValue = a.locationLastSeen?.toLowerCase() || ''
          bValue = b.locationLastSeen?.toLowerCase() || ''
          break
        case 'evidence':
          aValue = (a.evidence?.length || 0)
          bValue = (b.evidence?.length || 0)
          break
        default:
          return 0
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })

    onSortChange(sorted)
  }

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field)
    sortItems(field, sortOrder)
  }

  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order)
    sortItems(sortField, order)
  }

  const getSortFieldLabel = (field: SortField) => {
    switch (field) {
      case 'name': return 'Name'
      case 'value': return 'Value'
      case 'date': return 'Date'
      case 'category': return 'Category'
      case 'serialNumber': return 'Serial Number'
      case 'location': return 'Location'
      case 'evidence': return 'Evidence Count'
      default: return 'Name'
    }
  }

  // Don't render if items are not available
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      ...(className && { className })
    }}>
      {showLabel && (
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Sort by:
        </span>
      )}
      
      <select
        value={sortField}
        onChange={(e) => handleSortFieldChange(e.target.value as SortField)}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: '140px'
        }}
      >
        <option value="name">Name</option>
        <option value="value">Value</option>
        <option value="date">Date Last Seen</option>
        <option value="category">Category</option>
        <option value="serialNumber">Serial Number</option>
        <option value="location">Location</option>
        <option value="evidence">Evidence Count</option>
      </select>

      <button
        onClick={() => handleSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'white'
        }}
        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        {sortOrder === 'asc' ? (
          <>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Asc
          </>
        ) : (
          <>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Desc
          </>
        )}
      </button>
    </div>
  )
}
