'use client'

import { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { isPropertyOwner, isStakeholder } from '@/lib/auth'

interface TenantSelectorProps {
  user: User | null
  onTenantChange?: (tenant: Tenant) => void
  className?: string
}

export function TenantSelector({ user, onTenantChange, className = '' }: TenantSelectorProps) {
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvailableTenants = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // In a real implementation, you'd fetch available tenants based on user permissions
        // For now, we'll simulate this based on user role
        let tenants: Tenant[] = []

        if (isPropertyOwner(user)) {
          // Property owners only see their own tenant
          if (user.tenant) {
            tenants = [user.tenant]
          }
        } else if (isStakeholder(user)) {
          // Stakeholders might have access to multiple tenants
          // For demo purposes, we'll show the current tenant plus a few others
          tenants = user.tenant ? [user.tenant] : []
          
          // Add some demo tenants for stakeholders (in real app, this would come from API)
          if (user.role === 'law_enforcement') {
            tenants.push({
              id: 'tenant-2',
              name: 'Smith Property',
              description: 'Residential property theft case',
              isActive: true,
              createdAt: '2023-10-01T00:00:00Z',
              updatedAt: '2023-10-01T00:00:00Z'
            })
            tenants.push({
              id: 'tenant-3',
              name: 'Johnson Equipment',
              description: 'Commercial equipment theft case',
              isActive: true,
              createdAt: '2023-11-01T00:00:00Z',
              updatedAt: '2023-11-01T00:00:00Z'
            })
          }
        }

        setAvailableTenants(tenants)
        setSelectedTenant(tenants[0] || null)
      } catch (error) {
        console.error('Error fetching tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableTenants()
  }, [user])

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setIsOpen(false)
    if (onTenantChange) {
      onTenantChange(tenant)
    }
  }

  if (!user || loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-32 mb-1"></div>
          <div className="h-3 bg-white/20 rounded w-24"></div>
        </div>
      </div>
    )
  }

  // If user only has access to one tenant, don't show selector
  if (availableTenants.length <= 1) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 w-full text-left hover:bg-white/15 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isPropertyOwner(user) 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              <span className="text-white text-sm">
                {isPropertyOwner(user) ? '🏠' : '🏢'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {selectedTenant?.name || 'Select Property'}
              </p>
              <p className="text-white/70 text-xs">
                {availableTenants.length} propert{availableTenants.length === 1 ? 'y' : 'ies'} available
              </p>
            </div>
          </div>
          <div className="text-white/50 text-sm">
            {isOpen ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {availableTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantSelect(tenant)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedTenant?.id === tenant.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPropertyOwner(user) 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    <span className="text-white text-sm">
                      {isPropertyOwner(user) ? '🏠' : '🏢'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {tenant.name}
                    </p>
                    {tenant.description && (
                      <p className="text-gray-600 text-xs truncate">
                        {tenant.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      tenant.isActive ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {selectedTenant?.id === tenant.id && (
                      <span className="text-blue-600 text-sm">✓</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
