'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'

interface UserPreferences {
  // View preferences
  viewMode: 'cards' | 'list'
  sortField: 'name' | 'value' | 'date' | 'category' | 'serialNumber' | 'location' | 'evidence'
  sortOrder: 'asc' | 'desc'
  
  // Dashboard preferences
  dashboardLayout: 'compact' | 'spacious'
  showAdvancedSearch: boolean
  showAnalytics: boolean
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  
  // Feature preferences
  autoRefresh: boolean
  showNotifications: boolean
}

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetPreferences: () => void
  clearStorageQuota: () => void
  isLoading: boolean
}

const defaultPreferences: UserPreferences = {
  viewMode: 'cards',
  sortField: 'date',
  sortOrder: 'desc',
  dashboardLayout: 'spacious',
  showAdvancedSearch: true,
  showAnalytics: true,
  theme: 'auto',
  sidebarCollapsed: false,
  autoRefresh: true,
  showNotifications: true
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

interface UserPreferencesProviderProps {
  children: ReactNode
  user: User | null
}

// Utility function to clean up localStorage
const cleanupLocalStorage = () => {
  try {
    // Clear any corrupted or oversized preference data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_preferences_')) {
        const value = localStorage.getItem(key)
        if (value && value.length > 100000) { // 100KB limit per user
          console.warn(`Removing oversized preference data for key: ${key}`)
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('Error during localStorage cleanup:', error)
  }
}

export function UserPreferencesProvider({ children, user }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)

  // Clean up localStorage on mount
  useEffect(() => {
    cleanupLocalStorage()
  }, [])

  // Load preferences from localStorage when user changes
  useEffect(() => {
    if (!user) {
      setPreferences(defaultPreferences)
      setIsLoading(false)
      return
    }

    const loadPreferences = () => {
      try {
        const key = `user_preferences_${user.id}`
        const saved = localStorage.getItem(key)
        
        if (saved) {
          const parsedPreferences = JSON.parse(saved)
          // Merge with defaults to handle new preference fields
          setPreferences({ ...defaultPreferences, ...parsedPreferences })
        } else {
          setPreferences(defaultPreferences)
        }
      } catch (error) {
        console.error('Error loading user preferences:', error)
        setPreferences(defaultPreferences)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [user])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (!user || isLoading) return

    const savePreferences = () => {
      try {
        const key = `user_preferences_${user.id}`
        const preferencesJson = JSON.stringify(preferences)
        
        // Check if the data is too large for localStorage
        if (preferencesJson.length > 5000000) { // 5MB limit
          console.warn('User preferences too large for localStorage, clearing old data')
          // Clear all user preference keys to free up space
          Object.keys(localStorage).forEach(storageKey => {
            if (storageKey.startsWith('user_preferences_')) {
              localStorage.removeItem(storageKey)
            }
          })
        }
        
        localStorage.setItem(key, preferencesJson)
        console.log('✅ User preferences saved successfully')
      } catch (error) {
        console.error('Error saving user preferences:', error)
        
        // If it's a quota exceeded error, try to clear some space
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, attempting cleanup...')
          try {
            // Clear all user preference keys to free up space
            Object.keys(localStorage).forEach(storageKey => {
              if (storageKey.startsWith('user_preferences_')) {
                localStorage.removeItem(storageKey)
              }
            })
            
            // Try saving again with just the current user's preferences
            const key = `user_preferences_${user.id}`
            localStorage.setItem(key, JSON.stringify(preferences))
            console.log('✅ User preferences saved after cleanup')
          } catch (cleanupError) {
            console.error('Failed to save preferences even after cleanup:', cleanupError)
            // If we still can't save, at least the preferences are in memory
            console.warn('Preferences will be lost on page refresh due to storage quota')
          }
        }
      }
    }

    savePreferences()
  }, [preferences, user, isLoading])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  const clearStorageQuota = () => {
    try {
      // Clear all user preference keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_preferences_')) {
          localStorage.removeItem(key)
        }
      })
      console.log('✅ Cleared all user preference storage')
    } catch (error) {
      console.error('Error clearing storage quota:', error)
    }
  }

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    clearStorageQuota,
    isLoading
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}

// Hook for specific preference categories
export function useViewPreferences() {
  const { preferences, updatePreferences } = useUserPreferences()
  
  return {
    viewMode: preferences.viewMode,
    sortField: preferences.sortField,
    sortOrder: preferences.sortOrder,
    setViewMode: (mode: 'cards' | 'list') => updatePreferences({ viewMode: mode }),
    setSortField: (field: UserPreferences['sortField']) => updatePreferences({ sortField: field }),
    setSortOrder: (order: 'asc' | 'desc') => updatePreferences({ sortOrder: order })
  }
}

export function useDashboardPreferences() {
  const { preferences, updatePreferences } = useUserPreferences()
  
  return {
    dashboardLayout: preferences.dashboardLayout,
    showAdvancedSearch: preferences.showAdvancedSearch,
    showAnalytics: preferences.showAnalytics,
    setDashboardLayout: (layout: 'compact' | 'spacious') => updatePreferences({ dashboardLayout: layout }),
    setShowAdvancedSearch: (show: boolean) => updatePreferences({ showAdvancedSearch: show }),
    setShowAnalytics: (show: boolean) => updatePreferences({ showAnalytics: show })
  }
}

export function useUIPreferences() {
  const { preferences, updatePreferences } = useUserPreferences()
  
  return {
    theme: preferences.theme,
    sidebarCollapsed: preferences.sidebarCollapsed,
    setTheme: (theme: 'light' | 'dark' | 'auto') => updatePreferences({ theme }),
    setSidebarCollapsed: (collapsed: boolean) => updatePreferences({ sidebarCollapsed: collapsed })
  }
}

export function useFeaturePreferences() {
  const { preferences, updatePreferences } = useUserPreferences()
  
  return {
    autoRefresh: preferences.autoRefresh,
    showNotifications: preferences.showNotifications,
    setAutoRefresh: (enabled: boolean) => updatePreferences({ autoRefresh: enabled }),
    setShowNotifications: (enabled: boolean) => updatePreferences({ showNotifications: enabled })
  }
}
