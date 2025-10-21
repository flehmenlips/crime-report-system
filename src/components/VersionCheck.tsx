'use client'

import { useEffect } from 'react'

const CURRENT_VERSION = '1.8.5' // Update this with each release

export function VersionCheck() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Check stored version
        const storedVersion = localStorage.getItem('app_version')
        
        // If version changed, force refresh
        if (storedVersion && storedVersion !== CURRENT_VERSION) {
          console.log(`Version changed from ${storedVersion} to ${CURRENT_VERSION}. Clearing cache...`)
          
          // Clear all caches
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(name => caches.delete(name)))
          }
          
          // Clear localStorage (except important user data)
          const keysToKeep = ['user_preferences_', 'app_version']
          Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.some(keep => key.startsWith(keep))) {
              localStorage.removeItem(key)
            }
          })
          
          // Update version
          localStorage.setItem('app_version', CURRENT_VERSION)
          
          // Force reload from server (bypass cache)
          window.location.reload()
        } else if (!storedVersion) {
          // First time, just set version
          localStorage.setItem('app_version', CURRENT_VERSION)
        }
      } catch (err) {
        console.error('Version check failed:', err)
      }
    }

    // Run version check on mount
    checkVersion()

    // Also check every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return null // This component doesn't render anything
}

