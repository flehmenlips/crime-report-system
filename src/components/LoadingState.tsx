'use client'

import { SkeletonLoader } from './SkeletonLoader'

interface LoadingStateProps {
  type?: 'dashboard' | 'stats' | 'items' | 'table' | 'profile' | 'custom'
  message?: string
  showSpinner?: boolean
  className?: string
  count?: number
}

export function LoadingState({ 
  type = 'custom', 
  message = 'Loading...', 
  showSpinner = true,
  className = '',
  count = 1
}: LoadingStateProps) {
  
  const renderContent = () => {
    switch (type) {
      case 'dashboard':
        return <SkeletonLoader type="dashboard" count={count} />
      
      case 'stats':
        return <SkeletonLoader type="card" count={count} />
      
      case 'items':
        return <SkeletonLoader type="item-card" count={count} />
      
      case 'table':
        return <SkeletonLoader type="list" count={count} />
      
      case 'profile':
        return <SkeletonLoader type="card" count={count} />
      
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            {showSpinner && (
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            <p className="text-white/80 text-lg font-medium">{message}</p>
          </div>
        )
    }
  }

  return (
    <div className={className}>
      {renderContent()}
    </div>
  )
}

// Specialized loading states for different scenarios
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LoadingState type="dashboard" />
    </div>
  )
}

export function ItemsLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="bg-white/95 rounded-xl p-6">
      <div className="mb-6">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
      <SkeletonLoader type="item-card" count={count} />
    </div>
  )
}

export function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonLoader type="card" count={4} />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="bg-white/95 rounded-xl p-6">
      <div className="mb-6">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
      </div>
      <SkeletonLoader type="list" count={1} />
    </div>
  )
}

// Error state component
export function ErrorState({ 
  message = 'Something went wrong', 
  onRetry,
  className = '' 
}: { 
  message?: string
  onRetry?: () => void
  className?: string 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-gray-600 text-center mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Empty state component
export function EmptyState({ 
  title = 'No data available',
  message = 'There are no items to display at this time.',
  icon = '📦',
  action,
  className = ''
}: {
  title?: string
  message?: string
  icon?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>
      {action && action}
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...',
  children 
}: {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
          <p className="text-gray-700 text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
