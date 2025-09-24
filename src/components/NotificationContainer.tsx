'use client'

import { useEffect, useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationToast } from './NotificationToast'

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()
  const [displayedNotifications, setDisplayedNotifications] = useState<string[]>([])

  // Show only the latest 3 notifications as toasts
  const toastNotifications = notifications
    .filter(notification => !notification.persistent)
    .slice(0, 3)

  // Update displayed notifications
  useEffect(() => {
    const newDisplayed = toastNotifications.map(n => n.id)
    setDisplayedNotifications(prev => {
      const toRemove = prev.filter(id => !newDisplayed.includes(id))
      const toAdd = newDisplayed.filter(id => !prev.includes(id))
      
      // Remove old notifications
      toRemove.forEach(id => {
        setTimeout(() => {
          setDisplayedNotifications(current => current.filter(currentId => currentId !== id))
        }, 300)
      })
      
      return [...prev.filter(id => !toRemove.includes(id)), ...toAdd]
    })
  }, [toastNotifications])

  const handleNotificationClose = (id: string) => {
    removeNotification(id)
    setDisplayedNotifications(prev => prev.filter(notificationId => notificationId !== id))
  }

  const handleNotificationAction = (action: any) => {
    action.action()
  }

  if (displayedNotifications.length === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}
    >
      {toastNotifications
        .filter(notification => displayedNotifications.includes(notification.id))
        .map((notification) => (
          <div
            key={notification.id}
            style={{
              pointerEvents: 'auto',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <NotificationToast
              notification={notification}
              onClose={() => handleNotificationClose(notification.id)}
              onAction={handleNotificationAction}
            />
          </div>
        ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
