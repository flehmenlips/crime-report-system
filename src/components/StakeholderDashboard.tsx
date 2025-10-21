'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { StolenItem, User, Role } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { ItemDetailView } from './ItemDetailView'
import { AdvancedSearch } from './AdvancedSearch'
import { GenerateReport } from './GenerateReport'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { UserProfile } from './UserProfile'
import { TenantInfo } from './TenantInfo'
import { DashboardLoading, StatsLoading, ErrorState, EmptyState } from './LoadingState'
import { ExportManager } from './ExportManager'
import { QuickExport } from './QuickExport'
import { ReportGenerator } from './ReportGenerator'
import { ItemCardThumbnails } from './ItemCardThumbnails'
import { SimpleSortControls } from './SimpleSortControls'
import { getRoleDisplayName, getDashboardTitle } from '@/lib/auth'
import { CaseSummary } from './CaseSummary'
import { EvidenceTags } from './EvidenceTags'
import { UploadEvidenceModal } from './UploadEvidenceModal'
import { InvestigationNotes } from './InvestigationNotes'
import { CaseDetailsView } from './CaseDetailsView'
import { useViewPreferences } from '@/contexts/UserPreferencesContext'

interface StakeholderDashboardProps {
  user: User
  items: StolenItem[]
  onItemsUpdate?: (items: StolenItem[]) => void
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  evidenceCache?: Record<string, any[]> // Optional evidence cache to avoid API calls
  evidenceLoaded?: boolean // Flag to indicate if evidence cache is ready
  isMobile?: boolean // Flag to hide header on mobile (MobileHeader is used instead)
}

export function StakeholderDashboard({ user, items, onItemsUpdate, loading = false, error = null, onRefresh, evidenceCache, evidenceLoaded, isMobile = false }: StakeholderDashboardProps) {
  const [scrollY, setScrollY] = useState(0)
  
  // Add scroll listener for dynamic text color
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Determine text color based on scroll position
  // When scrolled past the header area (around 200px), switch to dark text
  const isScrolled = scrollY > 200
  const textColor = isScrolled ? '#1e293b' : 'white' // Dark blue when scrolled, white when at top
  const textColorSecondary = isScrolled ? '#475569' : 'rgba(255, 255, 255, 0.8)'

  // Use user preferences for view and sort settings
  const { viewMode, sortField, sortOrder, setViewMode, setSortField, setSortOrder } = useViewPreferences()
  
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showExportManager, setShowExportManager] = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [detailViewItem, setDetailViewItem] = useState<StolenItem | null>(null)
  const [showCaseSummary, setShowCaseSummary] = useState(false)
  const [showEvidenceTags, setShowEvidenceTags] = useState(false)
  const [showUploadEvidence, setShowUploadEvidence] = useState(false)
  const [uploadEvidenceItem, setUploadEvidenceItem] = useState<StolenItem | null>(null)
  const [showInvestigationNotes, setShowInvestigationNotes] = useState(false)
  const [investigationNotesItem, setInvestigationNotesItem] = useState<StolenItem | null>(null)
  const [showCaseDetails, setShowCaseDetails] = useState(false)
  const [filteredItems, setFilteredItems] = useState<StolenItem[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Debug logging
  console.log('StakeholderDashboard rendered for user:', user?.name, 'role:', user?.role, 'viewMode:', viewMode)
  console.log('Rendering view toggle for viewMode:', viewMode)
  console.log('StakeholderDashboard evidenceCache keys:', evidenceCache ? Object.keys(evidenceCache).length : 'No cache')
  console.log('StakeholderDashboard evidenceLoaded:', evidenceLoaded)
  console.log('StakeholderDashboard items count:', items.length)
  if (evidenceCache && Object.keys(evidenceCache).length > 0) {
    console.log('Sample evidence cache data:', Object.keys(evidenceCache).slice(0, 3).map(key => ({ itemId: key, evidenceCount: evidenceCache[key]?.length || 0 })))
  }

  // Role-based access controls
  const canReadAll = () => user.role === 'law_enforcement' || user.role === 'insurance_agent' || user.role === 'banker'
  const canWriteAll = () => user.role === 'law_enforcement' || user.role === 'insurance_agent'
  const canGenerateReports = () => ['law_enforcement', 'insurance_agent', 'banker', 'asset_manager'].includes(user.role)
  const canAddNotes = () => ['law_enforcement', 'insurance_agent', 'broker', 'banker', 'asset_manager'].includes(user.role)
  const canExportData = () => ['law_enforcement', 'insurance_agent', 'banker'].includes(user.role)

  // Stable sorting using useMemo - TEMPORARILY DISABLED FOR DEBUGGING
  // const sortedItems = useMemo(() => {
  //   if (!items || items.length === 0) return []
  //   
  //   return [...items].sort((a, b) => {
  //     let aValue: any
  //     let bValue: any

  //     switch (sortField) {
  //       case 'name':
  //         aValue = a.name?.toLowerCase() || ''
  //         bValue = b.name?.toLowerCase() || ''
  //         break
  //       case 'value':
  //         aValue = a.estimatedValue || 0
  //         bValue = b.estimatedValue || 0
  //         break
  //       case 'date':
  //         aValue = new Date(a.dateLastSeen || a.createdAt || 0)
  //         bValue = new Date(b.dateLastSeen || b.createdAt || 0)
  //         break
  //       case 'category':
  //         aValue = (a as any).category?.toLowerCase() || 'uncategorized'
  //         bValue = (b as any).category?.toLowerCase() || 'uncategorized'
  //         break
  //       case 'serialNumber':
  //         aValue = a.serialNumber?.toLowerCase() || ''
  //         bValue = b.serialNumber?.toLowerCase() || ''
  //         break
  //       case 'location':
  //         aValue = a.locationLastSeen?.toLowerCase() || ''
  //         bValue = b.locationLastSeen?.toLowerCase() || ''
  //         break
  //       case 'evidence':
  //         aValue = (a.evidence?.length || 0)
  //         bValue = (b.evidence?.length || 0)
  //         break
  //       default:
  //         return 0
  //     }

  //     if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
  //     if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
  //     return 0
  //   })
  // }, [items, sortField, sortOrder])

  // Handle sorting changes - TEMPORARILY DISABLED
  // const handleSortChange = useCallback((newSortField: any, newSortOrder: any) => {
  //   setSortField(newSortField)
  //   setSortOrder(newSortOrder)
  // }, [])

  // Get role-specific dashboard configuration
  const getRoleConfig = () => {
    switch (user.role) {
      case 'law_enforcement':
        return {
          icon: '🚔',
          color: 'from-red-500 to-red-700',
          bgGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          title: 'Law Enforcement Portal',
          subtitle: 'Investigation interface for stolen items case',
          canEdit: false, // Law enforcement shouldn't edit core item data
          canDelete: false, // Law enforcement shouldn't delete items
          canUpload: true, // Law enforcement can add evidence for investigation
          canAddNotes: true // Law enforcement can add investigation notes
        }
      case 'insurance_agent':
        return {
          icon: '🏢',
          color: 'from-green-500 to-green-700',
          bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          title: 'Insurance Agent Portal',
          subtitle: 'Claims assessment and investigation tools',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'broker':
        return {
          icon: '🤝',
          color: 'from-purple-500 to-purple-700',
          bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          title: 'Equipment Broker Portal',
          subtitle: 'Asset valuation and market analysis',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'banker':
        return {
          icon: '🏦',
          color: 'from-yellow-500 to-yellow-700',
          bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          title: 'Banking Portal',
          subtitle: 'Loan collateral assessment and risk analysis',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'asset_manager':
        return {
          icon: '📊',
          color: 'from-teal-500 to-teal-700',
          bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          title: 'Asset Management Portal',
          subtitle: 'Portfolio analysis and recovery tracking',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'assistant':
      case 'secretary':
      case 'executive_assistant':
        return {
          icon: '👤',
          color: 'from-gray-500 to-gray-700',
          bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          title: 'Assistant Portal',
          subtitle: 'Support access for case management',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'manager':
        return {
          icon: '👔',
          color: 'from-orange-500 to-orange-700',
          bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          title: 'Management Portal',
          subtitle: 'Oversight and coordination tools',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      default:
        return {
          icon: '👤',
          color: 'from-gray-500 to-gray-700',
          bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          title: 'Stakeholder Portal',
          subtitle: 'Access to case information',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
    }
  }

  const roleConfig = getRoleConfig()
  // Simple inline sorting function (no useMemo to avoid React errors)
  const getSortedItems = (items: StolenItem[]) => {
    if (!items || items.length === 0) return items
    
    return [...items].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'value':
          aValue = a.estimatedValue || 0
          bValue = b.estimatedValue || 0
          break
        case 'date':
          aValue = new Date(a.dateLastSeen || a.createdAt || 0)
          bValue = new Date(b.dateLastSeen || b.createdAt || 0)
          break
        case 'category':
          aValue = (a.category || 'other').toLowerCase()
          bValue = (b.category || 'other').toLowerCase()
          break
        case 'serialNumber':
          aValue = a.serialNumber?.toLowerCase() || ''
          bValue = b.serialNumber?.toLowerCase() || ''
          break
        case 'location':
          aValue = a.locationLastSeen?.toLowerCase() || ''
          bValue = b.locationLastSeen?.toLowerCase() || ''
          break
        case 'evidence':
          // Use evidence cache if available, otherwise fall back to item.evidence
          aValue = evidenceCache && evidenceCache[a.id] ? evidenceCache[a.id].length : (a.evidence?.length || 0)
          bValue = evidenceCache && evidenceCache[b.id] ? evidenceCache[b.id].length : (b.evidence?.length || 0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  // Handle sorting changes - Simple function (no useCallback to avoid React errors)
  const handleSortChange = (newSortField: any, newSortOrder: any) => {
    setSortField(newSortField)
    setSortOrder(newSortOrder)
  }

  const displayItems = isFiltered ? getSortedItems(filteredItems) : getSortedItems(items)
  
  // Calculate evidence count from evidenceCache instead of item.evidence
  // since evidence is now loaded progressively
  const evidenceCount = Object.values(evidenceCache || {}).reduce((total, evidenceList) => 
    total + evidenceList.length, 0
  )
  
  // Calculate items with photos from evidenceCache
  const itemsWithPhotos = Object.entries(evidenceCache || {}).filter(([itemId, evidenceList]) => 
    evidenceList.some(e => e.type === 'photo')
  ).length

  // Show loading state
  if (loading) {
    return <DashboardLoading />
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <ErrorState 
          message={error}
          onRetry={onRefresh}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
        />
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        color: 'white'
      }}>
      {/* Role-Specific Header - Hidden on mobile (MobileHeader is used instead) */}
      {!isMobile && (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        margin: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        position: 'sticky',
        top: '24px',
        zIndex: 50
      }}>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: roleConfig.bgGradient,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                fontSize: '24px'
              }}>
                {roleConfig.icon}
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  margin: 0,
                  color: textColor,
                  transition: 'color 0.3s ease-in-out'
                }}>
                  {roleConfig.title}
                </h1>
                <p style={{ color: textColorSecondary, margin: 0, fontWeight: '500', transition: 'color 0.3s ease-in-out' }}>
                  {roleConfig.subtitle}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <TenantInfo user={user} textColor={textColor} textColorSecondary={textColorSecondary} />
              <UserProfile showDetails={true} textColor={textColor} textColorSecondary={textColorSecondary} />
            </div>
          </div>
        </div>
      </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Role-Specific Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: roleConfig.bgGradient,
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {items.length}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Stolen Items</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {formatCurrency(items.reduce((sum, item) => sum + item.estimatedValue, 0))}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Value</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {evidenceCount}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Evidence Files</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {itemsWithPhotos}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Items w/ Photos</div>
          </div>
        </div>

        {/* Role-Specific Tools */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              {getRoleDisplayName(user.role)} Tools
            </h2>
          </div>
          
          {/* Role-Specific Tool Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {/* Advanced Search - Available to all */}
            <button 
              onClick={() => setShowAdvancedSearch(true)}
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Advanced Search</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Filter by multiple criteria</div>
            </button>
            
            {/* Analytics - Available to all */}
            <button 
              onClick={() => setShowAnalytics(true)}
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Analytics</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Value and trend analysis</div>
            </button>
            
            {/* Case Details - Available to all */}
            <button 
              onClick={() => setShowCaseDetails(true)}
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.borderColor = '#cbd5e1'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏛️</div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Case Details</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>View case overview & timeline</div>
            </button>
            
            {/* Role-specific tools */}
            {user.role === 'law_enforcement' && (
              <>
                <button 
                  onClick={() => setShowCaseSummary(true)}
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Case Summary</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Generate case overview</div>
                </button>
                
                <button 
                  onClick={() => setShowEvidenceTags(true)}
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏷️</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Evidence Tags</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Organize by categories</div>
                </button>
              </>
            )}
            
            {user.role === 'insurance_agent' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>💰</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Claims Assessment</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Evaluate claim values</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Claims Report</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Generate claim documentation</div>
                </button>
              </>
            )}
            
            {user.role === 'banker' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏦</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Collateral Assessment</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Evaluate loan collateral</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Risk Analysis</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Assess financial risk</div>
                </button>
              </>
            )}
            
            {user.role === 'asset_manager' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📈</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Portfolio Analysis</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Track asset recovery</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Recovery Tracking</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Monitor recovery progress</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Professional Evidence Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                  Evidence Database
                </h2>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  {getRoleDisplayName(user.role)} view • {displayItems.length} items catalogued
                </p>
              </div>
              
              {/* Controls Row */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                width: '100%',
                overflow: 'visible'
              }}>
                {/* Sort Controls */}
                <SimpleSortControls 
                  onSortChange={handleSortChange}
                  currentField={sortField}
                  currentOrder={sortOrder}
                  showLabel={false}
                />
                
                {/* View Mode Toggle */}
                <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px' }}>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    background: viewMode === 'cards' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'cards' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: 'auto'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'list' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: 'auto'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
                </div>
              </div>
            </div>
            
            {isFiltered && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px' }}>
                <button
                  onClick={() => {
                    setIsFiltered(false)
                    setFilteredItems([])
                  }}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  📋 Show All ({items.length} items)
                </button>
                <button
                  onClick={() => {
                    setIsFiltered(false)
                    setFilteredItems([])
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                  }}
                >
                  🗑️ Clear Filter
                </button>
              </div>
            )}
          </div>

          {displayItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                No evidence items found
              </h3>
              <p style={{ color: '#6b7280' }}>
                {user.role === 'law_enforcement' 
                  ? 'Waiting for property owner to document stolen items'
                  : 'No items available for your access level'
                }
              </p>
            </div>
          ) : !evidenceLoaded ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px'
              }}></div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                Loading Evidence Data
              </h3>
              <p style={{ color: '#6b7280' }}>
                Preparing thumbnail images for {displayItems.length} items...
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            // Card View
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {displayItems.map((item) => (
                <div key={item.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  maxWidth: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => {
                  setDetailViewItem(item)
                  setShowDetailView(true)
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <ItemCardThumbnails 
                        key={`thumb-${item.id}-${Date.now()}`}
                        item={item} 
                        compact={true}
                        evidence={evidenceCache?.[item.id]}
                        onImageClick={(cloudinaryId) => {
                          setDetailViewItem(item)
                          setShowDetailView(true)
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#1f2937', 
                        margin: '0 0 4px 0',
                        lineHeight: '1.3'
                      }}>
                        {item.name}
                      </h3>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>
                        ID: {item.id} • {formatDate(item.dateLastSeen)}
                      </p>
                    </div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#059669' 
                    }}>
                      {formatCurrency(item.estimatedValue)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ 
                      color: '#374151', 
                      lineHeight: '1.5',
                      margin: '0 0 8px 0'
                    }}>
                      {item.description.length > 120 
                        ? `${item.description.substring(0, 120)}...`
                        : item.description
                      }
                    </p>
                    
                    {item.serialNumber && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          fontFamily: 'monospace'
                        }}>
                          Serial: {item.serialNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {item.evidence?.filter(e => e.type === 'photo')?.length > 0 && (
                        <span style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          📷 {item.evidence.filter(e => e.type === 'photo').length}
                        </span>
                      )}
                      {item.evidence?.filter(e => e.type === 'video')?.length > 0 && (
                        <span style={{
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          🎥 {item.evidence.filter(e => e.type === 'video').length}
                        </span>
                      )}
                      {item.evidence?.filter(e => e.type === 'document')?.length > 0 && (
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          📄 {item.evidence.filter(e => e.type === 'document').length}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {item.locationLastSeen}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View (Table)
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Description</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Serial #</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Value</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Evidence</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Last Seen</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, index) => (
                    <tr key={item.id} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      background: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            <ItemCardThumbnails 
                              key={`thumb-list-${item.id}`}
                              item={item} 
                              compact={true}
                              evidence={evidenceCache?.[item.id]}
                              onImageClick={(cloudinaryId) => {
                                setDetailViewItem(item)
                                setShowDetailView(true)
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              ID: {item.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', maxWidth: '200px' }}>
                        <div style={{ color: '#374151', lineHeight: '1.4' }}>
                          {item.description.length > 80 
                            ? `${item.description.substring(0, 80)}...`
                            : item.description
                          }
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {item.serialNumber ? (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: 'monospace'
                          }}>
                            {item.serialNumber}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700', color: '#059669', fontSize: '16px' }}>
                          {formatCurrency(item.estimatedValue)}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.evidence?.filter(e => e.type === 'photo')?.length > 0 && (
                            <span style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📷 {item.evidence.filter(e => e.type === 'photo').length}
                            </span>
                          )}
                          {item.evidence?.filter(e => e.type === 'video')?.length > 0 && (
                            <span style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              🎥 {item.evidence.filter(e => e.type === 'video').length}
                            </span>
                          )}
                          {item.evidence?.filter(e => e.type === 'document')?.length > 0 && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📄 {item.evidence.filter(e => e.type === 'document').length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#374151', fontSize: '13px' }}>
                          {formatDate(item.dateLastSeen)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                          {item.locationLastSeen}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => {
                            setDetailViewItem(item)
                            setShowDetailView(true)
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailView && detailViewItem && (
          <ItemDetailView
            item={detailViewItem}
            onClose={() => {
              setShowDetailView(false)
              setDetailViewItem(null)
            }}
            onEdit={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              // Property owners can edit items - implement edit functionality
              alert(`Edit functionality for "${item.name}" - Coming soon!`)
            }}
            onDelete={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              // Property owners can delete items - implement delete functionality
              alert(`Delete functionality for "${item.name}" - Coming soon!`)
            }}
            onDuplicate={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              // Property owners can duplicate items - implement duplicate functionality
              alert(`Duplicate functionality for "${item.name}" - Coming soon!`)
            }}
            onUploadEvidence={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              // Open upload evidence modal
              setUploadEvidenceItem(item)
              setShowUploadEvidence(true)
            }}
            onViewNotes={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              // Open investigation notes modal
              setInvestigationNotesItem(item)
              setShowInvestigationNotes(true)
            }}
            permissions={{
              canEdit: roleConfig.canEdit,
              canDelete: roleConfig.canDelete,
              canUpload: roleConfig.canUpload,
              canAddNotes: roleConfig.canAddNotes
            }}
          />
        )}

        {showAdvancedSearch && (
          <AdvancedSearch
            items={items}
            onClose={() => setShowAdvancedSearch(false)}
            onResults={(results) => {
              setFilteredItems(results)
              setIsFiltered(true)
              setShowAdvancedSearch(false)
            }}
          />
        )}

        {showGenerateReport && (
          <GenerateReport
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowGenerateReport(false)}
          />
        )}

        {showAnalytics && (
          <AnalyticsDashboard
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {/* Law Enforcement Tools */}
        {showCaseSummary && (
          <CaseSummary
            user={user}
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowCaseSummary(false)}
          />
        )}

        {showEvidenceTags && (
          <EvidenceTags
            user={user}
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowEvidenceTags(false)}
          />
        )}

        {/* Upload Evidence Modal */}
        {showUploadEvidence && uploadEvidenceItem && (
          <UploadEvidenceModal
            item={uploadEvidenceItem}
            user={user}
            onClose={() => {
              setShowUploadEvidence(false)
              setUploadEvidenceItem(null)
            }}
            onUploadComplete={() => {
              // Refresh data after upload
              if (onRefresh) {
                onRefresh()
              }
            }}
          />
        )}

        {/* Investigation Notes Modal */}
        {showInvestigationNotes && investigationNotesItem && (
          <InvestigationNotes
            item={investigationNotesItem}
            user={user}
            onClose={() => {
              setShowInvestigationNotes(false)
              setInvestigationNotesItem(null)
            }}
          />
        )}

        {/* Case Details Modal */}
        {showCaseDetails && (
          <CaseDetailsView
            user={user}
            onClose={() => setShowCaseDetails(false)}
          />
        )}
      </div>
    </div>
    </>
  )
}
