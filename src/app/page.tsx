'use client'

// import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { EnhancedEvidenceUpload } from '@/components/EnhancedEvidenceUpload'
import { EnhancedEvidenceManager } from '@/components/EnhancedEvidenceManager'
import { PWAServiceWorker } from '@/components/PWAServiceWorker'
import { MobileNavigation } from '@/components/MobileNavigation'
import { MobileOptimizedView } from '@/components/MobileOptimizedView'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'
import { NotificationBell } from '@/components/NotificationBell'
import { NotificationContainer } from '@/components/NotificationContainer'
import { NotificationManager } from '@/components/NotificationManager'
import { ModernItemForm } from '@/components/ModernItemForm'
import { ItemDetailView } from '@/components/ItemDetailView'
import { ItemCardThumbnails } from '@/components/ItemCardThumbnails'
import { MockPhotoThumbnails } from '@/components/MockPhotoThumbnails'
import { RealPhotoThumbnails } from '@/components/RealPhotoThumbnails'
import { EvidenceManagement } from '@/components/EvidenceManagement'
import { ItemCardIcon } from '@/components/ItemCardIcon'
import { BulkUpload } from '@/components/BulkUpload'
import { AdvancedSearch } from '@/components/AdvancedSearch'
import { GenerateReport } from '@/components/GenerateReport'
import { StolenItem, ItemFormData } from '@/types'
import { getAllItems, getTotalValue, formatCurrency, formatDate, addItem } from '@/lib/data'
import { User, getDashboardTitle, getRoleDisplayName, canWriteAll, canReadAll, canManageUsers, canAccessAdmin, canSuperAdmin } from '@/lib/auth'
import { UserProfile } from '@/components/UserProfile'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { StakeholderDashboard } from '@/components/StakeholderDashboard'
import { TenantInfo } from '@/components/TenantInfo'
import { DashboardLoading, StatsLoading, ItemsLoading, ErrorState, EmptyState } from '@/components/LoadingState'
import { ExportManager } from '@/components/ExportManager'
import { QuickExport } from '@/components/QuickExport'
import { ReportGenerator } from '@/components/ReportGenerator'
import { CSVImport } from '@/components/CSVImport'
import { TenantIsolationStressTest } from '@/components/TenantIsolationStressTest'
import { PerformanceStressTest } from '@/components/PerformanceStressTest'
import { EdgeCaseStressTest } from '@/components/EdgeCaseStressTest'
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard'
import { TenantUserManagement } from '@/components/TenantUserManagement'
import { SimpleSortControls } from '@/components/SimpleSortControls'
import { MobileHeader } from '@/components/MobileHeader'
import { UserPreferencesProvider, useUserPreferences, useViewPreferences } from '@/contexts/UserPreferencesContext'
import { CaseDetailsView } from '@/components/CaseDetailsView'
import { CaseDetailsForm } from '@/components/CaseDetailsForm'
import { ProgressiveLoader } from '@/components/ProgressiveLoader'

interface AppContentInnerProps {
  initialUser: User | null
}

function AppContentInner({ initialUser }: AppContentInnerProps) {
  const router = useRouter()
  const [allItems, setAllItems] = useState<StolenItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showSimpleUpload, setShowSimpleUpload] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StolenItem | null>(null)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showModernForm, setShowModernForm] = useState(false)
  const [editingFormItem, setEditingFormItem] = useState<StolenItem | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [detailViewItem, setDetailViewItem] = useState<StolenItem | null>(null)
  const [showEvidenceManagement, setShowEvidenceManagement] = useState(false)
  const [evidenceManagementItem, setEvidenceManagementItem] = useState<StolenItem | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showTenantIsolationTest, setShowTenantIsolationTest] = useState(false)
  const [showPerformanceTest, setShowPerformanceTest] = useState(false)
  const [showEdgeCaseTest, setShowEdgeCaseTest] = useState(false)
  const [showSuperAdminDashboard, setShowSuperAdminDashboard] = useState(false)
  const [showTenantUserManagement, setShowTenantUserManagement] = useState(false)
  const [showCaseDetailsView, setShowCaseDetailsView] = useState(false)
  const [showCaseDetailsForm, setShowCaseDetailsForm] = useState(false)
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null)
  const [existingCaseId, setExistingCaseId] = useState<string | null>(null)
  
  // Progressive loading states
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [evidenceProgress, setEvidenceProgress] = useState(0)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showExportManager, setShowExportManager] = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [filteredItems, setFilteredItems] = useState<StolenItem[]>([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Force re-render key
  
  // Use persistent user preferences for view mode and sorting
  const { viewMode, sortField, sortOrder, setViewMode, setSortField, setSortOrder } = useViewPreferences()

  // Enhanced RBAC user state - initialize with passed user to avoid duplicate loading
  const [user, setUser] = useState<User | null>(initialUser)
  const role = user?.role
  
  // Evidence data cache to avoid individual API calls per item
  const [evidenceCache, setEvidenceCache] = useState<Record<string, any[]>>({})
  const [evidenceLoaded, setEvidenceLoaded] = useState(false)

  // Mobile and PWA state
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  // RBAC helper functions
  const canAddItems = () => canWriteAll(user) || user?.permissions?.includes('write:own')
  const canBulkUpload = () => canWriteAll(user) || user?.permissions?.includes('write:own')
  const canGenerateReports = () => canReadAll(user) || user?.permissions?.includes('generate:reports')
  const canAccessAdminFeatures = () => canAccessAdmin(user)

  // Load evidence data progressively in background
  const loadEvidenceInBackground = async (items: StolenItem[]) => {
    console.log('🔍 loadEvidenceInBackground called with', items.length, 'items')
    setEvidenceLoading(true)
    setEvidenceProgress(0)
    
    try {
      const cache: Record<string, any[]> = {}
      const batchSize = 5 // Process 5 items at a time to avoid overwhelming the server
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        console.log(`📡 Processing evidence batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)} (items ${i + 1}-${Math.min(i + batchSize, items.length)})`)
        
        const batchPromises = batch.map(async (item) => {
          try {
            const response = await fetch(`/api/evidence?itemId=${item.id}`)
            if (response.ok) {
              const data = await response.json()
              console.log(`✅ Got evidence for item ${item.id}:`, data.evidence?.length || 0, 'items')
              return { itemId: item.id, evidence: data.evidence || [] }
            } else {
              console.error(`❌ Failed to get evidence for item ${item.id}:`, response.status)
              return { itemId: item.id, evidence: [] }
            }
          } catch (error) {
            console.error(`❌ Error loading evidence for item ${item.id}:`, error)
            return { itemId: item.id, evidence: [] }
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(result => {
          cache[result.itemId] = result.evidence
        })
        
        // Update progress and cache incrementally
        const progress = Math.round(((i + batchSize) / items.length) * 100)
        setEvidenceProgress(Math.min(100, progress))
        setEvidenceCache({ ...cache }) // Trigger re-render with new evidence data
        
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} complete. Progress: ${progress}%`)
        
        // Small delay between batches to prevent overwhelming the server
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      setEvidenceLoaded(true)
      setEvidenceLoading(false)
      console.log(`✅ Progressive evidence loading completed for ${items.length} items`)
      console.log('Evidence cache populated with keys:', Object.keys(cache).length)
    } catch (error) {
      console.error('❌ Error in progressive evidence loading:', error)
      setEvidenceLoaded(false)
      setEvidenceLoading(false)
    }
  }

  // Check if user has an existing case (for property owners)
  const checkExistingCase = async () => {
    if (!user?.tenant?.id || user?.role !== 'property_owner') {
      setExistingCaseId(null)
      return
    }

    try {
      const response = await fetch(`/api/case-details?tenantId=${user.tenant.id}&userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.caseDetails && data.caseDetails.length > 0) {
          setExistingCaseId(data.caseDetails[0].id)
        } else {
          setExistingCaseId(null)
        }
      } else {
        setExistingCaseId(null)
      }
    } catch (err) {
      console.error('Error checking for existing case:', err)
      setExistingCaseId(null)
    }
  }

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      console.log('Loading data...')
      const loadedItems = await getAllItems()
      console.log('Loaded items:', loadedItems.length)
      const total = await getTotalValue()
      console.log('Total value:', total)
      
      // Set initial data immediately - this allows UI to render
      setAllItems(loadedItems)
      setTotalValue(total)
      setInitialDataLoaded(true)
      setLoading(false)
      setRefreshing(false)
      console.log('✅ Initial data loading complete - UI can now render')
      
      // Check for existing case (for property owners) - do this in background
      checkExistingCase()
      
      // Load evidence in background - non-blocking
      if (loadedItems.length > 0) {
        console.log('🔄 Starting background evidence loading for', loadedItems.length, 'items...')
        loadEvidenceInBackground(loadedItems)
      } else {
        console.log('⚠️ No items to load evidence for')
        setEvidenceLoaded(true)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      setError(errorMessage)
      setAllItems([])
      setTotalValue(0)
      setLoading(false)
      setRefreshing(false)
      setInitialDataLoaded(false)
    }
  }

  const handleRefresh = () => {
    loadData(true)
  }

  // Refresh user profile (used when tenant settings are updated)
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        console.log('Refreshed user profile:', userData.user)
        setUser(userData.user)
      }
    } catch (error) {
      console.error('User refresh failed:', error)
    }
  }

  useEffect(() => {
    // Mark as hydrated to prevent hydration mismatch
    setIsHydrated(true)
    console.log('Main page hydrated with user:', initialUser?.name)
    
    // User is passed as prop, no need to load again
    // Skip data loading for SuperAdmin users with SuperAdmin tenant or no tenantId
    if (!(initialUser?.role === 'super_admin' && (initialUser?.tenantId === 'superadmin-tenant' || !initialUser?.tenantId))) {
      loadData()
    }
  }, [])

  // Add scroll listener for dynamic text color (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const handleScroll = () => {
        setScrollY(window.scrollY)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  // Determine text color based on scroll position
  // When scrolled past the header area (around 200px), switch to dark text
  const isScrolled = scrollY > 200
  const textColor = isScrolled ? '#1e293b' : 'white' // Dark blue when scrolled, white when at top
  const textColorSecondary = isScrolled ? '#475569' : 'rgba(255, 255, 255, 0.8)'

  // Close action menus when clicking outside
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return
    
    const handleClickOutside = () => {
      setShowActionMenu(null)
    }

    if (showActionMenu !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showActionMenu])

  // Mobile detection
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Force cards view on mobile - separate effect to avoid dependency issues
  useEffect(() => {
    if (isMobile && viewMode === 'list') {
      setViewMode('cards')
    }
  }, [isMobile, viewMode])

  const handleAddItem = async () => {
    const itemName = prompt('Enter item name:')
    if (!itemName) return

    const description = prompt('Enter item description:')
    if (!description) return

    const serialNumber = prompt('Enter serial number (optional):') || ''
    const purchaseDate = prompt('Enter purchase date (YYYY-MM-DD):')
    if (!purchaseDate) return

    const purchaseCost = prompt('Enter purchase cost:')
    if (!purchaseCost) return

    const dateLastSeen = prompt('Enter date last seen (YYYY-MM-DD):')
    if (!dateLastSeen) return

    const locationLastSeen = prompt('Enter location last seen:')
    if (!locationLastSeen) return

    const estimatedValue = prompt('Enter current estimated value:')
    if (!estimatedValue) return

    try {
      console.log('Starting item creation process...')
      const ownerId = 'cmfeyn7es0000t6oil8p6d45c'
      
      const itemData = {
        name: itemName,
        description,
        serialNumber,
        purchaseDate,
        purchaseCost: parseFloat(purchaseCost),
        dateLastSeen,
        locationLastSeen,
        estimatedValue: parseFloat(estimatedValue)
      }
      
      console.log('Item data prepared:', itemData)
      console.log('Using owner ID:', ownerId)
      
      const newItem = await addItem(itemData, ownerId)
      
      if (newItem) {
        console.log('Item created successfully:', newItem)
        setAllItems(prev => [...prev, newItem])
        setTotalValue(prev => prev + newItem.estimatedValue)
        alert(`✅ Item "${newItem.name}" added successfully to database!`)
        
        // Reload data to ensure consistency
        console.log('Reloading items from database...')
        const updatedItems = await getAllItems()
        setAllItems(updatedItems)
        console.log('Data reloaded, new total:', updatedItems.length)
      } else {
        console.error('addItem returned null')
        alert('❌ Error: Failed to create item in database')
      }
    } catch (error) {
      console.error('Error in handleAddItem:', error)
      alert(`❌ Error adding item: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeleteItem = async (item: StolenItem) => {
    const confirmed = confirm(`Are you sure you want to delete "${item.name}"?\n\nThis will permanently remove the item and all associated evidence files.\n\nThis action cannot be undone.`)
    
    if (!confirmed) return

    try {
      console.log('Deleting item:', item.id, item.name)
      
      const response = await fetch(`/api/items?id=${item.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('Item deleted successfully')
        setAllItems(prev => prev.filter(i => i.id !== item.id))
        setTotalValue(prev => prev - item.estimatedValue)
        alert(`✅ "${item.name}" deleted successfully from database`)
        
        // Reload data to ensure consistency
        const updatedItems = await getAllItems()
        setAllItems(updatedItems)
      } else {
        const errorText = await response.text()
        console.error('Delete failed:', errorText)
        alert(`❌ Failed to delete item: ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(`❌ Error deleting item: ${error instanceof Error ? error.message : error}`)
    }
  }

  const handleEditItem = async (item: StolenItem) => {
    const newName = prompt(`Edit name for "${item.name}":`, item.name)
    if (!newName || newName === item.name) return

    const newDescription = prompt(`Edit description for "${item.name}":`, item.description)
    if (!newDescription) return

    const newEstimatedValue = prompt(`Edit estimated value for "${item.name}":`, item.estimatedValue.toString())
    if (!newEstimatedValue) return

    try {
      console.log('Updating item:', item.id)
      
      const updateData = {
        id: item.id,
        name: newName,
        description: newDescription,
        serialNumber: item.serialNumber,
        purchaseDate: item.purchaseDate,
        purchaseCost: item.purchaseCost,
        dateLastSeen: item.dateLastSeen,
        locationLastSeen: item.locationLastSeen,
        estimatedValue: parseFloat(newEstimatedValue)
      }

      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Item updated successfully:', result.item)
        
        // Update local state
        setAllItems(prev => prev.map(i => i.id === item.id ? result.item : i))
        setTotalValue(prev => prev - item.estimatedValue + result.item.estimatedValue)
        alert(`✅ "${result.item.name}" updated successfully!`)
      } else {
        const errorText = await response.text()
        console.error('Update failed:', errorText)
        alert(`❌ Failed to update item: ${errorText}`)
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert(`❌ Error updating item: ${error instanceof Error ? error.message : error}`)
    }
  }

  const handleDuplicateItem = async (item: StolenItem) => {
    const newName = prompt(`Duplicate "${item.name}" as:`, `${item.name} (Copy)`)
    if (!newName) return

    try {
      console.log('🚀 DUPLICATING ITEM:', item.name)
      console.log('📊 ITEM DATA:', {
        id: item.id,
        name: item.name,
        evidenceCount: item.evidence?.length || 0,
        estimatedValue: item.estimatedValue
      })
      
      // Check for evidence size (stress test consideration)
      const evidenceCount = item.evidence?.length || 0
      if (evidenceCount > 20) {
        console.warn(`⚠️ LARGE ITEM DUPLICATION: ${evidenceCount} evidence items`)
      }
      
      const ownerId = 'cmfeyn7es0000t6oil8p6d45c'
      const duplicateData = {
        name: newName,
        description: item.description,
        serialNumber: item.serialNumber ? `${item.serialNumber}-COPY` : '',
        purchaseDate: item.purchaseDate,
        purchaseCost: item.purchaseCost,
        dateLastSeen: item.dateLastSeen,
        locationLastSeen: item.locationLastSeen,
        estimatedValue: item.estimatedValue
      }
      
      const startTime = performance.now()
      const newItem = await addItem(duplicateData, ownerId)
      const endTime = performance.now()
      
      console.log(`⏱️ DUPLICATION TIME: ${(endTime - startTime).toFixed(2)}ms`)
      
      if (newItem) {
        console.log('✅ DUPLICATE CREATED:', newItem.name)
        
        // Update local state immediately
        setAllItems(prev => [...prev, newItem])
        setTotalValue(prev => prev + newItem.estimatedValue)
        alert(`✅ "${newItem.name}" created as duplicate!`)
        
        // Refresh data from server to ensure consistency
        setTimeout(async () => {
          try {
            console.log('🔄 REFRESHING ITEMS AFTER DUPLICATE...')
            const updatedItems = await getAllItems()
            const updatedTotal = updatedItems.reduce((sum, item) => sum + item.estimatedValue, 0)
            setAllItems(updatedItems)
            setTotalValue(updatedTotal)
            console.log('✅ ITEMS REFRESHED:', updatedItems.length, 'total items')
          } catch (error) {
            console.error('❌ ERROR REFRESHING ITEMS AFTER DUPLICATE:', error)
          }
        }, 1000) // Wait 1 second for database consistency
      }
    } catch (error) {
      console.error('❌ ERROR DUPLICATING ITEM:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`❌ Error duplicating item: ${errorMessage}`)
    }
  }

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  // Bulk duplicate operation for stress testing
  const handleBulkDuplicate = async () => {
    const selectedItemsArray = allItems.filter(item => selectedItems.has(item.id))
    if (selectedItemsArray.length === 0) {
      alert('Please select items to duplicate')
      return
    }

    if (!confirm(`Duplicate ${selectedItemsArray.length} selected items? This may take a while for large datasets.`)) {
      return
    }

    console.log(`🚀 STARTING BULK DUPLICATE: ${selectedItemsArray.length} items`)
    const startTime = performance.now()
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process items in batches to prevent overwhelming the server
    const batchSize = 3
    for (let i = 0; i < selectedItemsArray.length; i += batchSize) {
      const batch = selectedItemsArray.slice(i, i + batchSize)
      console.log(`📦 PROCESSING BATCH ${Math.floor(i / batchSize) + 1}: ${batch.length} items`)

      // Process batch concurrently
      const batchPromises = batch.map(async (item) => {
        try {
          const duplicateData = {
            name: `${item.name} (Copy)`,
            description: item.description,
            serialNumber: item.serialNumber ? `${item.serialNumber}-COPY` : '',
            purchaseDate: item.purchaseDate,
            purchaseCost: item.purchaseCost,
            dateLastSeen: item.dateLastSeen,
            locationLastSeen: item.locationLastSeen,
            estimatedValue: item.estimatedValue
          }
          
          const newItem = await addItem(duplicateData, 'cmfeyn7es0000t6oil8p6d45c')
          if (newItem) {
            successCount++
            console.log(`✅ BULK DUPLICATE SUCCESS: ${item.name} → ${newItem.name}`)
            return newItem
          }
          return null
        } catch (error) {
          errorCount++
          const errorMsg = `Failed to duplicate ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(`❌ BULK DUPLICATE FAILED: ${item.name}`, error)
          return null
        }
      })

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises)
      
      // Add successful items to state
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const newItem = result.value
          setAllItems(prev => [...prev, newItem])
          setTotalValue(prev => prev + newItem.estimatedValue)
        }
      })

      // Small delay between batches
      if (i + batchSize < selectedItemsArray.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    console.log(`🎉 BULK DUPLICATE COMPLETE: ${successCount} success, ${errorCount} errors in ${totalTime.toFixed(2)}ms`)

    // Show results
    let message = `Bulk duplicate completed!\n\n✅ Successfully duplicated: ${successCount} items\n`
    if (errorCount > 0) {
      message += `❌ Failed: ${errorCount} items\n\nErrors:\n${errors.slice(0, 3).join('\n')}`
      if (errors.length > 3) {
        message += `\n... and ${errors.length - 3} more errors`
      }
    }
    alert(message)

    // Clear selection
    setSelectedItems(new Set())

    // Refresh data from server
    setTimeout(async () => {
      try {
        const updatedItems = await getAllItems()
        const updatedTotal = updatedItems.reduce((sum, item) => sum + item.estimatedValue, 0)
        setAllItems(updatedItems)
        setTotalValue(updatedTotal)
        console.log('✅ BULK DUPLICATE: Items refreshed from server')
      } catch (error) {
        console.error('❌ ERROR REFRESHING AFTER BULK DUPLICATE:', error)
      }
    }, 2000)
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const confirmed = confirm(`Are you sure you want to delete ${selectedItems.size} items?\n\nThis will permanently remove all selected items and their evidence files.\n\nThis action cannot be undone.`)
    if (!confirmed) return

    try {
      console.log('Bulk deleting items:', Array.from(selectedItems))
      
      for (const itemId of selectedItems) {
        const response = await fetch(`/api/items?id=${itemId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          console.error(`Failed to delete item ${itemId}`)
        }
      }

      // Reload data
      const updatedItems = await getAllItems()
      setAllItems(updatedItems)
      setTotalValue(await getTotalValue())
      setSelectedItems(new Set())
      setBulkMode(false)
      
      alert(`✅ ${selectedItems.size} items deleted successfully!`)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert(`❌ Error deleting items: ${error}`)
    }
  }

  const selectAllItems = () => {
    setSelectedItems(new Set(displayItems.map(item => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleModernFormSubmit = async (formData: ItemFormData) => {
    try {
      console.log('🚀 MODERN FORM SUBMITTED:', formData)
      console.log('🔍 EDITING FORM ITEM:', editingFormItem)
      const ownerId = 'cmfeyn7es0000t6oil8p6d45c'
      
      if (editingFormItem) {
        // Update existing item with all fields including category and notes
        const updateData = {
          id: editingFormItem.id,
          name: formData.name,
          description: formData.description || 'No description provided',
          serialNumber: formData.serialNumber || null,
          purchaseDate: formData.purchaseDate || editingFormItem.purchaseDate,
          purchaseCost: formData.purchaseCost || 0,
          dateLastSeen: formData.dateLastSeen || editingFormItem.dateLastSeen,
          locationLastSeen: formData.locationLastSeen || 'Location not specified',
          estimatedValue: formData.estimatedValue || 0,
          category: formData.category || null,
          tags: formData.tags || [],
          notes: formData.notes || null
        }
        
        console.log('Sending update with category and notes:', updateData)
        
        const response = await fetch('/api/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (response.ok) {
          const result = await response.json()
          console.log('📦 UPDATE API RESULT:', result)
          // API returns the item directly, not wrapped in an 'item' property
          const updatedItem = result
          console.log('✅ ITEM UPDATED SUCCESSFULLY:', updatedItem)
          setAllItems(prev => prev.map(i => i.id === editingFormItem.id ? updatedItem : i))
          setTotalValue(prev => prev - editingFormItem.estimatedValue + updatedItem.estimatedValue)
          // Notification will be handled by the NotificationManager component
          console.log('🔄 ITEM UPDATED IN LOCAL STATE:', updatedItem.name)
        } else {
          console.error('❌ UPDATE API FAILED:', response.status, await response.text())
          alert('❌ Error: Failed to update item. Please try again.')
        }
      } else {
        // Create new item
        console.log('🆕 CREATING NEW ITEM with data:', formData)
        console.log('🆔 OWNER ID:', ownerId)
        
        const newItem = await addItem(formData, ownerId)
        console.log('📦 ADDITEM RESULT:', newItem)
        
        if (newItem) {
          console.log('✅ NEW ITEM CREATED SUCCESSFULLY:', newItem)
          
          // Immediate local update for instant UI feedback
          setAllItems(prev => [...prev, newItem])
          setTotalValue(prev => prev + newItem.estimatedValue)
          console.log('🔄 ITEM ADDED TO LOCAL STATE:', newItem.name)
          
          // Show success message
          const successMessage = `✅ New Item Successfully Added!\n\n"${newItem.name}" has been added to your inventory.\n\nTotal Value: ${formatCurrency(newItem.estimatedValue)}`
          console.log('📢 SHOWING SUCCESS MESSAGE:', successMessage)
          alert(successMessage)
          
          // Force re-render to ensure UI updates
          setTimeout(() => {
            console.log('🔄 FORCING UI REFRESH FOR NEW ITEM')
            setRefreshKey(prev => prev + 1) // Force re-render using key
          }, 100)
          
          // Delayed server sync to ensure database consistency
          setTimeout(async () => {
            try {
              console.log('🔄 STARTING SERVER SYNC...')
              const updatedItems = await getAllItems()
              const updatedTotal = updatedItems.reduce((sum, item) => sum + item.estimatedValue, 0)
              setAllItems(updatedItems)
              setTotalValue(updatedTotal)
              console.log('✅ SERVER SYNC COMPLETE, TOTAL ITEMS:', updatedItems.length)
            } catch (error) {
              console.error('❌ ERROR SYNCING AFTER ADD:', error)
            }
          }, 1500) // Increased delay to 1.5 seconds
        } else {
          console.error('❌ NEW ITEM IS NULL OR UNDEFINED!')
          alert('❌ Error: Failed to create item. Please try again.')
        }
      }
      
      setShowModernForm(false)
      setEditingFormItem(null)
    } catch (error) {
      console.error('❌ ERROR IN FORM SUBMISSION:', error)
      console.error('❌ ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace')
      alert(`❌ Error: ${error instanceof Error ? error.message : error}`)
    }
  }

  // Mobile action handlers
  const handleMobileAction = (action: string) => {
    switch (action) {
      case 'add':
        setShowModernForm(true)
        break
      case 'bulk':
        setShowBulkUpload(true)
        break
      case 'reports':
        setShowGenerateReport(true)
        break
      case 'search':
        setShowAdvancedSearch(true)
        break
      case 'analytics':
        setShowAnalytics(true)
        break
      case 'export':
        setShowExportManager(true)
        break
      case 'profile':
        setShowUserProfile(true)
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login-simple')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleGenerateReport = () => {
    // TODO: Implement report generation logic
    alert('Generating report... (Functionality coming soon)')
  }

  const handleBulkImport = () => {
    // TODO: Implement bulk import logic
    alert('Bulk import started... (Functionality coming soon)')
  }

  // Show loading state while authenticating or loading data
  // Skip loading screen for SuperAdmin users since they don't load tenant data
  if (!user || (loading && !(user?.role === 'super_admin'))) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Loading Crime Report System
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            {!user ? 'Authenticating user...' : 'Loading your data...'}
          </p>
          <div style={{
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Please wait while we prepare your dashboard
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <ErrorState 
          message={error}
          onRetry={handleRefresh}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userRole = user?.role
  
  // Calculate evidence count from evidenceCache instead of item.evidence
  // since evidence is now loaded progressively
  const evidenceCount = Object.values(evidenceCache || {}).reduce((total, evidenceList) => 
    total + evidenceList.length, 0
  )
  
  // Stable sorting using useMemo - TEMPORARILY DISABLED FOR DEBUGGING
  // const sortedItems = useMemo(() => {
  //   if (!allItems || allItems.length === 0) return []
  //   
  //   return [...allItems].sort((a, b) => {
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
  // }, [allItems, sortField, sortOrder])

  // Handle sorting changes - TEMPORARILY DISABLED
  // const handleSortChange = useCallback((newSortField: any, newSortOrder: any) => {
  //   setSortField(newSortField)
  //   setSortOrder(newSortOrder)
  // }, [])

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
          aValue = (a as any).category?.toLowerCase() || 'uncategorized'
          bValue = (b as any).category?.toLowerCase() || 'uncategorized'
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

  // Use filtered items if search is active, otherwise use allItems with sorting
  const displayItems = isFiltered ? filteredItems : getSortedItems(allItems)
  const displayTotalValue = displayItems.reduce((sum, item) => sum + item.estimatedValue, 0)

  if (userRole === 'property_owner') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        {/* PWA Service Worker - DISABLED FOR DEBUGGING */}
        {/* <PWAServiceWorker /> */}
        
        {/* Notification System - ALL DISABLED FOR DEBUGGING */}
        {/* <NotificationContainer /> */}
        
        {/* Desktop View */}
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
            fontFamily: 'Inter, -apple-system, sans-serif',
            color: 'white'
          }}>
        {/* Mobile Header */}
        {isMobile ? (
          <MobileHeader
            user={user}
            textColor={textColor}
            textColorSecondary={textColorSecondary}
            onViewModeChange={setViewMode}
            currentViewMode={viewMode}
          />
        ) : (
          /* Desktop Header */
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                    fontSize: '24px'
                  }}>
                    🏠
                  </div>
                  <div>
                    <h1 style={{ 
                      fontSize: '32px', 
                      fontWeight: '800', 
                      margin: 0,
                      color: textColor,
                      transition: 'color 0.3s ease-in-out'
                    }}>
                      {getDashboardTitle(user)}
                    </h1>
                    <p style={{ 
                      color: textColorSecondary, 
                      margin: 0, 
                      fontWeight: '500', 
                      transition: 'color 0.3s ease-in-out',
                      fontSize: '16px'
                    }}>
                      {user.tenant?.name || 'Property Management'}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px'
                }}>
                  {/* <NotificationBell /> */}
                <TenantInfo 
                  user={user} 
                  textColor={textColor} 
                  textColorSecondary={textColorSecondary}
                  isMobile={false}
                />
                <UserProfile 
                  showDetails={true} 
                  onProfileUpdate={(updatedUser) => {
                    setUser(updatedUser)
                  }}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                  isMobile={false}
                />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: isMobile ? '80px 8px 48px' : '0 24px 48px',
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {/* Refresh Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '24px' 
          }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.7 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {refreshing ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Hero Stats */}
          <div key={refreshKey} style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px', 
            marginBottom: '64px' 
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #be185d 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(239, 68, 68, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {allItems.length}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Items Stolen</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px', marginBottom: '16px' }}>From your property</div>
              <QuickExport items={allItems} user={user} />
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(16, 185, 129, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '56px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {formatCurrency(totalValue)}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Total Loss</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px' }}>Insurance claim value</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(59, 130, 246, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {evidenceCount}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Evidence Files</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px' }}>Photos, videos, documents</div>
            </div>
          </div>

          {/* Quick Actions - Hidden on mobile */}
          {!isMobile && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '64px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>
                Manage Your Property
              </h2>
              <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Professional tools for documenting and organizing your stolen property case
              </p>
            </div>
            
            {/* Action Buttons Grid - Hidden on mobile (use hamburger menu instead) */}
            {!isMobile && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px' 
            }}>
              {/* Add New Item - Only for users who can write */}
              {canAddItems() && (
              <button
                onClick={() => {
                  setEditingFormItem(null)
                  setShowModernForm(true)
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>➕</span>
                Add New Item
              </button>
              )}
              
              {/* Bulk Upload - Only for users who can write */}
              {canBulkUpload() && (
              <button
                onClick={() => setShowBulkUpload(true)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📤</span>
                Bulk Upload
              </button>
              )}

              {/* CSV Import - Only for users who can write */}
              {canBulkUpload() && (
              <button
                onClick={() => setShowCSVImport(true)}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📊</span>
                CSV Import
              </button>
              )}
              
              {/* Advanced Search - Available to all authenticated users */}
              <button
                onClick={() => setShowAdvancedSearch(true)}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>🔍</span>
                Advanced Search
              </button>
              
              {/* Generate Report - Only for users who can generate reports */}
              {canGenerateReports() && (
              <button
                onClick={() => setShowGenerateReport(true)}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📄</span>
                Generate Report
              </button>
              )}

              {/* Export Data - Available to all authenticated users */}
              <button
                onClick={() => setShowExportManager(true)}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📊</span>
                Export Data
              </button>

              {/* Professional Report Generator - Available to all authenticated users */}
              <button
                onClick={() => setShowReportGenerator(true)}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📋</span>
                Professional Report
              </button>
              
              {/* Analytics Dashboard - Available to all authenticated users */}
              <button
                onClick={() => setShowAnalytics(true)}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>📊</span>
                Analytics
              </button>

              {/* Case Details - Property owners can create/edit */}
              {user?.role === 'property_owner' && (
                <>
                  <button
                    onClick={() => setShowCaseDetailsView(true)}
                    style={{
                      background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '20px 32px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '18px',
                      boxShadow: '0 10px 25px rgba(31, 41, 55, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(31, 41, 55, 0.4)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(31, 41, 55, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🏛️</span>
                    Case Details
                  </button>

                  <button
                    onClick={() => {
                      if (existingCaseId) {
                        // Case exists, open for editing
                        setEditingCaseId(existingCaseId)
                      } else {
                        // No case exists, create new
                        setEditingCaseId(null)
                      }
                      setShowCaseDetailsForm(true)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '20px 32px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '18px',
                      boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.4)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{existingCaseId ? '✏️' : '📝'}</span>
                    {existingCaseId ? 'Edit Case Report' : 'Create Case Report'}
                  </button>
                </>
              )}

              {/* Manage Users - Only available to property owners */}
              {user?.role === 'property_owner' && user?.tenant && (
                <button
                  onClick={() => setShowTenantUserManagement(true)}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '18px',
                    boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👥</span>
                  Manage Users
                </button>
              )}
              
              {/* Super Admin Dashboard - Only available to super_admin users */}
              {canSuperAdmin(user) && (
                <button
                  onClick={() => setShowSuperAdminDashboard(true)}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 32px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '18px',
                    boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>👑</span>
                  Super Admin
                </button>
              )}
            </div>
            )}
          </div>
          )}

          {/* Modern Item Grid */}
          <ProgressiveLoader
            loading={!initialDataLoaded}
            skeletonType="dashboard"
            skeletonCount={3}
            loadingMessage="Loading Property Dashboard..."
            showProgress={evidenceLoading}
            progress={evidenceProgress}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>
                      Your Stolen Items
                    </h2>
                    <p style={{ fontSize: '20px', color: '#6b7280' }}>
                      {displayItems.length} items {isFiltered ? 'found' : 'documented'} • {formatCurrency(displayTotalValue)} {isFiltered ? 'filtered' : 'total'} value
                      {isFiltered && (
                        <button
                          onClick={() => {
                            setIsFiltered(false)
                            setFilteredItems([])
                          }}
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginLeft: '12px'
                          }}
                        >
                          Clear Filter
                        </button>
                      )}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Sort Controls */}
                    <SimpleSortControls 
                      onSortChange={handleSortChange}
                      currentField={sortField}
                      currentOrder={sortOrder}
                      showLabel={true}
                    />
                    
                    {/* View Mode Toggle */}
                    <div style={{ 
                      display: 'flex', 
                      background: '#f3f4f6', 
                      borderRadius: '12px', 
                      padding: '4px',
                      minWidth: isMobile ? '140px' : 'auto',
                    }}>
                      <button
                        onClick={() => setViewMode('cards')}
                        style={{
                          background: viewMode === 'cards' ? '#3b82f6' : 'transparent',
                          color: viewMode === 'cards' ? 'white' : '#6b7280',
                          border: 'none',
                          padding: isMobile ? '10px 12px' : '8px 16px',
                          borderRadius: '8px',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flex: 1
                        }}
                      >
                        <svg style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          padding: isMobile ? '10px 12px' : '8px 16px',
                          borderRadius: '8px',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flex: 1
                        }}
                      >
                        <svg style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        List
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setBulkMode(!bulkMode)}
                      style={{
                        background: bulkMode ? '#dc2626' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {bulkMode ? '✕ Exit Bulk Mode' : '☑️ Bulk Select'}
                    </button>
                  </div>
                </div>

              {/* Bulk Operations Toolbar */}
              {bulkMode && (
                <div style={{
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                        Bulk Operations
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '16px' }}>
                        {selectedItems.size} of {displayItems.length} items selected
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={selectAllItems}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearSelection}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  {selectedItems.size > 0 && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          const selectedItemsData = displayItems.filter(item => selectedItems.has(item.id))
                          const totalValue = selectedItemsData.reduce((sum, item) => sum + item.estimatedValue, 0)
                          alert(`Export ${selectedItems.size} items\nTotal value: ${formatCurrency(totalValue)}\n\nExport functionality coming soon!`)
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        📄 Export Selected
                      </button>
                      
                      <button
                        onClick={() => {
                          alert(`Tag ${selectedItems.size} items\n\nBulk tagging functionality coming soon!`)
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🏷️ Tag All
                      </button>
                      
                      <button
                        onClick={handleBulkDuplicate}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        📋 Duplicate Selected
                      </button>
                      
                      <button
                        onClick={() => setShowTenantIsolationTest(true)}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🛡️ Test Tenant Isolation
                      </button>
                      
                      <button
                        onClick={() => setShowPerformanceTest(true)}
                        style={{
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        📊 Performance Test
                      </button>
                      
                      <button
                        onClick={() => setShowEdgeCaseTest(true)}
                        style={{
                          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🧪 Edge Case Test
                      </button>
                      
                      <button
                        onClick={handleBulkDelete}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🗑️ Delete Selected
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {displayItems.length === 0 ? (
              <div style={{ 
                background: 'white', 
                borderRadius: '24px', 
                padding: '48px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <EmptyState
                  title={isFiltered ? "No items found" : "No items documented yet"}
                  message={isFiltered 
                    ? "Try adjusting your search criteria to find items."
                    : "Start building your professional stolen property database for law enforcement"
                  }
                  icon="📦"
                  action={
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                      {isFiltered ? (
                        <button
                          onClick={() => {
                            setIsFiltered(false)
                            setFilteredItems([])
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px',
                            boxShadow: '0 8px 20px rgba(107, 114, 128, 0.3)'
                          }}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFormItem(null)
                            setShowModernForm(true)
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '18px',
                            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          Add First Item
                        </button>
                      )}
                    </div>
                  }
                />
              </div>
            ) : viewMode === 'cards' ? (
              <div key={refreshKey} style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: isMobile ? '16px' : '32px',
                width: '100%',
                boxSizing: 'border-box',
                maxWidth: '100%',
                padding: isMobile ? '0 4px' : '0'
              }}>
                {displayItems.map((item) => (
                  <div key={item.id} style={{
                    background: 'white',
                    borderRadius: isMobile ? '16px' : '20px',
                    padding: isMobile ? '16px' : '32px',
                    boxShadow: selectedItems.has(item.id) ? '0 32px 64px rgba(59, 130, 246, 0.2)' : '0 20px 40px rgba(0, 0, 0, 0.08)',
                    border: selectedItems.has(item.id) ? '2px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 32px 64px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'
                  }}>
                    {/* Bulk Selection Checkbox */}
                    {bulkMode && (
                      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            accentColor: '#3b82f6',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}

                    {/* Header with Action Menu */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: isMobile ? 'flex-start' : 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: isMobile ? '16px' : '24px',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '12px' : '0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', width: isMobile ? '100%' : 'auto' }}>
                        <ItemCardIcon item={item} size={isMobile ? 60 : 80} evidence={evidenceCache[item.id]} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                            {item.name}
                          </h3>
                          <p style={{ color: '#6b7280', fontSize: isMobile ? '12px' : '14px', marginBottom: '4px' }}>
                            ID: {item.id}
                          </p>
                          {item.serialNumber && (
                            <p style={{
                              color: '#92400e',
                              fontSize: isMobile ? '12px' : '14px',
                              fontWeight: '600',
                              fontFamily: 'monospace',
                              background: '#fef3c7',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              Serial: {item.serialNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Menu Button */}
                      <div style={{ position: 'relative', alignSelf: isMobile ? 'flex-end' : 'auto' }}>
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === item.id ? null : item.id)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.05)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        
                        {/* Action Menu Dropdown */}
                        {showActionMenu === item.id && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            marginTop: '8px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                            minWidth: '200px'
                          }}>
                            <div style={{ padding: '8px' }}>
                              <button
                                onClick={() => {
                                  setShowActionMenu(null)
                                  setEditingFormItem(item)
                                  setShowModernForm(true)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'transparent',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                }}
                              >
                                <span style={{ fontSize: '16px' }}>✏️</span>
                                <span style={{ fontWeight: '500', color: '#374151' }}>Edit Item</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setShowActionMenu(null)
                                  handleDuplicateItem(item)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'transparent',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                }}
                              >
                                <span style={{ fontSize: '16px' }}>📋</span>
                                <span style={{ fontWeight: '500', color: '#374151' }}>Duplicate Item</span>
                              </button>
                              
                              <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 16px' }}></div>
                              
                              <button
                                onClick={() => {
                                  setShowActionMenu(null)
                                  handleDeleteItem(item)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'transparent',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = '#fef2f2'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                }}
                              >
                                <span style={{ fontSize: '16px' }}>🗑️</span>
                                <span style={{ fontWeight: '500', color: '#dc2626' }}>Delete Item</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Value Badge - Different layout for mobile */}
                    <div style={{
                      position: isMobile ? 'static' : 'absolute',
                      top: '24px',
                      right: '24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: isMobile ? '10px 16px' : '8px 16px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: isMobile ? '18px' : '16px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      marginBottom: isMobile ? '16px' : '0',
                      textAlign: isMobile ? 'center' : 'left'
                    }}>
                      {formatCurrency(item.estimatedValue)}
                    </div>

                    <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                      {item.description}
                    </p>

                    {/* Additional Photos Indicator */}
                    {evidenceCache[item.id]?.filter(e => e.type === 'photo')?.length > 1 && (
                      <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        fontSize: '12px',
                        color: '#1e40af',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        📷 {(evidenceCache[item.id]?.filter(e => e.type === 'photo').length || 0) - 1} more photos available
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {evidenceCache[item.id]?.filter(e => e.type === 'photo')?.length > 0 && (
                        <div style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          📷 {evidenceCache[item.id].filter(e => e.type === 'photo').length}
                        </div>
                      )}
                      {evidenceCache[item.id]?.filter(e => e.type === 'video')?.length > 0 && (
                        <div style={{
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          🎥 {evidenceCache[item.id].filter(e => e.type === 'video').length}
                        </div>
                      )}
                      {evidenceCache[item.id]?.filter(e => e.type === 'document')?.length > 0 && (
                        <div style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          📄 {evidenceCache[item.id].filter(e => e.type === 'document').length}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                      <button
                        onClick={() => {
                          if (isMobile) {
                            // Navigate to dedicated page on mobile
                            router.push(`/item/${item.id}`)
                          } else {
                            // Use modal on desktop
                            setDetailViewItem(item)
                            setShowDetailView(true)
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          boxShadow: '0 4px 12px rgba(31, 41, 55, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(31, 41, 55, 0.4)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 41, 55, 0.3)'
                        }}
                      >
                        👁️ View Full Details
                      </button>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowSimpleUpload(true)
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          📸 Upload
                        </button>
                        
                        <button
                          onClick={() => {
                            if (isMobile) {
                              router.push(`/item/${item.id}/evidence`)
                            } else {
                              setEvidenceManagementItem(item)
                              setShowEvidenceManagement(true)
                            }
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          🛠️ Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div key={refreshKey} style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
                }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {bulkMode && (
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>
                          <input
                            type="checkbox"
                            checked={selectedItems.size === allItems.length && allItems.length > 0}
                            onChange={() => {
                              if (selectedItems.size === allItems.length) {
                                clearSelection()
                              } else {
                                selectAllItems()
                              }
                            }}
                            style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                          />
                        </th>
                      )}
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Item</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Description</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Serial #</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Value</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Evidence</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item, index) => (
                      <tr key={item.id} style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        background: index % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        {bulkMode && (
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                            />
                          </td>
                        )}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ItemCardIcon item={item} size={48} evidence={evidenceCache[item.id]} />
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
                        <td style={{ padding: '16px', maxWidth: '250px' }}>
                          <div style={{ color: '#374151', lineHeight: '1.4' }}>
                            {item.description.length > 100 
                              ? `${item.description.substring(0, 100)}...`
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
                            {evidenceCache[item.id]?.filter(e => e.type === 'photo')?.length > 0 && (
                              <span style={{
                                background: '#dbeafe',
                                color: '#1e40af',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                📷 {evidenceCache[item.id].filter(e => e.type === 'photo').length}
                              </span>
                            )}
                            {evidenceCache[item.id]?.filter(e => e.type === 'video')?.length > 0 && (
                              <span style={{
                                background: '#dcfce7',
                                color: '#166534',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                🎥 {evidenceCache[item.id].filter(e => e.type === 'video').length}
                              </span>
                            )}
                            {evidenceCache[item.id]?.filter(e => e.type === 'document')?.length > 0 && (
                              <span style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                📄 {evidenceCache[item.id].filter(e => e.type === 'document').length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setDetailViewItem(item)
                                setShowDetailView(true)
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                setShowSimpleUpload(true)
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Upload
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </ProgressiveLoader>

          {/* Modern Item Form Modal */}
          {showModernForm && (
            <ModernItemForm
              mode={editingFormItem ? 'edit' : 'create'}
              initialData={editingFormItem ? {
                name: editingFormItem.name,
                description: editingFormItem.description,
                serialNumber: editingFormItem.serialNumber,
                purchaseDate: editingFormItem.purchaseDate,
                purchaseCost: editingFormItem.purchaseCost,
                dateLastSeen: editingFormItem.dateLastSeen,
                locationLastSeen: editingFormItem.locationLastSeen,
                estimatedValue: editingFormItem.estimatedValue,
                category: (editingFormItem as any).category || '',
                tags: (editingFormItem as any).tags || [],
                notes: (editingFormItem as any).notes || ''
              } : undefined}
              tenantId={user.tenant?.id}
              userId={user.id}
              onClose={() => {
                setShowModernForm(false)
                setEditingFormItem(null)
              }}
              onSubmit={handleModernFormSubmit}
            />
          )}

          {/* Item Detail View Modal */}
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
                setEditingFormItem(item)
                setShowModernForm(true)
              }}
              onDelete={(item) => {
                setShowDetailView(false)
                setDetailViewItem(null)
                handleDeleteItem(item)
              }}
              onDuplicate={(item) => {
                setShowDetailView(false)
                setDetailViewItem(null)
                handleDuplicateItem(item)
              }}
              onUploadEvidence={(item) => {
                setShowDetailView(false)
                setDetailViewItem(null)
                setSelectedItem(item)
                setShowSimpleUpload(true)
              }}
              evidence={evidenceCache[detailViewItem.id]}
              user={user}
              onCategoryUpdate={(itemId: number, newCategory: string) => {
                // Update the item in the local state
                setAllItems((prevItems: StolenItem[]) => 
                  prevItems.map((item: StolenItem) => 
                    item.id === itemId 
                      ? { ...item, category: newCategory }
                      : item
                  )
                )
                // Update the detail view item if it's the same item
                if (detailViewItem && detailViewItem.id === itemId) {
                  setDetailViewItem(prev => prev ? { ...prev, category: newCategory } : null)
                }
              }}
            />
          )}

          {/* Enhanced Evidence Management Modal */}
          {showEvidenceManagement && evidenceManagementItem && (
            <EnhancedEvidenceManager
              item={evidenceManagementItem}
              onClose={() => {
                setShowEvidenceManagement(false)
                setEvidenceManagementItem(null)
              }}
              onUpdate={async () => {
                // Reload items to show updated evidence counts
                const updatedItems = await getAllItems()
                setAllItems(updatedItems)
                setShowEvidenceManagement(false)
                setEvidenceManagementItem(null)
              }}
            />
          )}

          {/* Enhanced Evidence Upload Modal */}
          {showSimpleUpload && selectedItem && (
            <EnhancedEvidenceUpload
              item={selectedItem}
              onClose={() => {
                setShowSimpleUpload(false)
                setSelectedItem(null)
              }}
              onSuccess={async () => {
                const updatedItems = await getAllItems()
                setAllItems(updatedItems)
                setShowSimpleUpload(false)
                setSelectedItem(null)
              }}
            />
          )}


          {/* Bulk Upload Modal */}
          {showBulkUpload && (
            <BulkUpload
              items={allItems}
              onClose={() => setShowBulkUpload(false)}
              onSuccess={async () => {
                const updatedItems = await getAllItems()
                setAllItems(updatedItems)
                setTotalValue(await getTotalValue())
                setShowBulkUpload(false)
              }}
            />
          )}

          {/* Advanced Search Modal */}
          {showAdvancedSearch && (
            <AdvancedSearch
              items={allItems}
              user={user}
              onClose={() => setShowAdvancedSearch(false)}
              onResults={(results) => {
                setFilteredItems(results)
                setIsFiltered(true)
                setShowAdvancedSearch(false)
              }}
            />
          )}

          {/* Generate Report Modal */}
          {showGenerateReport && (
            <GenerateReport
              items={isFiltered ? filteredItems : allItems}
              onClose={() => setShowGenerateReport(false)}
            />
          )}

          {/* Analytics Dashboard Modal */}
          {showAnalytics && (
            <AnalyticsDashboard
              items={isFiltered ? filteredItems : allItems}
              user={user}
              onClose={() => setShowAnalytics(false)}
            />
          )}

          {/* Export Manager Modal */}
          {showExportManager && (
            <ExportManager
              items={isFiltered ? filteredItems : allItems}
              user={user}
              onClose={() => setShowExportManager(false)}
            />
          )}

          {/* Professional Report Generator Modal */}
          {showReportGenerator && (
            <ReportGenerator
              items={isFiltered ? filteredItems : allItems}
              user={user}
              onClose={() => setShowReportGenerator(false)}
            />
          )}

          {/* CSV Import Modal */}
          {showCSVImport && (
            <CSVImport
              items={isFiltered ? filteredItems : allItems}
              onClose={() => setShowCSVImport(false)}
              onSuccess={async () => {
                // Refresh the items list after successful import
                try {
                  const updatedItems = await getAllItems()
                  setAllItems(updatedItems)
                  const updatedTotal = updatedItems.reduce((sum, item) => sum + item.estimatedValue, 0)
                  setTotalValue(updatedTotal)
                } catch (error) {
                  console.error('Error refreshing items after CSV import:', error)
                }
                setShowCSVImport(false)
              }}
            />
          )}

          {/* Tenant Isolation Stress Test Modal */}
          {showTenantIsolationTest && user && (
            <TenantIsolationStressTest
              currentUser={user}
              onClose={() => setShowTenantIsolationTest(false)}
            />
          )}

          {/* Performance Stress Test Modal */}
          {showPerformanceTest && user && (
            <PerformanceStressTest
              currentUser={user}
              onClose={() => setShowPerformanceTest(false)}
            />
          )}

          {/* Edge Case Stress Test Modal */}
          {showEdgeCaseTest && user && (
            <EdgeCaseStressTest
              currentUser={user}
              onClose={() => setShowEdgeCaseTest(false)}
            />
          )}

          {/* Super Admin Dashboard Modal */}
          {showSuperAdminDashboard && user && (
            <SuperAdminDashboard
              currentUser={user}
              onClose={() => setShowSuperAdminDashboard(false)}
            />
          )}

          {/* Tenant User Management Modal */}
          {showTenantUserManagement && user && user.tenant && (
            <TenantUserManagement
              tenant={user.tenant}
              onClose={() => setShowTenantUserManagement(false)}
              onUpdate={() => {
                // Refresh user profile to get updated tenant data
                refreshUser()
              }}
            />
          )}

          {/* Case Details View Modal */}
          {showCaseDetailsView && user && (
            <CaseDetailsView
              user={user}
              caseId={editingCaseId}
              onClose={() => {
                setShowCaseDetailsView(false)
                setEditingCaseId(null)
              }}
              onEdit={(caseId) => {
                setEditingCaseId(caseId)
                setShowCaseDetailsView(false)
                setShowCaseDetailsForm(true)
              }}
            />
          )}

          {/* Case Details Form Modal */}
          {showCaseDetailsForm && user && (
            <CaseDetailsForm
              user={user}
              caseId={editingCaseId}
              onClose={() => {
                setShowCaseDetailsForm(false)
                setEditingCaseId(null)
              }}
              onSave={async () => {
                // Refresh to show updated case
                setShowCaseDetailsForm(false)
                setEditingCaseId(null)
                // Check for existing case again to update button label
                await checkExistingCase()
              }}
            />
          )}
        </div>
      </div>
    </div>
    )
  }

  // Stakeholder dashboard for all non-property owners
  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        {/* PWA Service Worker - DISABLED FOR DEBUGGING */}
        {/* <PWAServiceWorker /> */}
        
        {/* Notification System - ALL DISABLED FOR DEBUGGING */}
        {/* <NotificationManager user={user} items={allItems} /> */}
        {/* <NotificationContainer /> */}
        
        {/* Desktop View */}
      
      {/* Property Onboarding Check for Property Owners */}
      {user && user.role === 'property_owner' && !user.tenantId && (
        <div style={{
          maxWidth: '800px',
          margin: '40px auto',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              fontSize: '40px'
            }}>
              🏢
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Welcome to REMISE Asset Barn!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              You haven't set up your property details yet. This helps us customize your experience and provides important information for stakeholders.
            </p>
            <button
              onClick={() => window.location.href = '/property-onboarding'}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                marginRight: '12px'
              }}
            >
              Set Up My Property
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '16px 32px',
                background: 'none',
                color: '#6b7280',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                border: '1px solid #d1d5db'
              }}
            >
              Skip for Now
            </button>
          </div>
        </div>
      )}

      {/* SuperAdmin Dashboard */}
      {user && user.role === 'super_admin' && (() => {
        console.log('Rendering SuperAdminDashboard for user:', user.name, 'role:', user.role);
        return (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px'
          }}>
            <SuperAdminDashboard 
              currentUser={user}
              // No onClose prop for main dashboard - this makes it non-modal
            />
          </div>
        );
      })()}

      {/* Main Dashboard Content - Only show if user is not super_admin and (property is set up or user is not a property owner) */}
      {user && user.role !== 'super_admin' && !(user && user.role === 'property_owner' && !user.tenantId) && (
        <>
          {/* Mobile Header for Stakeholders */}
          {isMobile && (
            <MobileHeader
              user={user}
              textColor={textColor}
              textColorSecondary={textColorSecondary}
              onViewModeChange={setViewMode}
              currentViewMode={viewMode}
            />
          )}
          <ProgressiveLoader
            loading={!initialDataLoaded}
            skeletonType="dashboard"
            skeletonCount={6}
            loadingMessage="Loading Dashboard..."
            showProgress={evidenceLoading}
            progress={evidenceProgress}
          >
            <StakeholderDashboard 
              user={user} 
              items={allItems} 
              onItemsUpdate={(updatedItems) => setAllItems(updatedItems)}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
              evidenceCache={evidenceCache}
              evidenceLoaded={evidenceLoaded}
              isMobile={isMobile}
            />
          </ProgressiveLoader>
        </>
      )}
        
        {/* Evidence loading overlay */}
        {evidenceLoading && (
          <div style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Loading Evidence
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {evidenceProgress}% complete
              </div>
            </div>
          </div>
        )}
    </div>
    </>
  )
}

// Wrapper to provide UserPreferencesContext after user is loaded
function AppContent() {
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          // Fix: Use userData.user instead of userData directly
          setUser(userData.user)
        } else {
          router.push('/login-simple')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login-simple')
      } finally {
        setUserLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (userLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            Loading Application
          </h2>
          <p style={{ color: '#6b7280' }}>Setting up your personalized experience...</p>
        </div>
      </div>
    )
  }

  return (
    <UserPreferencesProvider user={user}>
      <AppContentInner initialUser={user} />
    </UserPreferencesProvider>
  )
}

export default function Home() {
  return <AppContent />
}