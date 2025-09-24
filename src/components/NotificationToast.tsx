'use client'

import { useState, useEffect } from 'react'
import { Notification, NotificationAction } from '@/contexts/NotificationContext'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  onAction: (action: NotificationAction) => void
}

export function NotificationToast({ notification, onClose, onAction }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleAction = (action: NotificationAction) => {
    onAction(action)
    handleClose()
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'alert':
        return '🚨'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          iconBg: 'rgba(16, 185, 129, 0.2)'
        }
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          iconBg: 'rgba(245, 158, 11, 0.2)'
        }
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          iconBg: 'rgba(239, 68, 68, 0.2)'
        }
      case 'alert':
        return {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          iconBg: 'rgba(139, 92, 246, 0.2)'
        }
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          iconBg: 'rgba(59, 130, 246, 0.2)'
        }
    }
  }

  const colors = getNotificationColor()

  return (
    <div
      style={{
        position: 'relative',
        background: colors.background,
        border: colors.border,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        maxWidth: '400px',
        minWidth: '320px',
        transform: isVisible && !isExiting 
          ? 'translateX(0) scale(1)' 
          : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
      onClick={handleClose}
    >
      {/* Progress bar for auto-dismiss */}
      {!notification.persistent && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '0 0 16px 16px',
            animation: 'shrink 5000ms linear forwards'
          }}
        />
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
      >
        ×
      </button>

      {/* Notification content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            background: colors.iconBg,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}
        >
          {getNotificationIcon()}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {notification.title}
          </h3>
          
          <p style={{
            fontSize: '14px',
            margin: '0 0 12px 0',
            lineHeight: 1.4,
            opacity: 0.9,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {notification.message}
          </p>

          {/* Timestamp */}
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            marginBottom: '8px'
          }}>
            {notification.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(action)
                  }}
                  style={{
                    padding: '6px 12px',
                    background: action.style === 'danger' 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : action.style === 'secondary'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    border: action.style === 'danger'
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = action.style === 'danger'
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(255, 255, 255, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = action.style === 'danger'
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
