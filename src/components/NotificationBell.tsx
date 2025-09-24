'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsOpen(true)
  }

  // Trigger animation when new notifications arrive
  const triggerAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Subscribe to notifications for animation
  useNotifications().subscribe(() => {
    if (unreadCount > 0) {
      triggerAnimation()
    }
  })

  return (
    <>
      <button
        onClick={handleClick}
        className={className}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Bell Icon */}
        <div
          style={{
            transform: isAnimating ? 'rotate(15deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🔔
        </div>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              padding: '0 4px',
              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
              border: '2px solid white',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Pulse animation for new notifications */}
        {isAnimating && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              background: 'rgba(239, 68, 68, 0.3)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              animation: 'ping 0.6s ease-out'
            }}
          />
        )}
      </button>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes ping {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          75%, 100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
