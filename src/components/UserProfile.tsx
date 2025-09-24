'use client'

import { useState, useEffect } from 'react'
import { User, getRoleDisplayName, canReadAll, canWriteAll, canManageUsers, canAccessAdmin, getRoleIcon, getRoleColor, isStakeholder, isPropertyOwner } from '@/lib/auth'
import { UserProfileManagement } from './UserProfileManagement'

interface UserProfileProps {
  className?: string
  showDetails?: boolean
}

export function UserProfile({ className = '', showDetails = true }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProfileManagement, setShowProfileManagement] = useState(false)

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
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
        className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="text-white text-lg">
            {getRoleIcon(user.role)}
          </span>
        </div>
        
        {showDetails && (
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
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white text-xl">
                  {getRoleIcon(user.role)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  {user.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getRoleDisplayName(user.role)}
                </p>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="text-gray-900 font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900 font-medium">{getRoleDisplayName(user.role)}</span>
                  </div>
                  {accessLevelInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access Level:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        accessLevelInfo.level === 'owner' ? 'bg-purple-100 text-purple-800' :
                        accessLevelInfo.level === 'staff' ? 'bg-blue-100 text-blue-800' :
                        accessLevelInfo.level === 'stakeholder' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {accessLevelInfo.displayName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant Information */}
              {tenantInfo && (
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Tenant Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="text-gray-900 font-medium">{tenantInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tenantInfo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tenantInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {tenantInfo.description && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-xs block mb-1">Description:</span>
                        <span className="text-gray-700 text-xs leading-relaxed">{tenantInfo.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Access Type Indicator */}
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Access Type</h4>
                <div className="flex items-center space-x-2">
                  {isPropertyOwner(user) ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700 font-medium">Property Owner</span>
                      <span className="text-xs text-gray-500">Full control over your property data</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">Stakeholder Access</span>
                      <span className="text-xs text-gray-500">Controlled access to property data</span>
                    </>
                  )}
                </div>
              </div>

              {/* Permissions */}
              {permissions.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map((permission, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowProfileManagement(true)}
                    className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    📝 Manage Profile
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
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
