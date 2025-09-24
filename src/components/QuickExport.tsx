'use client'

import { useState } from 'react'
import { StolenItem, User } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'

interface QuickExportProps {
  items: StolenItem[]
  user: User | null
  className?: string
}

export function QuickExport({ items, user, className = '' }: QuickExportProps) {
  const [exporting, setExporting] = useState(false)

  const handleQuickExport = async (format: 'csv' | 'json' | 'summary') => {
    setExporting(true)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `crime-report-${timestamp}`
      
      switch (format) {
        case 'csv':
          await exportCSV(filename)
          break
        case 'json':
          await exportJSON(filename)
          break
        case 'summary':
          await exportSummary(filename)
          break
      }
    } catch (error) {
      console.error('Quick export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const exportCSV = async (filename: string) => {
    const headers = [
      'Item Name',
      'Description',
      'Serial Number',
      'Estimated Value',
      'Category',
      'Date Created',
      'Location Last Seen',
      'Evidence Count'
    ]

    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.serialNumber || ''}"`,
        item.estimatedValue,
        `"${(item as any).category || 'Uncategorized'}"`,
        `"${formatDate(item.createdAt)}"`,
        `"${item.locationLastSeen}"`,
        item.evidence?.length || 0
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const exportJSON = async (filename: string) => {
    const exportData = {
      items: items,
      metadata: {
        exportedBy: user?.name || 'Unknown User',
        exportDate: new Date().toISOString(),
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + item.estimatedValue, 0),
        tenant: user?.tenant?.name || 'Unknown Tenant'
      }
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    downloadFile(jsonContent, `${filename}.json`, 'application/json')
  }

  const exportSummary = async (filename: string) => {
    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
    const evidenceCount = items.reduce((total, item) => 
      total + (item.evidence?.length || 0), 0
    )
    
    const categories = items.reduce((acc, item) => {
      const category = (item as any).category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const summaryContent = `Crime Report System - Summary Report
Generated: ${new Date().toLocaleDateString()}
Exported by: ${user?.name || 'Unknown User'}
Tenant: ${user?.tenant?.name || 'Unknown Tenant'}

=== OVERVIEW ===
Total Items: ${items.length}
Total Estimated Value: ${formatCurrency(totalValue)}
Total Evidence Files: ${evidenceCount}
Average Item Value: ${formatCurrency(totalValue / items.length)}

=== CATEGORIES ===
${Object.entries(categories)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => `${category}: ${count} items`)
  .join('\n')}

=== RECENT ITEMS ===
${items
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10)
  .map(item => `• ${item.name} - ${formatCurrency(item.estimatedValue)} (${formatDate(item.createdAt)})`)
  .join('\n')}

=== HIGH VALUE ITEMS ===
${items
  .sort((a, b) => b.estimatedValue - a.estimatedValue)
  .slice(0, 10)
  .map(item => `• ${item.name} - ${formatCurrency(item.estimatedValue)} (${item.locationLastSeen})`)
  .join('\n')}
`

    downloadFile(summaryContent, `${filename}-summary.txt`, 'text/plain')
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

  if (items.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#6b7280',
          marginRight: '8px'
        }}>
          Quick Export:
        </span>
        
        <button
          onClick={() => handleQuickExport('csv')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            background: exporting ? '#f3f4f6' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            cursor: exporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Export as CSV"
        >
          📊 CSV
        </button>
        
        <button
          onClick={() => handleQuickExport('json')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            background: exporting ? '#f3f4f6' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            cursor: exporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Export as JSON"
        >
          🔧 JSON
        </button>
        
        <button
          onClick={() => handleQuickExport('summary')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            background: exporting ? '#f3f4f6' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            cursor: exporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Export Summary Report"
        >
          📋 Summary
        </button>
      </div>
    </div>
  )
}
