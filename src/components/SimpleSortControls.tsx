'use client'

import { useState } from 'react'

export type SortField = 'name' | 'value' | 'date' | 'category' | 'serialNumber' | 'location' | 'evidence'
export type SortOrder = 'asc' | 'desc'

interface SimpleSortControlsProps {
  onSortChange: (field: SortField, order: SortOrder) => void
  currentField?: SortField
  currentOrder?: SortOrder
  showLabel?: boolean
}

export function SimpleSortControls({ 
  onSortChange, 
  currentField = 'value', 
  currentOrder = 'desc', 
  showLabel = true 
}: SimpleSortControlsProps) {
  const [sortField, setSortField] = useState<SortField>(currentField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(currentOrder)

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field)
    onSortChange(field, sortOrder)
  }

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    onSortChange(sortField, newOrder)
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px'
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
        onClick={handleSortOrderChange}
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
