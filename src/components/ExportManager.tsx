'use client'

import { useState } from 'react'
import { StolenItem, User } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'

interface ExportManagerProps {
  items: StolenItem[]
  user: User | null
  onClose: () => void
  className?: string
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeEvidence: boolean
  includePhotos: boolean
  includeDocuments: boolean
  dateRange: {
    start: string
    end: string
  }
  categories: string[]
  sortBy: 'name' | 'value' | 'date' | 'category'
  sortOrder: 'asc' | 'desc'
}

export function ExportManager({ items, user, onClose, className = '' }: ExportManagerProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeEvidence: true,
    includePhotos: true,
    includeDocuments: true,
    dateRange: {
      start: '',
      end: ''
    },
    categories: [],
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Get unique categories from items
  const availableCategories = Array.from(new Set(
    items.map(item => (item as any).category || 'Uncategorized')
  )).sort()

  const handleExport = async () => {
    setExporting(true)
    setExportProgress(0)

    try {
      // Filter items based on export options
      let filteredItems = [...items]

      // Apply date range filter
      if (exportOptions.dateRange.start) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.createdAt)
          const startDate = new Date(exportOptions.dateRange.start)
          return itemDate >= startDate
        })
        setExportProgress(20)
      }

      if (exportOptions.dateRange.end) {
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.createdAt)
          const endDate = new Date(exportOptions.dateRange.end)
          return itemDate <= endDate
        })
        setExportProgress(40)
      }

      // Apply category filter
      if (exportOptions.categories.length > 0) {
        filteredItems = filteredItems.filter(item => {
          const itemCategory = (item as any).category || 'Uncategorized'
          return exportOptions.categories.includes(itemCategory)
        })
        setExportProgress(60)
      }

      // Sort items
      filteredItems.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (exportOptions.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'value':
            aValue = a.estimatedValue
            bValue = b.estimatedValue
            break
          case 'date':
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          case 'category':
            aValue = (a as any).category || 'Uncategorized'
            bValue = (b as any).category || 'Uncategorized'
            break
          default:
            return 0
        }

        if (aValue < bValue) return exportOptions.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return exportOptions.sortOrder === 'asc' ? 1 : -1
        return 0
      })

      setExportProgress(80)

      // Generate export based on format
      const exportData = {
        items: filteredItems,
        metadata: {
          exportedBy: user?.name || 'Unknown User',
          exportDate: new Date().toISOString(),
          totalItems: filteredItems.length,
          totalValue: filteredItems.reduce((sum, item) => sum + item.estimatedValue, 0),
          tenant: user?.tenant?.name || 'Unknown Tenant',
          filters: exportOptions
        }
      }

      await generateExport(exportData, exportOptions)
      setExportProgress(100)

      // Close modal after successful export
      setTimeout(() => {
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
      setExportProgress(0)
    }
  }

  const generateExport = async (data: any, options: ExportOptions) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `crime-report-${timestamp}`

    switch (options.format) {
      case 'pdf':
        await generatePDF(data, filename)
        break
      case 'excel':
        await generateExcel(data, filename)
        break
      case 'csv':
        generateCSV(data, filename)
        break
      case 'json':
        generateJSON(data, filename)
        break
    }
  }

  const generatePDF = async (data: any, filename: string) => {
    // Dynamic import for jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text('Crime Report System', 20, 30)
    doc.setFontSize(12)
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 45)
    doc.text(`Exported by: ${data.metadata.exportedBy}`, 20, 55)
    doc.text(`Tenant: ${data.metadata.tenant}`, 20, 65)
    doc.text(`Total Items: ${data.metadata.totalItems}`, 20, 75)
    doc.text(`Total Value: ${formatCurrency(data.metadata.totalValue)}`, 20, 85)

    // Items table
    let yPosition = 105
    const pageHeight = doc.internal.pageSize.height
    const margin = 20

    // Table headers
    doc.setFontSize(10)
    doc.text('Item', margin, yPosition)
    doc.text('Description', margin + 40, yPosition)
    doc.text('Value', margin + 120, yPosition)
    doc.text('Date', margin + 150, yPosition)
    doc.text('Location', margin + 170, yPosition)
    yPosition += 10

    // Table data
    data.items.forEach((item: StolenItem, index: number) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 30
      }

      doc.text(item.name.substring(0, 25), margin, yPosition)
      doc.text(item.description.substring(0, 30), margin + 40, yPosition)
      doc.text(formatCurrency(item.estimatedValue), margin + 120, yPosition)
      doc.text(formatDate(item.createdAt), margin + 150, yPosition)
      doc.text(item.locationLastSeen.substring(0, 15), margin + 170, yPosition)
      yPosition += 8
    })

    doc.save(`${filename}.pdf`)
  }

  const generateExcel = async (data: any, filename: string) => {
    // For Excel export, we'll create a CSV with Excel-compatible formatting
    // In a real implementation, you'd use a library like xlsx
    const headers = [
      'Item Name',
      'Description',
      'Serial Number',
      'Purchase Date',
      'Purchase Cost',
      'Date Last Seen',
      'Location Last Seen',
      'Estimated Value',
      'Category',
      'Notes',
      'Date Created',
      'Evidence Count'
    ]

    const csvContent = [
      headers.join(','),
      ...data.items.map((item: StolenItem) => [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.serialNumber || ''}"`,
        `"${item.purchaseDate}"`,
        item.purchaseCost,
        `"${item.dateLastSeen}"`,
        `"${item.locationLastSeen}"`,
        item.estimatedValue,
        `"${(item as any).category || 'Uncategorized'}"`,
        `"${item.notes || ''}"`,
        `"${formatDate(item.createdAt)}"`,
        item.evidence?.length || 0
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  const generateCSV = (data: any, filename: string) => {
    const headers = [
      'Item Name',
      'Description',
      'Serial Number',
      'Purchase Date',
      'Purchase Cost',
      'Date Last Seen',
      'Location Last Seen',
      'Estimated Value',
      'Category',
      'Notes',
      'Date Created',
      'Evidence Count'
    ]

    const csvContent = [
      headers.join(','),
      ...data.items.map((item: StolenItem) => [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.serialNumber || ''}"`,
        `"${item.purchaseDate}"`,
        item.purchaseCost,
        `"${item.dateLastSeen}"`,
        `"${item.locationLastSeen}"`,
        item.estimatedValue,
        `"${(item as any).category || 'Uncategorized'}"`,
        `"${item.notes || ''}"`,
        `"${formatDate(item.createdAt)}"`,
        item.evidence?.length || 0
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const generateJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `${filename}.json`, 'application/json')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setExportOptions(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
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
        maxWidth: '600px',
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
              Export Data
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0'
            }}>
              Export {items.length} items in your preferred format
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

        {/* Export Options */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Format Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Export Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { value: 'pdf', label: 'PDF Report', icon: '📄', description: 'Professional formatted report' },
                  { value: 'excel', label: 'Excel Spreadsheet', icon: '📊', description: 'Data analysis ready' },
                  { value: 'csv', label: 'CSV Data', icon: '📋', description: 'Simple data export' },
                  { value: 'json', label: 'JSON Data', icon: '🔧', description: 'Developer format' }
                ].map(({ value, label, icon, description }) => (
                  <button
                    key={value}
                    onClick={() => handleOptionChange('format', value)}
                    style={{
                      padding: '16px',
                      background: exportOptions.format === value ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                      border: `2px solid ${exportOptions.format === value ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{icon}</span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: exportOptions.format === value ? 'white' : '#374151'
                      }}>
                        {label}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: exportOptions.format === value ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      margin: '0'
                    }}>
                      {description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Date Range (Optional)
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => handleOptionChange('dateRange', {
                    ...exportOptions.dateRange,
                    start: e.target.value
                  })}
                  style={{
                    flex: 1,
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
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => handleOptionChange('dateRange', {
                    ...exportOptions.dateRange,
                    end: e.target.value
                  })}
                  style={{
                    flex: 1,
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

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Categories (Optional)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      style={{
                        padding: '8px 16px',
                        background: exportOptions.categories.includes(category) 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                          : 'white',
                        border: `1px solid ${exportOptions.categories.includes(category) ? '#10b981' : '#d1d5db'}`,
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: exportOptions.categories.includes(category) ? 'white' : '#374151'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Sort By
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={exportOptions.sortBy}
                  onChange={(e) => handleOptionChange('sortBy', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="date">Date Created</option>
                  <option value="name">Item Name</option>
                  <option value="value">Estimated Value</option>
                  <option value="category">Category</option>
                </select>
                <select
                  value={exportOptions.sortOrder}
                  onChange={(e) => handleOptionChange('sortOrder', e.target.value)}
                  style={{
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
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
            {exporting ? `Exporting... ${exportProgress}%` : 'Ready to export'}
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
              onClick={handleExport}
              disabled={exporting}
              style={{
                padding: '12px 24px',
                background: exporting ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: exporting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {exporting && (
          <div style={{
            marginTop: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              width: `${exportProgress}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}
      </div>
    </div>
  )
}
