'use client'

import React, { useState, useEffect } from 'react'
import { SkeletonLoader } from './SkeletonLoader'

interface ProgressiveLoaderProps {
  children: React.ReactNode
  loading: boolean
  skeletonType?: 'dashboard' | 'card' | 'list'
  skeletonCount?: number
  loadingMessage?: string
  showProgress?: boolean
  progress?: number
}

export function ProgressiveLoader({ 
  children, 
  loading, 
  skeletonType = 'dashboard',
  skeletonCount = 6,
  loadingMessage = 'Loading...',
  showProgress = false,
  progress = 0
}: ProgressiveLoaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(loading)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (loading) {
      setShowSkeleton(true)
      setFadeOut(false)
    } else {
      // Start fade out animation
      setFadeOut(true)
      // Hide skeleton after animation completes
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, 300) // Match animation duration
      
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (showSkeleton) {
    return (
      <div style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 300ms ease-in-out',
        position: 'relative'
      }}>
        <SkeletonLoader type={skeletonType} count={skeletonCount} />
        
        {/* Loading overlay with progress */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {loadingMessage}
          </h3>
          
          {showProgress && (
            <div style={{
              width: '200px',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '0 auto'
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                transition: 'width 300ms ease-in-out'
              }}></div>
            </div>
          )}
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 300ms ease-in-out'
    }}>
      {children}
    </div>
  )
}
