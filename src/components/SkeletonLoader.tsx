'use client'

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'dashboard' | 'table' | 'stats' | 'profile'
  className?: string
  count?: number
}

export function SkeletonLoader({ type = 'card', className = '', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return (
          <div className="animate-pulse">
            <div className="bg-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-white/30 rounded w-24"></div>
                <div className="h-8 w-8 bg-white/30 rounded-full"></div>
              </div>
              <div className="h-8 bg-white/30 rounded w-16 mb-2"></div>
              <div className="h-3 bg-white/30 rounded w-20"></div>
            </div>
          </div>
        )
      
      case 'card':
        return (
          <div className="animate-pulse">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-white/30 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-white/30 rounded w-full mb-2"></div>
              <div className="h-3 bg-white/30 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-white/30 rounded w-16"></div>
                <div className="h-6 bg-white/30 rounded w-20"></div>
              </div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="animate-pulse">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/30 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/30 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-white/30 rounded w-16"></div>
              </div>
            </div>
          </div>
        )
      
      case 'table':
        return (
          <div className="animate-pulse">
            <div className="bg-white/95 rounded-xl p-6">
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-200">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
                {/* Table Rows */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'dashboard':
        return (
          <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-white/30 rounded-2xl"></div>
                  <div>
                    <div className="h-6 bg-white/30 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-white/30 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-10 w-32 bg-white/30 rounded-xl"></div>
                  <div className="h-10 w-10 bg-white/30 rounded-xl"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-white/30 rounded w-20"></div>
                    <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="h-8 bg-white/30 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-24"></div>
                </div>
              ))}
            </div>
            
            {/* Content Area */}
            <div className="bg-white/95 rounded-xl p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'profile':
        return (
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200 pt-4">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="animate-pulse">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/30 rounded w-1/2"></div>
            </div>
          </div>
        )
    }
  }

  if (count > 1) {
    return (
      <div className={className}>
        {[...Array(count)].map((_, index) => (
          <div key={index} className={index > 0 ? 'mt-4' : ''}>
            {renderSkeleton()}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  )
}

// Specialized skeleton loaders for specific use cases
export function DashboardSkeleton() {
  return <SkeletonLoader type="dashboard" />
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonLoader type="stats" count={count} />
    </div>
  )
}

export function ItemsListSkeleton({ count = 6 }: { count?: number }) {
  return <SkeletonLoader type="list" count={count} />
}

export function ItemsTableSkeleton() {
  return <SkeletonLoader type="table" />
}

export function ProfileSkeleton() {
  return <SkeletonLoader type="profile" />
}
