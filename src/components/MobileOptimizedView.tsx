'use client'

import { useState, useEffect } from 'react'
import { StolenItem, User } from '@/types'
import { getRoleDisplayName } from '@/lib/auth'

interface MobileOptimizedViewProps {
  items: StolenItem[]
  user: User | null
  onItemClick: (item: StolenItem) => void
  onAddItem: () => void
  onUploadEvidence: (item: StolenItem) => void
  onManageEvidence: (item: StolenItem) => void
  onEditItem: (item: StolenItem) => void
  onDeleteItem: (item: StolenItem) => void
  canEdit: boolean
  canDelete: boolean
  canUpload: boolean
  loading?: boolean
}

export function MobileOptimizedView({
  items,
  user,
  onItemClick,
  onAddItem,
  onUploadEvidence,
  onManageEvidence,
  onEditItem,
  onDeleteItem,
  canEdit,
  canDelete,
  canUpload,
  loading = false
}: MobileOptimizedViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date'>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || 
                             ((item.category || 'other').toLowerCase() === selectedCategory.toLowerCase())
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'value':
          return b.estimatedValue - a.estimatedValue
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category || 'other').filter(Boolean)))]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getEvidenceCount = (item: StolenItem) => {
    return item.evidence?.length || 0
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 16px 16px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                animation: 'pulse 2s infinite'
              }}
            >
              <div style={{
                width: '100%',
                height: '20px',
                background: '#e5e7eb',
                borderRadius: '10px',
                marginBottom: '12px'
              }}></div>
              <div style={{
                width: '70%',
                height: '16px',
                background: '#e5e7eb',
                borderRadius: '8px',
                marginBottom: '8px'
              }}></div>
              <div style={{
                width: '50%',
                height: '14px',
                background: '#e5e7eb',
                borderRadius: '7px'
              }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '80px 0 100px' }}>
      {/* Search and Filters */}
      <div style={{ padding: '0 16px 16px' }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '16px'
        }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#9ca3af'
          }}>
            🔍
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: showFilters ? '#3b82f6' : 'white',
            color: showFilters ? 'white' : '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <span>🔧</span>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters */}
        {showFilters && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Category Filter */}
            <div style={{ marginBottom: '16px' }}>
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : (category || '').charAt(0).toUpperCase() + (category || '').slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="date">Date Added</option>
                <option value="name">Name</option>
                <option value="value">Value</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      <div style={{ padding: '0 16px' }}>
        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {searchQuery ? 'No items found' : 'No items yet'}
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add your first stolen item to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={onAddItem}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ➕ Add First Item
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Item Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px'
                  }}>
                    {formatCurrency(item.estimatedValue)}
                  </div>
                </div>

                {/* Item Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Serial:</span> {item.serialNumber || 'N/A'}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Added:</span> {formatDate(item.createdAt)}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Last Seen:</span> {item.locationLastSeen}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>Evidence:</span> {getEvidenceCount(item)} files
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => onItemClick(item)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '80px'
                    }}
                  >
                    👁️ View
                  </button>

                  {canUpload && (
                    <button
                      onClick={() => onUploadEvidence(item)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📸
                    </button>
                  )}

                  <button
                    onClick={() => onManageEvidence(item)}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#d97706',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📁
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onAddItem}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 100
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.5)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
        }}
      >
        ➕
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
