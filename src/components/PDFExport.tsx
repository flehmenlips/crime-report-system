'use client'

import { useState } from 'react'
import { StolenItem, SearchFilters } from '@/types'
import { exportAllItems, exportFilteredItems } from '@/lib/pdfExport'

interface PDFExportProps {
  items: StolenItem[]
  filteredItems?: StolenItem[]
  filters?: SearchFilters
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function PDFExport({
  items,
  filteredItems,
  filters,
  variant = 'primary',
  size = 'md'
}: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      exportAllItems(items)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportFiltered = async () => {
    if (!filteredItems || filteredItems.length === 0) {
      alert('No filtered results to export.')
      return
    }

    setIsExporting(true)
    try {
      exportFilteredItems(filteredItems, filters)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`

  const iconClasses = size === 'sm' ? "w-4 h-4 mr-2" : "w-5 h-5 mr-2"

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleExportAll}
        disabled={isExporting}
        className={classes}
      >
        <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Generating...' : 'Export All'}
      </button>

      {filteredItems && filteredItems.length !== items.length && (
        <button
          onClick={handleExportFiltered}
          disabled={isExporting}
          className={classes}
        >
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {isExporting ? 'Generating...' : `Export Filtered (${filteredItems.length})`}
        </button>
      )}

      {isExporting && (
        <div className="flex items-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Generating PDF...
        </div>
      )}
    </div>
  )
}
