'use client'

import { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { isPropertyOwner, isStakeholder } from '@/lib/auth'

interface TenantInfoProps {
  user: User | null
  className?: string
}

export function TenantInfo({ user, className = '' }: TenantInfoProps) {
  const [tenantData, setTenantData] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!user?.tenantId) {
        setLoading(false)
        return
      }

      try {
        // In a real implementation, you'd fetch tenant data from an API
        // For now, we'll use the tenant data from the user object
        if (user.tenant) {
          setTenantData(user.tenant)
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [user])

  if (!user || loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const tenant = tenantData || user.tenant

  if (!tenant) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🏢</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">No Tenant Assigned</h3>
            <p className="text-white/70 text-xs">Contact administrator</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPropertyOwner(user) 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}>
          <span className="text-white text-lg">
            {isPropertyOwner(user) ? '🏠' : '🏢'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm truncate">
            {tenant.name}
          </h3>
          <p className="text-white/70 text-xs">
            {isPropertyOwner(user) ? 'Your Property' : 'Accessing Property'}
          </p>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          tenant.isActive ? 'bg-green-400' : 'bg-red-400'
        }`} title={tenant.isActive ? 'Active' : 'Inactive'}></div>
      </div>

      {tenant.description && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-white/80 text-xs leading-relaxed">
            {tenant.description}
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isPropertyOwner(user) ? 'bg-blue-400' : 'bg-green-400'
            }`}></div>
            <span className="text-white/70">
              {isPropertyOwner(user) ? 'Owner Access' : 'Stakeholder Access'}
            </span>
          </div>
          {user.accessLevel && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.accessLevel === 'owner' ? 'bg-purple-100 text-purple-800' :
              user.accessLevel === 'staff' ? 'bg-blue-100 text-blue-800' :
              user.accessLevel === 'stakeholder' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Access Level Details */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="space-y-2 text-xs">
          {isPropertyOwner(user) ? (
            <div className="text-white/80">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-blue-300">✓</span>
                <span>Full data access and management</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-blue-300">✓</span>
                <span>Add, edit, and delete items</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-300">✓</span>
                <span>Upload evidence and generate reports</span>
              </div>
            </div>
          ) : (
            <div className="text-white/80">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-green-300">✓</span>
                <span>Read-only access to property data</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-green-300">✓</span>
                <span>Advanced search and analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span>Generate reports and export data</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
