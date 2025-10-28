'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [items, setItems] = useState<StolenItem[]>([])
  const [evidenceCache, setEvidenceCache] = useState<Record<string, any[]>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportOptions, setReportOptions] = useState({
    includePhotos: true,
    includeEvidenceSummary: true,
    includeValueBreakdown: true,
    includeTimeline: true,
    reportTitle: 'Stolen Property Report',
    caseNumber: '',
    officerName: '',
    department: 'Columbia County Sheriff\'s Office'
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

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          setAuthenticated(true)
        } else {
          router.push('/login-simple')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login-simple')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Load items data and evidence cache (only after authentication)
  useEffect(() => {
    if (!authenticated) return

    const loadData = async () => {
      try {
        // Load items
        const itemsResponse = await fetch('/api/items')
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          setItems(itemsData.items || [])
          
          // Load evidence for each item
          const cache: Record<string, any[]> = {}
          for (const item of itemsData.items) {
            try {
              const evidenceResponse = await fetch(`/api/evidence?itemId=${item.id}`)
              if (evidenceResponse.ok) {
                const evidenceData = await evidenceResponse.json()
                cache[item.id] = evidenceData.evidence || []
              }
            } catch (err) {
              console.error(`Failed to load evidence for item ${item.id}:`, err)
            }
          }
          setEvidenceCache(cache)
        }
      } catch (err) {
        console.error('Failed to load items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authenticated])

  const handleGenerateReport = () => {
    setGenerating(true)
    // TODO: Implement actual PDF generation
    setTimeout(() => {
      alert('Report generated successfully! (Full implementation coming soon)')
      setGenerating(false)
    }, 2000)
  }

  const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
  const totalEvidence = Object.values(evidenceCache).reduce((sum, evidenceList) => 
    sum + (evidenceList?.length || 0), 0
  )

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading...'}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      paddingBottom: isMobile ? '0' : '48px'
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
            Generate Report
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
            padding: isMobile ? '24px 16px 120px' : '32px'
          }}>
            {/* Report Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: isMobile ? '20px' : '24px',
              borderRadius: '16px',
              color: 'white',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                margin: '0 0 16px 0'
              }}>
                📄 Report Summary
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Items</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{items.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Value</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>${totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Evidence Files</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{totalEvidence}</div>
                </div>
              </div>
            </div>

            {/* Report Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Report Options
              </h3>

              {/* Case Information */}
              <div style={{
                background: '#f9fafb',
                padding: isMobile ? '16px' : '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Case Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={reportOptions.reportTitle}
                      onChange={(e) => setReportOptions({...reportOptions, reportTitle: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Case Number
                      </label>
                      <input
                        type="text"
                        value={reportOptions.caseNumber}
                        onChange={(e) => setReportOptions({...reportOptions, caseNumber: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
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
                        Officer Name
                      </label>
                      <input
                        type="text"
                        value={reportOptions.officerName}
                        onChange={(e) => setReportOptions({...reportOptions, officerName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Include Options */}
              <div style={{
                background: '#f9fafb',
                padding: isMobile ? '16px' : '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  Include in Report
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'includePhotos', label: '📸 Include Photos' },
                    { key: 'includeEvidenceSummary', label: '📋 Evidence Summary' },
                    { key: 'includeValueBreakdown', label: '💰 Value Breakdown' },
                    { key: 'includeTimeline', label: '📅 Timeline' }
                  ].map(option => (
                    <label
                      key={option.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={reportOptions[option.key as keyof typeof reportOptions] as boolean}
                        onChange={(e) => setReportOptions({
                          ...reportOptions,
                          [option.key]: e.target.checked
                        })}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
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
            onClick={() => router.back()}
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
            Cancel
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            style={{
              padding: '14px 24px',
              background: generating ? 'rgba(16, 185, 129, 0.7)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: generating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              flex: isMobile ? 'none' : 2,
              opacity: generating ? 0.7 : 1
            }}
          >
            {generating ? '📄 Generating...' : '📄 Generate Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

