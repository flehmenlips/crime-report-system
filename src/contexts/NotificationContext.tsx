'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '@/lib/auth'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  persistent?: boolean
  actions?: NotificationAction[]
  userId?: string
  tenantId?: string
  metadata?: Record<string, any>
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  subscribe: (callback: (notification: Notification) => void) => () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
  user: User | null
}

export function NotificationProvider({ children, user }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [subscribers, setSubscribers] = useState<Set<(notification: Notification) => void>>(new Set())

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Add notification
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [notification, ...prev])
    
    // Notify subscribers
    subscribers.forEach(callback => callback(notification))

    // Auto-remove non-persistent notifications after 5 seconds
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.svg',
        tag: notification.id,
        requireInteraction: notification.persistent
      })
    }

    return notification
  }, [subscribers])

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Subscribe to notifications
  const subscribe = useCallback((callback: (notification: Notification) => void) => {
    setSubscribers(prev => new Set([...prev, callback]))
    
    return () => {
      setSubscribers(prev => {
        const newSet = new Set(prev)
        newSet.delete(callback)
        return newSet
      })
    }
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(notificationsWithDates)
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error)
      }
    }
  }, [])

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  // Set up periodic checks for new notifications (simulate real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // This would typically connect to a WebSocket or polling endpoint
      // For now, we'll simulate occasional system notifications
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        addNotification({
          type: 'info',
          title: 'System Update',
          message: 'Your data has been automatically backed up.',
          persistent: false
        })
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [addNotification])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    subscribe
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
