'use client'

import { useState, useEffect } from 'react'
import { User, Tenant, StolenItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { isPropertyOwner, isStakeholder } from '@/lib/auth'

interface TenantDashboardProps {
  user: User | null
  items: StolenItem[]
  tenant?: Tenant
  className?: string
}

export function TenantDashboard({ user, items, tenant, className = '' }: TenantDashboardProps) {
  const [tenantStats, setTenantStats] = useState({
    totalItems: 0,
    totalValue: 0,
    evidenceCount: 0,
    itemsWithPhotos: 0,
    recentActivity: 0
  })

  useEffect(() => {
    if (!items || !tenant) return

    // Calculate tenant-specific statistics
    const tenantItems = items.filter(item => item.tenantId === tenant.id)
    const totalValue = tenantItems.reduce((sum, item) => sum + item.estimatedValue, 0)
    const evidenceCount = tenantItems.reduce((total, item) => 
      total + (item.evidence?.filter(e => e.type === 'photo')?.length || 0) + 
      (item.evidence?.filter(e => e.type === 'video')?.length || 0) + 
      (item.evidence?.filter(e => e.type === 'document')?.length || 0), 0
    )
    const itemsWithPhotos = tenantItems.filter(item => 
      item.evidence?.filter(e => e.type === 'photo')?.length > 0
    ).length

    // Calculate recent activity (items added in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentActivity = tenantItems.filter(item => 
      new Date(item.createdAt) > sevenDaysAgo
    ).length

    setTenantStats({
      totalItems: tenantItems.length,
      totalValue,
      evidenceCount,
      itemsWithPhotos,
      recentActivity
    })
  }, [items, tenant])

  if (!user || !tenant) {
    return null
  }

  const stats = [
    {
      label: 'Total Items',
      value: tenantStats.totalItems,
      icon: '📦',
      color: 'from-blue-500 to-blue-700',
      description: 'Items documented'
    },
    {
      label: 'Total Value',
      value: formatCurrency(tenantStats.totalValue),
      icon: '💰',
      color: 'from-green-500 to-green-700',
      description: 'Estimated loss value'
    },
    {
      label: 'Evidence Files',
      value: tenantStats.evidenceCount,
      icon: '📸',
      color: 'from-purple-500 to-purple-700',
      description: 'Photos, videos, documents'
    },
    {
      label: 'Recent Activity',
      value: tenantStats.recentActivity,
      icon: '🆕',
      color: 'from-orange-500 to-orange-700',
      description: 'Items added this week'
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tenant Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isPropertyOwner(user) 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              <span className="text-white text-2xl">
                {isPropertyOwner(user) ? '🏠' : '🏢'}
              </span>
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">
                {tenant.name}
              </h2>
              <p className="text-white/80 text-sm">
                {isPropertyOwner(user) ? 'Your Property Dashboard' : 'Stakeholder Access Dashboard'}
              </p>
              {tenant.description && (
                <p className="text-white/70 text-sm mt-1">
                  {tenant.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              tenant.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                tenant.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              {tenant.isActive ? 'Active' : 'Inactive'}
            </div>
            <p className="text-white/60 text-xs mt-1">
              Tenant ID: {tenant.id}
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-white/70 text-xs">
                  {stat.description}
                </p>
              </div>
              <div className="text-3xl opacity-80">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tenant Information Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Property Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-sm">Property Name</label>
              <p className="text-white font-medium">{tenant.name}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm">Tenant ID</label>
              <p className="text-white font-mono text-sm">{tenant.id}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm">Status</label>
              <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tenant.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {tenant.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-sm">Created</label>
              <p className="text-white text-sm">{formatDate(tenant.createdAt)}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm">Last Updated</label>
              <p className="text-white text-sm">{formatDate(tenant.updatedAt)}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm">Access Type</label>
              <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isPropertyOwner(user) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isPropertyOwner(user) ? 'Owner' : 'Stakeholder'}
              </p>
            </div>
          </div>
        </div>
        {tenant.description && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <label className="text-white/70 text-sm">Description</label>
            <p className="text-white/90 text-sm leading-relaxed mt-1">
              {tenant.description}
            </p>
          </div>
        )}
      </div>

      {/* Access Control Information */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Access Control</h3>
        <div className="space-y-4">
          {isPropertyOwner(user) ? (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Property Owner Access</h4>
                <p className="text-white/70 text-sm mt-1">
                  You have full control over this property's data. You can add, edit, delete items, 
                  upload evidence, and generate reports. You are the primary contact for this property.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Stakeholder Access</h4>
                <p className="text-white/70 text-sm mt-1">
                  You have controlled access to this property's data based on your role. 
                  You can view items, search, generate reports, and add notes, but cannot modify core data.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">ℹ</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Data Security</h4>
              <p className="text-white/70 text-sm mt-1">
                All data is isolated by tenant. You can only access data from properties you have 
                been granted permission to view. All access is logged and monitored for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
