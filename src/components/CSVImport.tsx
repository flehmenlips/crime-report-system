'use client'

import { useState, useRef } from 'react'
import { StolenItem } from '@/types'

interface CSVImportProps {
  items: StolenItem[]
  onClose: () => void
  onSuccess: () => void
}

interface CSVRow {
  name: string
  description?: string
  serialNumber?: string
  purchaseDate?: string
  purchaseCost?: number
  dateLastSeen?: string
  locationLastSeen?: string
  estimatedValue?: number
  category?: string
  tags?: string
  notes?: string
  errors?: string[]
}

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; errors: string[] }>
}

export function CSVImport({ items, onClose, onSuccess }: CSVImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [importing, setImporting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows: CSVRow[] = []

    // Expected headers mapping
    const headerMap: Record<string, string> = {
      'name': 'name',
      'item name': 'name',
      'description': 'description',
      'desc': 'description',
      'serial number': 'serialNumber',
      'serial': 'serialNumber',
      'purchase date': 'purchaseDate',
      'date purchased': 'purchaseDate',
      'purchase cost': 'purchaseCost',
      'cost': 'purchaseCost',
      'price': 'purchaseCost',
      'date last seen': 'dateLastSeen',
      'last seen': 'dateLastSeen',
      'location last seen': 'locationLastSeen',
      'location': 'locationLastSeen',
      'estimated value': 'estimatedValue',
      'value': 'estimatedValue',
      'category': 'category',
      'tags': 'tags',
      'notes': 'notes'
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: CSVRow = { name: '' }
      const errors: string[] = []

      // Map values to row properties
      headers.forEach((header, index) => {
        const mappedField = headerMap[header]
        if (mappedField && values[index] !== undefined) {
          const value = values[index]

          switch (mappedField) {
            case 'name':
              if (!value) errors.push('Name is required')
              row.name = value
              break
            case 'description':
              row.description = value || 'No description provided'
              break
            case 'serialNumber':
              row.serialNumber = value || undefined
              break
            case 'purchaseDate':
              if (value) {
                // Validate date format
                const date = new Date(value)
                if (isNaN(date.getTime())) {
                  errors.push(`Invalid purchase date: ${value}`)
                } else {
                  row.purchaseDate = date.toISOString().split('T')[0]
                }
              }
              break
            case 'purchaseCost':
              if (value) {
                const cost = parseFloat(value.replace(/[^0-9.-]/g, ''))
                if (isNaN(cost)) {
                  errors.push(`Invalid purchase cost: ${value}`)
                } else {
                  row.purchaseCost = cost
                }
              }
              break
            case 'dateLastSeen':
              if (value) {
                const date = new Date(value)
                if (isNaN(date.getTime())) {
                  errors.push(`Invalid last seen date: ${value}`)
                } else {
                  row.dateLastSeen = date.toISOString().split('T')[0]
                }
              }
              break
            case 'locationLastSeen':
              row.locationLastSeen = value || 'Location not specified'
              break
            case 'estimatedValue':
              if (value) {
                const valueNum = parseFloat(value.replace(/[^0-9.-]/g, ''))
                if (isNaN(valueNum)) {
                  errors.push(`Invalid estimated value: ${value}`)
                } else {
                  row.estimatedValue = valueNum
                }
              }
              break
            case 'category':
              row.category = value || undefined
              break
            case 'tags':
              if (value) {
                row.tags = value.split(';').map(t => t.trim()).join(', ')
              }
              break
            case 'notes':
              row.notes = value || undefined
              break
          }
        }
      })

      if (errors.length > 0) {
        row.errors = errors
      }

      rows.push(row)
    }

    return rows
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const parsedData = parseCSV(csvText)
      setCsvData(parsedData)
      setCurrentStep('preview')
    }
    reader.readAsText(file)
  }

  const processImport = async () => {
    setCurrentStep('importing')
    setImporting(true)
    setProgress(0)
    setProgressMessage('Starting import process...')

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    const ownerId = 'cmfeyn7es0000t6oil8p6d45c' // Hardcoded for now

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      setProgressMessage(`Importing item ${i + 1} of ${csvData.length}: ${row.name}`)
      setProgress(Math.round(((i + 1) / csvData.length) * 100))

      try {
        // Skip rows with errors
        if (row.errors && row.errors.length > 0) {
          result.failed++
          result.errors.push({ row: i + 2, errors: row.errors }) // +2 because CSV is 1-indexed and has header
          continue
        }

        // Prepare item data
        const itemData = {
          name: row.name,
          description: row.description || 'No description provided',
          serialNumber: row.serialNumber,
          purchaseDate: row.purchaseDate || new Date().toISOString().split('T')[0],
          purchaseCost: row.purchaseCost || 0,
          dateLastSeen: row.dateLastSeen || new Date().toISOString().split('T')[0],
          locationLastSeen: row.locationLastSeen || 'Location not specified',
          estimatedValue: row.estimatedValue || 0,
          category: row.category,
          tags: row.tags,
          notes: row.notes,
          ownerId
        }

        // Create item via API
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })

        if (response.ok) {
          result.success++
        } else {
          const errorData = await response.text()
          result.failed++
          result.errors.push({ 
            row: i + 2, 
            errors: [`API Error: ${response.status} ${errorData}`] 
          })
        }

        // Add small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        result.failed++
        result.errors.push({ 
          row: i + 2, 
          errors: [`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
        })
      }
    }

    setImportResult(result)
    setCurrentStep('results')
    setImporting(false)
    setProgressMessage('Import completed!')

    if (result.success > 0) {
      // Call success callback to refresh the parent component
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'Name',
      'Description', 
      'Serial Number',
      'Purchase Date',
      'Purchase Cost',
      'Date Last Seen',
      'Location Last Seen',
      'Estimated Value',
      'Category',
      'Tags',
      'Notes'
    ]
    
    const sampleData = [
      [
        'Sample Item 1',
        'A sample stolen item',
        'SN123456',
        '2023-01-15',
        '500.00',
        '2023-12-01',
        'Farm Building A',
        '450.00',
        'Equipment',
        'urgent; high-value',
        'Last seen in good condition'
      ],
      [
        'Sample Item 2',
        'Another sample item',
        '',
        '2023-02-20',
        '1200.00',
        '2023-12-01',
        'Storage Shed',
        '1100.00',
        'Tools',
        'tools; equipment',
        'Valuable item, needs recovery'
      ]
    ]

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stolen-items-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              📥 CSV Import
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
          
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0,
            marginBottom: '24px'
          }}>
            Import multiple stolen items from a CSV file. Download the template below to see the required format.
          </p>
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          maxHeight: 'calc(90vh - 200px)',
          overflow: 'auto'
        }}>
          {currentStep === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '16px',
                padding: '64px 32px',
                background: '#f9fafb',
                marginBottom: '32px'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  📄
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Select CSV File
                </h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px'
                }}>
                  Choose a CSV file containing your stolen items data
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '16px'
                  }}
                >
                  Choose CSV File
                </button>
                
                <div>
                  <button
                    onClick={downloadTemplate}
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    📥 Download Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Preview Import ({csvData.length} items)
                </h3>
                <button
                  onClick={() => setCurrentStep('upload')}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Change File
                </button>
              </div>

              <div style={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Row</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{index + 2}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{row.name}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                          ${row.estimatedValue?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                          {row.errors ? (
                            <span style={{ color: '#dc2626', fontSize: '12px' }}>
                              ❌ {row.errors.length} error(s)
                            </span>
                          ) : (
                            <span style={{ color: '#059669' }}>✅ Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {csvData.length > 10 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                          ... and {csvData.length - 10} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px',
                fontSize: '14px'
              }}>
                <div><strong>Summary:</strong></div>
                <div>• Total items: {csvData.length}</div>
                <div>• Ready to import: {csvData.filter(row => !row.errors).length}</div>
                <div>• Has errors: {csvData.filter(row => row.errors).length}</div>
                <div>• Total estimated value: ${csvData.reduce((sum, row) => sum + (row.estimatedValue || 0), 0).toFixed(2)}</div>
              </div>
            </div>
          )}

          {currentStep === 'importing' && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 32px'
              }}></div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Importing Items...
              </h3>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
                {progressMessage}
              </p>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                background: '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '8px',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              <div style={{
                fontSize: '16px',
                color: '#374151',
                fontWeight: '600',
                marginTop: '16px'
              }}>
                {progress}% Complete
              </div>
            </div>
          )}

          {currentStep === 'results' && importResult && (
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px'
              }}>
                Import Results
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                    {importResult.success}
                  </div>
                  <div style={{ color: '#047857' }}>Successfully Imported</div>
                </div>
                
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                    {importResult.failed}
                  </div>
                  <div style={{ color: '#b91c1c' }}>Failed to Import</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Errors ({importResult.errors.length}):
                  </h4>
                  <div style={{
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    {importResult.errors.map((error, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        borderBottom: index < importResult.errors.length - 1 ? '1px solid #e5e7eb' : 'none',
                        fontSize: '14px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                          Row {error.row}:
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          {error.errors.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.success > 0 && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#059669', fontWeight: '600' }}>
                    🎉 {importResult.success} items imported successfully! The list will refresh automatically.
                  </div>
                </div>
              )}
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
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {currentStep === 'upload' && 'Select a CSV file to begin'}
            {currentStep === 'preview' && `Ready to import ${csvData.length} items`}
            {currentStep === 'importing' && 'Importing items...'}
            {currentStep === 'results' && 'Import completed'}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep === 'preview' && (
              <button
                onClick={processImport}
                disabled={csvData.filter(row => !row.errors).length === 0}
                style={{
                  background: csvData.filter(row => !row.errors).length === 0 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: csvData.filter(row => !row.errors).length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Import {csvData.filter(row => !row.errors).length} Items
              </button>
            )}
            
            {currentStep === 'results' && (
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
