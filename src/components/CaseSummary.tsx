'use client'

import { useState, useEffect, useRef } from 'react'
import { StolenItem, User, Evidence } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { generateCaseSummaryPDF, CaseSummaryData } from '@/lib/pdf-export'

interface CaseSummaryProps {
  user: User
  items: StolenItem[]
  onClose: () => void
}

interface CaseMetrics {
  totalItems: number
  totalValue: number
  evidenceCount: number
  itemsWithPhotos: number
  itemsWithVideos: number
  itemsWithDocuments: number
  categories: { [key: string]: number }
  dateRange: { earliest: string; latest: string }
  topItemsByValue: StolenItem[]
  evidenceTypes: { [key: string]: number }
}

export function CaseSummary({ user, items, onClose }: CaseSummaryProps) {
  const [metrics, setMetrics] = useState<CaseMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateMetrics = () => {
      if (!items || items.length === 0) {
        setMetrics({
          totalItems: 0,
          totalValue: 0,
          evidenceCount: 0,
          itemsWithPhotos: 0,
          itemsWithVideos: 0,
          itemsWithDocuments: 0,
          categories: {},
          dateRange: { earliest: '', latest: '' },
          topItemsByValue: [],
          evidenceTypes: {}
        })
        setLoading(false)
        return
      }

      // Calculate basic metrics
      const totalItems = items.length
      const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
      
      // Calculate evidence metrics
      let evidenceCount = 0
      let itemsWithPhotos = 0
      let itemsWithVideos = 0
      let itemsWithDocuments = 0
      const evidenceTypes: { [key: string]: number } = {}
      
      items.forEach(item => {
        if (item.evidence && item.evidence.length > 0) {
          evidenceCount += item.evidence.length
          
          const hasPhoto = item.evidence.some(e => e.type === 'photo')
          const hasVideo = item.evidence.some(e => e.type === 'video')
          const hasDocument = item.evidence.some(e => e.type === 'document')
          
          if (hasPhoto) itemsWithPhotos++
          if (hasVideo) itemsWithVideos++
          if (hasDocument) itemsWithDocuments++
          
          item.evidence.forEach(evidence => {
            evidenceTypes[evidence.type] = (evidenceTypes[evidence.type] || 0) + 1
          })
        }
      })

      // Calculate categories
      const categories: { [key: string]: number } = {}
      items.forEach(item => {
        const category = item.category || 'other' // Handle null/undefined categories
        categories[category] = (categories[category] || 0) + 1
      })

      // Calculate date range
      const dates = items.map(item => new Date(item.dateLastSeen)).filter(date => !isNaN(date.getTime()))
      const dateRange = dates.length > 0 ? {
        earliest: new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString(),
        latest: new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString()
      } : { earliest: 'N/A', latest: 'N/A' }

      // Get top items by value
      const topItemsByValue = [...items]
        .sort((a, b) => b.estimatedValue - a.estimatedValue)
        .slice(0, 5)

      setMetrics({
        totalItems,
        totalValue,
        evidenceCount,
        itemsWithPhotos,
        itemsWithVideos,
        itemsWithDocuments,
        categories,
        dateRange,
        topItemsByValue,
        evidenceTypes
      })
      setLoading(false)
    }

    calculateMetrics()
  }, [items])

  const handleExportPDF = async () => {
    if (!metrics) return
    
    setExporting(true)
    try {
      // Generate case name from user/tenant info or use timestamp
      const caseName = user.company 
        ? `${user.company.toLowerCase().replace(/\s+/g, '-')}-case`
        : items[0]?.tenant?.name 
          ? `${items[0].tenant.name.toLowerCase().replace(/\s+/g, '-')}-case`
          : `case-${new Date().toISOString().split('T')[0]}`
      
      const pdfData: CaseSummaryData = {
        totalItems: metrics.totalItems,
        totalValue: metrics.totalValue,
        evidenceCount: metrics.evidenceCount,
        itemsWithPhotos: metrics.itemsWithPhotos,
        itemsWithVideos: metrics.itemsWithVideos,
        itemsWithDocuments: metrics.itemsWithDocuments,
        categories: metrics.categories,
        dateRange: metrics.dateRange,
        topItemsByValue: metrics.topItemsByValue.map(item => ({
          id: item.id,
          name: item.name,
          estimatedValue: item.estimatedValue,
          category: item.category
        })),
        evidenceTypes: metrics.evidenceTypes,
        generatedBy: user.name,
        generatedAt: new Date().toLocaleString(),
        caseName: caseName
      }
      
      await generateCaseSummaryPDF(pdfData)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>📋</div>
          <div>Generating case summary...</div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>❌</div>
          <div>Failed to generate case summary</div>
          <button
            onClick={onClose}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
      <div 
        ref={contentRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>📋 Case Summary</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Investigation overview for stolen items case</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Overview Metrics */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>📊 Case Overview</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{metrics.totalItems}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Stolen Items</div>
              </div>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{formatCurrency(metrics.totalValue)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Value</div>
              </div>
              <div style={{
                background: '#faf5ff',
                border: '1px solid #d8b4fe',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{metrics.evidenceCount}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Evidence Files</div>
              </div>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fed7aa',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>{metrics.itemsWithPhotos}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Items w/ Photos</div>
              </div>
            </div>
          </div>

          {/* Evidence Breakdown */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>📸 Evidence Analysis</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(metrics.evidenceTypes).map(([type, count]) => (
                <div key={type} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>{count}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>{type}s</div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>📂 Item Categories</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(metrics.categories).map(([category, count]) => (
                <div key={category} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{category}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>📅 Timeline</h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Earliest Incident</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>{metrics.dateRange.earliest}</div>
              </div>
              <div style={{ fontSize: '20px', color: '#9ca3af' }}>→</div>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Latest Incident</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>{metrics.dateRange.latest}</div>
              </div>
            </div>
          </div>

          {/* Top Items by Value */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>💎 High-Value Items</h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {metrics.topItemsByValue.map((item, index) => (
                <div key={item.id} style={{
                  padding: '12px 16px',
                  borderBottom: index < metrics.topItemsByValue.length - 1 ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.category}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                    {formatCurrency(item.estimatedValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                padding: '12px 24px',
                backgroundColor: exporting ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: exporting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {exporting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Generating PDF...
                </>
              ) : (
                <>📄 Export PDF</>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
