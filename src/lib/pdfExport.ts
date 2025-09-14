import jsPDF from 'jspdf'
import { StolenItem, SearchFilters } from '@/types'
import { formatCurrency, formatDate } from './data'

export interface PDFExportOptions {
  items: StolenItem[]
  filters?: SearchFilters
  includeEvidence?: boolean
  title?: string
  caseNumber?: string
}

export function generateStolenItemsReport(options: PDFExportOptions): void {
  const {
    items,
    filters,
    includeEvidence = true,
    title = 'Stolen Items Report',
    caseNumber = '2023-12020'
  } = options

  // Create new PDF document
  const pdf = new jsPDF()
  let yPosition = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20

  // Helper function to add text with automatic page breaks
  const addText = (text: string, x: number, y: number, options?: any) => {
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin)
    pdf.text(lines, x, y, options)

    const lineHeight = options?.lineHeight || 5
    const textHeight = lines.length * lineHeight

    if (y + textHeight > pageHeight - margin) {
      pdf.addPage()
      return margin
    }

    return y + textHeight
  }

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Header
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  yPosition = addText(title, margin, yPosition)

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  yPosition = addText(`Case Number: ${caseNumber}`, margin, yPosition + 10)
  yPosition = addText(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition + 5)
  yPosition = addText(`Total Items: ${items.length}`, margin, yPosition + 5)

  if (filters?.query) {
    yPosition = addText(`Search Filter: "${filters.query}"`, margin, yPosition + 5)
  }

  // Summary statistics
  const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
  const totalEvidence = items.reduce((sum, item) =>
    sum + item.evidence?.filter(e => e.type === 'photo')?.length + item.evidence?.filter(e => e.type === 'video')?.length + item.evidence?.filter(e => e.type === 'document')?.length, 0
  )

  yPosition += 10
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  yPosition = addText('Summary Statistics', margin, yPosition)

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  yPosition = addText(`Total Estimated Value: ${formatCurrency(totalValue)}`, margin, yPosition + 8)
  yPosition = addText(`Total Evidence Files: ${totalEvidence}`, margin, yPosition + 5)
  yPosition = addText(`Date Range: ${formatDate(items[0]?.dateLastSeen || 'N/A')} - ${formatDate(items[items.length - 1]?.dateLastSeen || 'N/A')}`, margin, yPosition + 5)

  // Items list
  yPosition += 15
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  yPosition = addText('Stolen Items Details', margin, yPosition)

  items.forEach((item, index) => {
    checkPageBreak(60) // Ensure enough space for item details

    // Item header
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    yPosition = addText(`${index + 1}. ${item.name}`, margin, yPosition + 10)

    // Item details
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    yPosition = addText(`Serial Number: ${item.serialNumber}`, margin + 5, yPosition + 6)
    yPosition = addText(`Purchase Date: ${formatDate(item.purchaseDate)}`, margin + 5, yPosition + 5)
    yPosition = addText(`Purchase Cost: ${formatCurrency(item.purchaseCost)}`, margin + 5, yPosition + 5)
    yPosition = addText(`Date Last Seen: ${formatDate(item.dateLastSeen)}`, margin + 5, yPosition + 5)
    yPosition = addText(`Location Last Seen: ${item.locationLastSeen}`, margin + 5, yPosition + 5)
    yPosition = addText(`Estimated Value: ${formatCurrency(item.estimatedValue)}`, margin + 5, yPosition + 5)

    // Description
    yPosition += 5
    const descriptionLines = pdf.splitTextToSize(`Description: ${item.description}`, pageWidth - 2 * margin - 5)
    pdf.text(descriptionLines, margin + 5, yPosition)
    yPosition += descriptionLines.length * 4

    // Evidence
    if (includeEvidence && (item.evidence?.filter(e => e.type === 'photo')?.length > 0 || item.evidence?.filter(e => e.type === 'video')?.length > 0 || item.evidence?.filter(e => e.type === 'document')?.length > 0)) {
      yPosition = addText('Evidence Files:', margin + 5, yPosition + 5)

      if (item.evidence?.filter(e => e.type === 'photo')?.length > 0) {
        yPosition = addText(`📷 Photos: ${item.evidence.filter(e => e.type === 'photo').length} files`, margin + 10, yPosition + 4)
      }
      if (item.evidence?.filter(e => e.type === 'video')?.length > 0) {
        yPosition = addText(`🎥 Videos: ${item.evidence.filter(e => e.type === 'video').length} files`, margin + 10, yPosition + 4)
      }
      if (item.evidence?.filter(e => e.type === 'document')?.length > 0) {
        yPosition = addText(`📄 Documents: ${item.evidence.filter(e => e.type === 'document').length} files`, margin + 10, yPosition + 4)
      }
    }

    // Add some space between items
    yPosition += 8
  })

  // Footer
  const totalPages = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 10)
    pdf.text('Generated by CrimeReport System', margin, pageHeight - 10)
  }

  // Save the PDF
  const fileName = `stolen-items-report-${caseNumber}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

export function exportFilteredItems(items: StolenItem[], filters?: SearchFilters): void {
  generateStolenItemsReport({
    items,
    filters,
    includeEvidence: true,
    title: 'Filtered Stolen Items Report',
    caseNumber: '2023-12020'
  })
}

export function exportAllItems(items: StolenItem[]): void {
  generateStolenItemsReport({
    items,
    includeEvidence: true,
    title: 'Complete Stolen Items Report',
    caseNumber: '2023-12020'
  })
}
