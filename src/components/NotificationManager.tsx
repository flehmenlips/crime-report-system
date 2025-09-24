'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { User } from '@/lib/auth'

interface NotificationManagerProps {
  user: User | null
  items: any[]
}

export function NotificationManager({ user, items }: NotificationManagerProps) {
  const { addNotification } = useNotifications()

  // System notifications based on app state
  useEffect(() => {
    if (!user) return

    // Welcome notification for new users
    if (user.role === 'property_owner' && items.length === 0) {
      addNotification({
        type: 'info',
        title: 'Welcome to Crime Report System!',
        message: 'Start by adding your first stolen item to get organized.',
        persistent: true,
        actions: [
          {
            label: 'Add Item',
            action: () => {
              // This would trigger the add item modal
              console.log('Add item action triggered')
            },
            style: 'primary'
          }
        ]
      })
    }

    // High-value item alert
    const highValueItems = items.filter(item => item.estimatedValue > 5000)
    if (highValueItems.length > 0) {
      addNotification({
        type: 'alert',
        title: 'High-Value Items Detected',
        message: `You have ${highValueItems.length} item(s) valued over $5,000. Consider additional documentation.`,
        persistent: true,
        actions: [
          {
            label: 'View Items',
            action: () => {
              console.log('View high-value items')
            },
            style: 'primary'
          }
        ]
      })
    }

    // Evidence reminder
    const itemsWithoutEvidence = items.filter(item => 
      !item.evidence || item.evidence.length === 0
    )
    if (itemsWithoutEvidence.length > 0 && itemsWithoutEvidence.length <= 3) {
      addNotification({
        type: 'warning',
        title: 'Add Evidence to Items',
        message: `${itemsWithoutEvidence.length} item(s) need evidence documentation for better recovery chances.`,
        persistent: false,
        actions: [
          {
            label: 'Add Evidence',
            action: () => {
              console.log('Add evidence action')
            },
            style: 'primary'
          }
        ]
      })
    }

    // Backup reminder
    const lastBackup = localStorage.getItem('lastBackup')
    const daysSinceBackup = lastBackup 
      ? (Date.now() - parseInt(lastBackup)) / (1000 * 60 * 60 * 24)
      : Infinity

    if (daysSinceBackup > 7) {
      addNotification({
        type: 'info',
        title: 'Backup Recommended',
        message: 'Your data hasn\'t been backed up in a while. Consider exporting your data.',
        persistent: false,
        actions: [
          {
            label: 'Export Data',
            action: () => {
              console.log('Export data action')
            },
            style: 'primary'
          }
        ]
      })
    }

  }, [user, items, addNotification])

  // Network status notifications
  useEffect(() => {
    const handleOnline = () => {
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'You\'re back online. All data has been synchronized.',
        persistent: false
      })
    }

    const handleOffline = () => {
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You\'re currently offline. Some features may be limited.',
        persistent: false
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addNotification])

  // Error handling notifications
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        addNotification({
          type: 'error',
          title: 'System Error',
          message: 'An unexpected error occurred. Please refresh the page if issues persist.',
          persistent: true,
          actions: [
            {
              label: 'Refresh Page',
              action: () => window.location.reload(),
              style: 'primary'
            }
          ]
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'A network request failed. Please check your connection and try again.',
        persistent: false
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [addNotification])

  // Security notifications
  useEffect(() => {
    if (!user) return

    // Session timeout warning
    const sessionTimeout = 30 * 60 * 1000 // 30 minutes
    const lastActivity = localStorage.getItem('lastActivity')
    
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity)
      const timeUntilTimeout = sessionTimeout - timeSinceActivity

      if (timeUntilTimeout > 0 && timeUntilTimeout < 5 * 60 * 1000) { // 5 minutes warning
        addNotification({
          type: 'warning',
          title: 'Session Expiring Soon',
          message: 'Your session will expire in a few minutes. Save your work.',
          persistent: true,
          actions: [
            {
              label: 'Extend Session',
              action: () => {
                localStorage.setItem('lastActivity', Date.now().toString())
                addNotification({
                  type: 'success',
                  title: 'Session Extended',
                  message: 'Your session has been extended.',
                  persistent: false
                })
              },
              style: 'primary'
            }
          ]
        })
      }
    }

    // Update last activity
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [user, addNotification])

  // Performance notifications
  useEffect(() => {
    // Check for slow loading
    const startTime = performance.now()
    
    const checkPerformance = () => {
      const loadTime = performance.now() - startTime
      
      if (loadTime > 3000) { // 3 seconds
        addNotification({
          type: 'warning',
          title: 'Slow Loading Detected',
          message: 'The app is loading slowly. Consider checking your internet connection.',
          persistent: false
        })
      }
    }

    // Check performance after initial load
    setTimeout(checkPerformance, 1000)

    // Monitor memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit

      if (memoryUsage > 0.8) { // 80% memory usage
        addNotification({
          type: 'warning',
          title: 'High Memory Usage',
          message: 'The app is using a lot of memory. Consider refreshing the page.',
          persistent: false,
          actions: [
            {
              label: 'Refresh Page',
              action: () => window.location.reload(),
              style: 'primary'
            }
          ]
        })
      }
    }
  }, [addNotification])

  return null // This component doesn't render anything
}

// Utility functions for creating notifications
export const createNotificationHelpers = (addNotification: (notification: any) => void) => ({
  // Success notifications
  itemCreated: (itemName: string) => {
    addNotification({
      type: 'success',
      title: 'Item Added Successfully',
      message: `"${itemName}" has been added to your inventory.`,
      persistent: false
    })
  },

  itemUpdated: (itemName: string) => {
    addNotification({
      type: 'success',
      title: 'Item Updated',
      message: `"${itemName}" has been updated successfully.`,
      persistent: false
    })
  },

  itemDeleted: (itemName: string) => {
    addNotification({
      type: 'success',
      title: 'Item Deleted',
      message: `"${itemName}" has been removed from your inventory.`,
      persistent: false
    })
  },

  evidenceUploaded: (fileName: string) => {
    addNotification({
      type: 'success',
      title: 'Evidence Uploaded',
      message: `"${fileName}" has been uploaded successfully.`,
      persistent: false
    })
  },

  // Error notifications
  uploadFailed: (fileName: string, error: string) => {
    addNotification({
      type: 'error',
      title: 'Upload Failed',
      message: `Failed to upload "${fileName}": ${error}`,
      persistent: true,
      actions: [
        {
          label: 'Try Again',
          action: () => console.log('Retry upload'),
          style: 'primary'
        }
      ]
    })
  },

  networkError: () => {
    addNotification({
      type: 'error',
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      persistent: true,
      actions: [
        {
          label: 'Retry',
          action: () => window.location.reload(),
          style: 'primary'
        }
      ]
    })
  },

  // Warning notifications
  unsavedChanges: () => {
    addNotification({
      type: 'warning',
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Save your work before leaving.',
      persistent: true,
      actions: [
        {
          label: 'Save Now',
          action: () => console.log('Save changes'),
          style: 'primary'
        }
      ]
    })
  },

  // Info notifications
  dataExported: (format: string) => {
    addNotification({
      type: 'info',
      title: 'Export Complete',
      message: `Your data has been exported in ${format.toUpperCase()} format.`,
      persistent: false
    })
  },

  reportGenerated: () => {
    addNotification({
      type: 'info',
      title: 'Report Generated',
      message: 'Your report has been generated and is ready for download.',
      persistent: false
    })
  }
})
