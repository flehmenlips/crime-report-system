'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function SearchPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [allItems, setAllItems] = useState<StolenItem[]>([])
  const [results, setResults] = useState<StolenItem[]>([])
  const [searchExecuted, setSearchExecuted] = useState(false)

  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    category: '',
    minValue: '',
    maxValue: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  })

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load all items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/items')
        if (response.ok) {
          const data = await response.json()
          setAllItems(data.items || [])
        }
      } catch (err) {
        console.error('Failed to load items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const handleSearch = () => {
    setSearching(true)
    setSearchExecuted(true)

    let filtered = [...allItems]

    // Keyword search
    if (searchCriteria.keyword) {
      const keyword = searchCriteria.keyword.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.serialNumber?.toLowerCase().includes(keyword)
      )
    }

    // Category filter
    if (searchCriteria.category) {
      filtered = filtered.filter(item => item.category === searchCriteria.category)
    }

    // Value range
    if (searchCriteria.minValue) {
      filtered = filtered.filter(item => item.estimatedValue >= parseFloat(searchCriteria.minValue))
    }
    if (searchCriteria.maxValue) {
      filtered = filtered.filter(item => item.estimatedValue <= parseFloat(searchCriteria.maxValue))
    }

    // Date range
    if (searchCriteria.dateFrom) {
      filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(searchCriteria.dateFrom))
    }
    if (searchCriteria.dateTo) {
      filtered = filtered.filter(item => new Date(item.createdAt) <= new Date(searchCriteria.dateTo))
    }

    setResults(filtered)
    setSearching(false)
  }

  const handleClear = () => {
    setSearchCriteria({
      keyword: '',
      category: '',
      minValue: '',
      maxValue: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    })
    setResults([])
    setSearchExecuted(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      paddingBottom: isMobile ? '140px' : '48px'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
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
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            Advanced Search
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px 16px' : '32px'
          }}>
            {/* Search Form */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🔍 Keyword Search
                </label>
                <input
                  type="text"
                  value={searchCriteria.keyword}
                  onChange={(e) => setSearchCriteria({...searchCriteria, keyword: e.target.value})}
                  placeholder="Search by name, description, or serial number..."
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    💰 Min Value
                  </label>
                  <input
                    type="number"
                    value={searchCriteria.minValue}
                    onChange={(e) => setSearchCriteria({...searchCriteria, minValue: e.target.value})}
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    💰 Max Value
                  </label>
                  <input
                    type="number"
                    value={searchCriteria.maxValue}
                    onChange={(e) => setSearchCriteria({...searchCriteria, maxValue: e.target.value})}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    📅 Date From
                  </label>
                  <input
                    type="date"
                    value={searchCriteria.dateFrom}
                    onChange={(e) => setSearchCriteria({...searchCriteria, dateFrom: e.target.value})}
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    📅 Date To
                  </label>
                  <input
                    type="date"
                    value={searchCriteria.dateTo}
                    onChange={(e) => setSearchCriteria({...searchCriteria, dateTo: e.target.value})}
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

            {/* Search Results */}
            {searchExecuted && (
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  🔍 Search Results: {results.length} items found
                </h3>
                {results.length === 0 ? (
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
                    {results.map(item => (
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
                          // Navigate back with the search results
                          router.back()
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
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: isMobile ? '16px' : '20px 32px',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={handleClear}
            style={{
              padding: '14px 24px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: isMobile ? 'none' : 1
            }}
          >
            🔄 Clear
          </button>
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              padding: '14px 24px',
              background: searching ? 'rgba(6, 182, 212, 0.7)' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: searching ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
              flex: isMobile ? 'none' : 2,
              opacity: searching ? 0.7 : 1
            }}
          >
            {searching ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>
      </div>
    </div>
  )
}

