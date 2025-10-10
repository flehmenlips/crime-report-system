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

export function UserPreferencesProvider({ children, user }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)

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
        localStorage.setItem(key, JSON.stringify(preferences))
      } catch (error) {
        console.error('Error saving user preferences:', error)
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

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
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
