'use client'

import React from 'react'

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'dashboard' | 'item-card' | 'evidence-thumbnail'
  count?: number
}

export function SkeletonLoader({ type = 'card', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'item-card':
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.8)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}>
            {/* Header skeleton */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '12px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
              <div style={{
                width: '80px',
                height: '24px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '6px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
            </div>
            
            {/* Title skeleton */}
            <div style={{
              width: '70%',
              height: '20px',
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'shimmer 1.5s infinite'
            }}></div>
            
            {/* Description skeleton */}
            <div style={{
              width: '100%',
              height: '16px',
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'shimmer 1.5s infinite'
            }}></div>
            <div style={{
              width: '60%',
              height: '16px',
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              marginBottom: '16px',
              animation: 'shimmer 1.5s infinite'
            }}></div>
            
            {/* Footer skeleton */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                width: '120px',
                height: '14px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '4px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
              <div style={{
                width: '60px',
                height: '14px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '4px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
            </div>
          </div>
        )

      case 'evidence-thumbnail':
        return (
          <div style={{
            width: '100%',
            height: '120px',
            background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '8px',
            animation: 'shimmer 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#d1d5db',
              borderRadius: '4px'
            }}></div>
          </div>
        )

      case 'dashboard':
        return (
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            minHeight: '100vh',
            padding: '32px 24px'
          }}>
            {/* Header skeleton */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <div style={{
                width: '200px',
                height: '32px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '8px',
                marginBottom: '16px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
              <div style={{
                width: '300px',
                height: '20px',
                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '4px',
                animation: 'shimmer 1.5s infinite'
              }}></div>
            </div>
            
            {/* Controls skeleton */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '40px',
                  background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '8px',
                  animation: 'shimmer 1.5s infinite'
                }}></div>
                <div style={{
                  width: '80px',
                  height: '40px',
                  background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '8px',
                  animation: 'shimmer 1.5s infinite'
                }}></div>
                <div style={{
                  width: '60px',
                  height: '40px',
                  background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '8px',
                  animation: 'shimmer 1.5s infinite'
                }}></div>
              </div>
            </div>
            
            {/* Items grid skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonLoader key={index} type="item-card" />
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div style={{
            width: '100%',
            height: '200px',
            background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '8px',
            animation: 'shimmer 1.5s infinite'
          }}></div>
        )
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}