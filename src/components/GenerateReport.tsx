'use client'

import { useState } from 'react'
import { StolenItem } from '@/types'
import jsPDF from 'jspdf'

interface GenerateReportProps {
  items: StolenItem[]
  onClose: () => void
}

interface ReportOptions {
  includePhotos: boolean
  includeEvidenceSummary: boolean
  includeValueBreakdown: boolean
  includeTimeline: boolean
  includeContactInfo: boolean
  reportTitle: string
  caseNumber: string
  officerName: string
  department: string
  reportDate: string
}

export function GenerateReport({ items, onClose }: GenerateReportProps) {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includePhotos: true,
    includeEvidenceSummary: true,
    includeValueBreakdown: true,
    includeTimeline: true,
    includeContactInfo: true,
    reportTitle: 'Stolen Property Report - Birkenfeld Farm Theft',
    caseNumber: 'Case #2023-12020',
    officerName: '',
    department: 'Columbia County Sheriff\'s Office',
    reportDate: new Date().toISOString().split('T')[0]
  })

  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<'options' | 'preview' | 'generating' | 'complete'>('options')
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')

  const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
  const totalEvidence = items.reduce((sum, item) => {
    if (!item.evidence) return sum
    return sum + 
      (item.evidence.filter(e => e.type === 'photo')?.length || 0) + 
      (item.evidence.filter(e => e.type === 'video')?.length || 0) + 
      (item.evidence.filter(e => e.type === 'document')?.length || 0)
  }, 0)

  const generatePDF = async () => {
    setStep('generating')
    setGenerating(true)
    setProgress(0)
    setProgressMessage('Initializing PDF generation...')

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20
      
      // Calculate total work for progress tracking
      const totalItems = items.length
      const totalImages = items.reduce((sum, item) => sum + (item.evidence?.filter(e => e.type === 'photo')?.length || 0), 0)
      const totalWork = totalItems + totalImages + 10 // +10 for other operations
      let completedWork = 0
      
      const updateProgress = (increment: number, message: string) => {
        completedWork += increment
        const newProgress = Math.min(Math.round((completedWork / totalWork) * 100), 100)
        setProgress(newProgress)
        setProgressMessage(message)
        console.log(`Progress: ${newProgress}% - ${message}`)
      }

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage()
          yPosition = 20
        }
      }

      // Helper function to load image as base64 using server-side proxy
      const loadImageAsBase64 = async (imageUrl: string, timeout = 10000): Promise<string | null> => {
        try {
          console.log('Loading image via proxy:', imageUrl)
          
          // Create timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Image loading timeout')), timeout)
          })
          
          // Create fetch promise
          const fetchPromise = fetch(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`)
          
          const response = await Promise.race([fetchPromise, timeoutPromise])
          
          if (!response.ok) {
            console.error('Image proxy failed:', response.status)
            return null
          }
          
          const data = await response.json()
          
          if (data.success && data.dataUrl) {
            console.log('Successfully loaded image via proxy, size:', data.size || 'unknown')
            return data.dataUrl
          } else {
            console.error('Image proxy returned error:', data.error)
            return null
          }
        } catch (error) {
          console.error('Error loading image via proxy:', error)
          return null
        }
      }

      // Helper function to get Cloudinary image URL
      const getCloudinaryImageUrl = (cloudinaryId: string, width = 400) => {
        if (cloudinaryId.startsWith('demo/')) {
          return null
        }
        
        // If it's already a full URL, use it directly for PDF (no transformations to avoid CORS issues)
        if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
          return cloudinaryId
        }
        
        // For public_id format, construct URL without transformations to avoid CORS
        const cloudName = 'dhaacekdd'
        return `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryId}`
      }

      // Header
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(reportOptions.reportTitle, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(reportOptions.caseNumber, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      pdf.text(`Generated: ${new Date(reportOptions.reportDate).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Case Summary
      checkNewPage(40)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Case Summary', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Total Items Stolen: ${items.length}`, 20, yPosition)
      yPosition += 8
      pdf.text(`Total Estimated Value: $${totalValue.toLocaleString()}`, 20, yPosition)
      yPosition += 8
      pdf.text(`Total Evidence Files: ${totalEvidence}`, 20, yPosition)
      yPosition += 8
      pdf.text(`Items with Photos: ${items.filter(item => item.evidence?.filter(e => e.type === 'photo')?.length > 0).length}`, 20, yPosition)
      yPosition += 20

      if (reportOptions.includeContactInfo && reportOptions.department) {
        checkNewPage(30)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Investigating Agency', 20, yPosition)
        yPosition += 12

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Department: ${reportOptions.department}`, 20, yPosition)
        yPosition += 8
        if (reportOptions.officerName) {
          pdf.text(`Officer: ${reportOptions.officerName}`, 20, yPosition)
          yPosition += 8
        }
        yPosition += 10
      }

      // Value Breakdown
      if (reportOptions.includeValueBreakdown) {
        checkNewPage(60)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Value Breakdown', 20, yPosition)
        yPosition += 15

        const valueRanges = [
          { label: 'Under $500', min: 0, max: 500 },
          { label: '$500 - $2,000', min: 500, max: 2000 },
          { label: '$2,000 - $10,000', min: 2000, max: 10000 },
          { label: 'Over $10,000', min: 10000, max: Infinity }
        ]

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        valueRanges.forEach(range => {
          const itemsInRange = items.filter(item => 
            item.estimatedValue >= range.min && item.estimatedValue < range.max
          )
          const totalInRange = itemsInRange.reduce((sum, item) => sum + item.estimatedValue, 0)
          pdf.text(`${range.label}: ${itemsInRange.length} items ($${totalInRange.toLocaleString()})`, 25, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Items List
      checkNewPage(40)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Stolen Items Inventory', 20, yPosition)
      yPosition += 15

      // Process each item with potential images
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        
        // Fetch evidence for this item
        let evidence = []
        try {
          const response = await fetch(`/api/evidence?itemId=${item.id}`)
          if (response.ok) {
            const data = await response.json()
            evidence = data.evidence || []
          }
        } catch (error) {
          console.error('Error fetching evidence for report:', error)
        }

        const photos = evidence.filter((e: any) => e.type === 'photo')
        const hasPhotos = photos.length > 0 && reportOptions.includePhotos

        // Check space needed (more if including photo)
        const spaceNeeded = hasPhotos ? 80 : 35
        checkNewPage(spaceNeeded)
        
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${item.name}`, 20, yPosition)
        yPosition += 10

        // Include first photo if available and option is enabled
        if (hasPhotos && photos[0]) {
          try {
            const imageUrl = getCloudinaryImageUrl(photos[0].cloudinaryId, 300)
            if (imageUrl) {
              console.log('Attempting to load image for PDF:', imageUrl)
              const base64Image = await loadImageAsBase64(imageUrl)
              if (base64Image) {
                // Add image to PDF
                const imgWidth = 50 // mm
                const imgHeight = 50 // mm
                pdf.addImage(base64Image, 'JPEG', pageWidth - imgWidth - 20, yPosition - 5, imgWidth, imgHeight)
                console.log('Successfully added image to PDF for:', item.name)
              } else {
                console.log('Failed to load image, adding placeholder text for:', item.name)
                // Add placeholder text when image fails
                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'italic')
                pdf.text('[Photo Available]', pageWidth - 50, yPosition + 20, { align: 'center' })
                pdf.text('See Digital Evidence', pageWidth - 50, yPosition + 25, { align: 'center' })
              }
            }
          } catch (error) {
            console.error('Error adding image to PDF:', error)
            // Add placeholder text when image fails
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'italic')
            pdf.text('[Photo Available]', pageWidth - 50, yPosition + 20, { align: 'center' })
            pdf.text('See Digital Evidence', pageWidth - 50, yPosition + 25, { align: 'center' })
          }
        }

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        
        // Description (with space for image on right)
        const descriptionWidth = hasPhotos ? pageWidth - 80 : pageWidth - 40
        const descriptionLines = pdf.splitTextToSize(item.description, descriptionWidth)
        pdf.text(descriptionLines, 25, yPosition)
        yPosition += Math.max(descriptionLines.length * 5, hasPhotos ? 45 : 0) + 5

        // Details
        pdf.text(`Serial Number: ${item.serialNumber || 'N/A'}`, 25, yPosition)
        yPosition += 5
        pdf.text(`Estimated Value: $${item.estimatedValue.toLocaleString()}`, 25, yPosition)
        yPosition += 5
        pdf.text(`Date Last Seen: ${new Date(item.dateLastSeen).toLocaleDateString()}`, 25, yPosition)
        yPosition += 5
        pdf.text(`Location Last Seen: ${item.locationLastSeen}`, 25, yPosition)
        yPosition += 5

        if ((item as any).category) {
          pdf.text(`Category: ${(item as any).category}`, 25, yPosition)
          yPosition += 5
        }

        if ((item as any).tags && Array.isArray((item as any).tags) && (item as any).tags.length > 0) {
          pdf.text(`Tags: ${(item as any).tags.join(', ')}`, 25, yPosition)
          yPosition += 5
        }

        if (reportOptions.includeEvidenceSummary) {
          const evidenceText = [
            evidence.filter((e: any) => e.type === 'photo').length > 0 ? `${evidence.filter((e: any) => e.type === 'photo').length} photos` : null,
            evidence.filter((e: any) => e.type === 'video').length > 0 ? `${evidence.filter((e: any) => e.type === 'video').length} videos` : null,
            evidence.filter((e: any) => e.type === 'document').length > 0 ? `${evidence.filter((e: any) => e.type === 'document').length} documents` : null
          ].filter(Boolean).join(', ')
          
          pdf.text(`Evidence Files: ${evidenceText || 'No evidence files'}`, 25, yPosition)
          yPosition += 5
        }

        if ((item as any).notes) {
          pdf.text(`Notes: ${(item as any).notes}`, 25, yPosition)
          yPosition += 5
        }

        yPosition += 15
      }

      // Timeline
      if (reportOptions.includeTimeline) {
        checkNewPage(40)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Timeline', 20, yPosition)
        yPosition += 15

        const sortedItems = [...items].sort((a, b) => 
          new Date(a.dateLastSeen).getTime() - new Date(b.dateLastSeen).getTime()
        )

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        sortedItems.forEach(item => {
          checkNewPage(8)
          pdf.text(`${new Date(item.dateLastSeen).toLocaleDateString()}: ${item.name} last seen at ${item.locationLastSeen}`, 25, yPosition)
          yPosition += 6
        })
      }

      // Footer on each page
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10, { align: 'right' })
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 10)
      }

      updateProgress(5, 'Finalizing PDF...')
      
      // Save the PDF
      const fileName = `stolen-property-report-${reportOptions.caseNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      updateProgress(5, 'PDF generated successfully!')
      setStep('complete')
    } catch (error) {
      console.error('Error generating PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setProgressMessage(`Error: ${errorMessage}`)
      alert(`Error generating report: ${errorMessage}`)
    } finally {
      setGenerating(false)
    }
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
        maxWidth: '800px',
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
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
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
                📄
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
                  Generate Report
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', fontWeight: '500' }}>
                  Create professional PDF report for law enforcement
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
          {step === 'options' && (
            <div>
              {/* Report Overview */}
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                border: '1px solid #fca5a5',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626', marginBottom: '12px', margin: '0 0 12px 0' }}>
                  📊 Report Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '14px', color: '#dc2626' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{items.length}</div>
                    <div style={{ fontWeight: '600' }}>Items</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>${totalValue.toLocaleString()}</div>
                    <div style={{ fontWeight: '600' }}>Total Value</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{totalEvidence}</div>
                    <div style={{ fontWeight: '600' }}>Evidence Files</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Report Information */}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    Report Information
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={reportOptions.reportTitle}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, reportTitle: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Case Number
                    </label>
                    <input
                      type="text"
                      value={reportOptions.caseNumber}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, caseNumber: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={reportOptions.department}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, department: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Officer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={reportOptions.officerName}
                      onChange={(e) => setReportOptions(prev => ({ ...prev, officerName: e.target.value }))}
                      placeholder="Investigating officer..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>

                {/* Report Options */}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    Include in Report
                  </h3>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reportOptions.includePhotos}
                        onChange={(e) => setReportOptions(prev => ({ ...prev, includePhotos: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Include Photos</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Embed first photo of each item</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reportOptions.includeEvidenceSummary}
                        onChange={(e) => setReportOptions(prev => ({ ...prev, includeEvidenceSummary: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Evidence Summary</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>File counts for each item</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reportOptions.includeValueBreakdown}
                        onChange={(e) => setReportOptions(prev => ({ ...prev, includeValueBreakdown: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Value Breakdown</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Items grouped by value ranges</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reportOptions.includeTimeline}
                        onChange={(e) => setReportOptions(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Timeline</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Chronological theft timeline</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reportOptions.includeContactInfo}
                        onChange={(e) => setReportOptions(prev => ({ ...prev, includeContactInfo: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Contact Information</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Department and officer details</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 32px'
              }}></div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Generating Report...
              </h3>
              <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '16px', margin: '0 0 16px 0' }}>
                {progressMessage || 'Creating professional PDF document'}
              </p>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto 24px',
                background: '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '8px',
                  background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              <div style={{
                fontSize: '16px',
                color: '#374151',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {progress}% Complete
              </div>
              
              {reportOptions.includePhotos && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'inline-block',
                  fontSize: '14px',
                  color: '#92400e',
                  fontWeight: '600'
                }}>
                  📸 Loading and embedding images from Cloudinary...
                </div>
              )}
              <div style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#9ca3af',
                maxWidth: '400px',
                margin: '16px auto 0',
                lineHeight: '1.4'
              }}>
                {reportOptions.includePhotos 
                  ? 'Processing images may take a few moments depending on file sizes and network speed.'
                  : 'Generating text-only report for faster processing.'
                }
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Report Generated Successfully!
              </h3>
              <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '24px', margin: '0 0 24px 0' }}>
                Your professional theft report has been downloaded
              </p>
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '16px',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
                    <div><strong>📄 Report includes:</strong></div>
                    <div>• Complete inventory of {items.length} stolen items</div>
                    <div>• Total value: ${totalValue.toLocaleString()}</div>
                    <div>• Evidence summary with {totalEvidence} files</div>
                    {reportOptions.includePhotos && <div>• 📸 Embedded photos for visual identification</div>}
                    <div>• Professional formatting for legal use</div>
                  </div>
                </div>
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
            {step === 'options' && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Report will include {items.length} items • ${totalValue.toLocaleString()} total value
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {step === 'options' && (
              <button
                onClick={() => setStep('preview')}
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
                Preview Report
              </button>
            )}
            
            {step === 'options' && (
              <button
                onClick={generatePDF}
                disabled={generating}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  opacity: generating ? 0.6 : 1
                }}
              >
                📄 Generate PDF Report
              </button>
            )}
            
            {step === 'complete' && (
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                ✅ Done
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
