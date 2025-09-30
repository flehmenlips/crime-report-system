'use client'

import { useState, useEffect } from 'react'
import { User, getRoleDisplayName, canReadAll, canWriteAll, canManageUsers, canAccessAdmin, getRoleIcon, getRoleColor, isStakeholder, isPropertyOwner } from '@/lib/auth'
import { UserProfileManagement } from './UserProfileManagement'

interface UserProfileProps {
  className?: string
  showDetails?: boolean
  onProfileUpdate?: (updatedUser: User) => void
}

export function UserProfile({ className = '', showDetails = true, onProfileUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProfileManagement, setShowProfileManagement] = useState(false)

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  if (!user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-400 rounded animate-pulse w-24"></div>
          <div className="h-3 bg-gray-400 rounded animate-pulse w-16"></div>
        </div>
      </div>
    )
  }

  // Enhanced tenant and access information
  const tenantInfo = user.tenant ? {
    name: user.tenant.name,
    description: user.tenant.description || 'No description available',
    isActive: user.tenant.isActive
  } : null

  const accessLevelInfo = user.accessLevel ? {
    level: user.accessLevel,
    displayName: user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1).replace('_', ' ')
  } : null

  const permissions = [
    ...(canReadAll(user) ? ['Read All Data'] : []),
    ...(canWriteAll(user) ? ['Write All Data'] : []),
    ...(canManageUsers(user) ? ['Manage Users'] : []),
    ...(canAccessAdmin(user) ? ['Admin Access'] : [])
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Compact Profile Display */}
      <div 
        className={`flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-colors duration-200 ${isExpanded ? 'opacity-50' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="text-white text-lg">
            {getRoleIcon(user.role)}
          </span>
        </div>
        
        {showDetails && !isExpanded && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user.name}
            </p>
            <p className="text-white/70 text-xs">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        )}
        
        <div className="text-white/50 text-xs">
          ▼
        </div>
      </div>

      {/* Expanded Profile Details */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
          <div className="p-6">
            {/* Header - Modern, clean design */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg mx-auto mb-3`}>
                <span className="text-white text-2xl">
                  {getRoleIcon(user.role)}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-1">
                {user.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {getRoleDisplayName(user.role)}
              </p>
            </div>

            {/* User Details - Modern Card Design */}
            <div className="space-y-4">
              {/* Account Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Account Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Email</span>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">User ID</span>
                    <span className="text-gray-900 font-mono text-xs bg-white px-2 py-1 rounded border">{user.id}</span>
                  </div>
                  {accessLevelInfo && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Access Level</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        accessLevelInfo.level === 'owner' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        accessLevelInfo.level === 'staff' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        accessLevelInfo.level === 'stakeholder' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {accessLevelInfo.displayName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant Information Card */}
              {tenantInfo && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tenant Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Property</span>
                      <span className="text-gray-900 font-medium">{tenantInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        tenantInfo.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {tenantInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {tenantInfo.description && (
                      <div className="mt-3 pt-3 border-t border-green-100">
                        <span className="text-gray-600 font-medium text-xs block mb-2">Description</span>
                        <span className="text-gray-700 text-xs leading-relaxed bg-white p-3 rounded-lg border border-green-100">{tenantInfo.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Access Type Card */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Access Type
                </h4>
                <div className="space-y-2">
                  {isPropertyOwner(user) ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700 font-medium">Property Owner</span>
                        <p className="text-xs text-gray-500 mt-1">Full control over your property data</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <span className="text-sm text-green-700 font-medium">Stakeholder Access</span>
                        <p className="text-xs text-gray-500 mt-1">Controlled access to property data</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Card */}
              {permissions.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Permissions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-orange-800 border border-orange-200 shadow-sm"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowProfileManagement(true)}
                    className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm flex items-center justify-center"
                  >
                    <span className="mr-2">⚙️</span>
                    Manage Profile
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="flex-1 px-4 py-3 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-400 hover:shadow-sm"
                    >
                      Close
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { method: 'POST' })
                          window.location.href = '/login-simple'
                        } catch (error) {
                          console.error('Logout failed:', error)
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      {showProfileManagement && (
        <UserProfileManagement
          user={user}
          onClose={() => setShowProfileManagement(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}
