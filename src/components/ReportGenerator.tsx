'use client'

import { useState } from 'react'
import { StolenItem, User } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'

interface ReportGeneratorProps {
  items: StolenItem[]
  user: User | null
  onClose: () => void
  className?: string
}

interface ReportOptions {
  title: string
  subtitle: string
  includeExecutiveSummary: boolean
  includeCharts: boolean
  includeEvidenceList: boolean
  includeDetailedItems: boolean
  includeRecommendations: boolean
  logoUrl?: string
  footerText: string
}

export function ReportGenerator({ items, user, onClose, className = '' }: ReportGeneratorProps) {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    title: 'Crime Report System - Property Theft Analysis',
    subtitle: 'Comprehensive Analysis and Documentation',
    includeExecutiveSummary: true,
    includeCharts: true,
    includeEvidenceList: true,
    includeDetailedItems: true,
    includeRecommendations: true,
    footerText: 'Confidential - Crime Report System'
  })

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerateReport = async () => {
    setGenerating(true)
    setProgress(0)

    try {
      // Dynamic import for jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Page 1: Title Page
      setProgress(20)
      await generateTitlePage(doc, reportOptions)

      // Executive Summary
      if (reportOptions.includeExecutiveSummary) {
        setProgress(40)
        doc.addPage()
        await generateExecutiveSummary(doc, items, user)
      }

      // Charts and Analytics
      if (reportOptions.includeCharts) {
        setProgress(60)
        doc.addPage()
        await generateAnalyticsPage(doc, items)
      }

      // Evidence List
      if (reportOptions.includeEvidenceList) {
        setProgress(80)
        doc.addPage()
        await generateEvidenceList(doc, items)
      }

      // Detailed Items
      if (reportOptions.includeDetailedItems) {
        setProgress(90)
        await generateDetailedItems(doc, items)
      }

      // Recommendations
      if (reportOptions.includeRecommendations) {
        doc.addPage()
        await generateRecommendations(doc, items, user)
      }

      setProgress(100)

      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0]
      doc.save(`crime-report-${timestamp}.pdf`)

      // Close modal after successful generation
      setTimeout(() => {
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Report generation failed:', error)
      alert(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  const generateTitlePage = async (doc: any, options: ReportOptions) => {
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Logo placeholder (you could add actual logo here)
    doc.setFontSize(16)
    doc.text('🛡️ Crime Report System', pageWidth / 2, 60, { align: 'center' })

    // Title
    doc.setFontSize(24)
    doc.text(options.title, pageWidth / 2, 100, { align: 'center' })

    // Subtitle
    doc.setFontSize(16)
    doc.text(options.subtitle, pageWidth / 2, 120, { align: 'center' })

    // Report metadata
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 160, { align: 'center' })
    doc.text(`Exported by: ${user?.name || 'Unknown User'}`, pageWidth / 2, 175, { align: 'center' })
    doc.text(`Tenant: ${user?.tenant?.name || 'Unknown Tenant'}`, pageWidth / 2, 190, { align: 'center' })

    // Footer
    doc.setFontSize(10)
    doc.text(options.footerText, pageWidth / 2, pageHeight - 20, { align: 'center' })
  }

  const generateExecutiveSummary = async (doc: any, items: StolenItem[], user: User | null) => {
    doc.setFontSize(18)
    doc.text('Executive Summary', 20, 30)

    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
    const evidenceCount = items.reduce((total, item) => total + (item.evidence?.length || 0), 0)
    const categories = items.reduce((acc, item) => {
      const category = (item as any).category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0]

    doc.setFontSize(12)
    doc.text('This report provides a comprehensive analysis of stolen property documentation', 20, 50)
    doc.text('and evidence management for law enforcement and insurance purposes.', 20, 60)

    doc.text(`• Total Items Documented: ${items.length}`, 20, 80)
    doc.text(`• Total Estimated Value: ${formatCurrency(totalValue)}`, 20, 90)
    doc.text(`• Evidence Files: ${evidenceCount}`, 20, 100)
    doc.text(`• Most Common Category: ${topCategory?.[0] || 'N/A'} (${topCategory?.[1] || 0} items)`, 20, 110)
    doc.text(`• Average Item Value: ${formatCurrency(totalValue / items.length)}`, 20, 120)

    doc.text('The data has been systematically organized and documented to support', 20, 140)
    doc.text('investigation efforts and insurance claim processing.', 20, 150)
  }

  const generateAnalyticsPage = async (doc: any, items: StolenItem[]) => {
    doc.setFontSize(18)
    doc.text('Analytics & Statistics', 20, 30)

    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
    const categories = items.reduce((acc, item) => {
      const category = (item as any).category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Category breakdown
    doc.setFontSize(14)
    doc.text('Category Breakdown:', 20, 50)
    doc.setFontSize(10)

    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count], index) => {
        const yPos = 70 + (index * 8)
        const percentage = ((count / items.length) * 100).toFixed(1)
        doc.text(`${category}: ${count} items (${percentage}%)`, 20, yPos)
      })

    // Value analysis
    doc.setFontSize(14)
    doc.text('Value Analysis:', 20, 160)
    doc.setFontSize(10)

    const sortedByValue = [...items].sort((a, b) => b.estimatedValue - a.estimatedValue)
    const top10Value = sortedByValue.slice(0, 10)
    const bottom10Value = sortedByValue.slice(-10)

    doc.text('Top 10 Highest Value Items:', 20, 180)
    top10Value.forEach((item, index) => {
      const yPos = 190 + (index * 6)
      doc.text(`${index + 1}. ${item.name}: ${formatCurrency(item.estimatedValue)}`, 20, yPos)
    })
  }

  const generateEvidenceList = async (doc: any, items: StolenItem[]) => {
    doc.setFontSize(18)
    doc.text('Evidence Documentation', 20, 30)

    doc.setFontSize(10)
    let yPos = 50
    let pageCount = 1

    items.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
        pageCount++
      }

      doc.setFontSize(12)
      doc.text(`${index + 1}. ${item.name}`, 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.text(`Value: ${formatCurrency(item.estimatedValue)} | Location: ${item.locationLastSeen}`, 20, yPos)
      yPos += 8

      if (item.evidence && item.evidence.length > 0) {
        doc.text('Evidence Files:', 20, yPos)
        yPos += 6
        
        item.evidence.forEach(evidence => {
          doc.text(`• ${evidence.type.toUpperCase()}: ${evidence.filename || 'Unknown'}`, 25, yPos)
          yPos += 5
        })
      } else {
        doc.text('No evidence files attached', 20, yPos)
        yPos += 5
      }
      
      yPos += 10
    })
  }

  const generateDetailedItems = async (doc: any, items: StolenItem[]) => {
    doc.addPage()
    doc.setFontSize(18)
    doc.text('Detailed Item Documentation', 20, 30)

    doc.setFontSize(10)
    let yPos = 50

    items.forEach((item, index) => {
      if (yPos > 200) {
        doc.addPage()
        yPos = 30
      }

      doc.setFontSize(12)
      doc.text(`${index + 1}. ${item.name}`, 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.text(`Description: ${item.description}`, 20, yPos)
      yPos += 6
      
      if (item.serialNumber) {
        doc.text(`Serial Number: ${item.serialNumber}`, 20, yPos)
        yPos += 6
      }
      
      doc.text(`Purchase Date: ${item.purchaseDate}`, 20, yPos)
      yPos += 6
      doc.text(`Purchase Cost: ${formatCurrency(item.purchaseCost)}`, 20, yPos)
      yPos += 6
      doc.text(`Estimated Value: ${formatCurrency(item.estimatedValue)}`, 20, yPos)
      yPos += 6
      doc.text(`Date Last Seen: ${item.dateLastSeen}`, 20, yPos)
      yPos += 6
      doc.text(`Location Last Seen: ${item.locationLastSeen}`, 20, yPos)
      yPos += 6
      
      if (item.notes) {
        doc.text(`Notes: ${item.notes}`, 20, yPos)
        yPos += 6
      }
      
      doc.text(`Documented: ${formatDate(item.createdAt)}`, 20, yPos)
      yPos += 15
    })
  }

  const generateRecommendations = async (doc: any, items: StolenItem[], user: User | null) => {
    doc.setFontSize(18)
    doc.text('Recommendations & Next Steps', 20, 30)

    doc.setFontSize(12)
    doc.text('Based on the analysis of the documented stolen property, the following', 20, 50)
    doc.text('recommendations are provided:', 20, 60)

    doc.setFontSize(11)
    const recommendations = [
      '1. Coordinate with local law enforcement to share this documentation for investigation purposes',
      '2. Submit comprehensive claim documentation to insurance providers',
      '3. Continue monitoring for recovered items and update records accordingly',
      '4. Consider implementing additional security measures based on theft patterns',
      '5. Maintain regular backups of evidence files and documentation',
      '6. Establish communication protocols with stakeholders for case updates'
    ]

    recommendations.forEach((rec, index) => {
      const yPos = 80 + (index * 15)
      doc.text(rec, 20, yPos)
    })

    doc.setFontSize(12)
    doc.text('This report should be reviewed regularly and updated as new information', 20, 180)
    doc.text('becomes available or as the investigation progresses.', 20, 190)
  }

  const handleOptionChange = (key: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({
      ...prev,
      [key]: value
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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '700px',
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
              Generate Professional Report
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0'
            }}>
              Create a comprehensive PDF report for law enforcement and insurance
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
          >
            ×
          </button>
        </div>

        {/* Report Options */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Report Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Report Title
              </label>
              <input
                type="text"
                value={reportOptions.title}
                onChange={(e) => handleOptionChange('title', e.target.value)}
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

            {/* Report Subtitle */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Report Subtitle
              </label>
              <input
                type="text"
                value={reportOptions.subtitle}
                onChange={(e) => handleOptionChange('subtitle', e.target.value)}
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

            {/* Report Sections */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Include Sections
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'includeExecutiveSummary', label: 'Executive Summary', description: 'Overview and key statistics' },
                  { key: 'includeCharts', label: 'Analytics & Charts', description: 'Data analysis and visualizations' },
                  { key: 'includeEvidenceList', label: 'Evidence List', description: 'Complete evidence documentation' },
                  { key: 'includeDetailedItems', label: 'Detailed Items', description: 'Full item descriptions and metadata' },
                  { key: 'includeRecommendations', label: 'Recommendations', description: 'Next steps and action items' }
                ].map(({ key, label, description }) => (
                  <label key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={reportOptions[key as keyof ReportOptions] as boolean}
                      onChange={(e) => handleOptionChange(key as keyof ReportOptions, e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer Text */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Footer Text
              </label>
              <input
                type="text"
                value={reportOptions.footerText}
                onChange={(e) => handleOptionChange('footerText', e.target.value)}
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
            {generating ? `Generating report... ${progress}%` : 'Ready to generate'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
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
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              style={{
                padding: '12px 24px',
                background: generating ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {generating && (
          <div style={{
            marginTop: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '8px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}
      </div>
    </div>
  )
}
