'use client'

import { useState, useEffect } from 'react'
import { User, Tenant } from '@/types'
import { isPropertyOwner, isStakeholder } from '@/lib/auth'

interface TenantInfoProps {
  user: User | null
  className?: string
  textColor?: string
  textColorSecondary?: string
}

export function TenantInfo({ user, className = '', textColor = 'white', textColorSecondary = 'rgba(255, 255, 255, 0.8)' }: TenantInfoProps) {
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '16px',
      ...(className ? { className } : {})
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isPropertyOwner(user) 
            ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        }}>
          <span style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            color: textColor,
            fontWeight: '600',
            fontSize: '14px',
            margin: '0 0 2px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease-in-out'
          }}>
            {tenant.name}
          </h3>
          <p style={{
            color: textColorSecondary,
            fontSize: '12px',
            margin: '0',
            transition: 'color 0.3s ease-in-out'
          }}>
            {isPropertyOwner(user) ? 'Your Property' : 'Accessing Property'}
          </p>
        </div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: tenant.isActive ? '#22c55e' : '#ef4444'
        }} title={tenant.isActive ? 'Active' : 'Inactive'}></div>
      </div>

      {tenant.description && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p style={{
            color: textColorSecondary,
            fontSize: '12px',
            lineHeight: '1.5',
            margin: '0',
            transition: 'color 0.3s ease-in-out'
          }}>
            {tenant.description}
          </p>
        </div>
      )}

      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isPropertyOwner(user) ? '#3b82f6' : '#22c55e'
            }}></div>
            <span style={{ color: textColorSecondary, transition: 'color 0.3s ease-in-out' }}>
              {isPropertyOwner(user) ? 'Owner Access' : 'Stakeholder Access'}
            </span>
          </div>
          {user.accessLevel && (
            <span style={{
              padding: '4px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid',
              ...(user.accessLevel === 'owner' ? {
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                color: '#a855f7',
                borderColor: 'rgba(168, 85, 247, 0.3)'
              } : user.accessLevel === 'staff' ? {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)'
              } : user.accessLevel === 'stakeholder' ? {
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                borderColor: 'rgba(34, 197, 94, 0.3)'
              } : {
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                borderColor: 'rgba(107, 114, 128, 0.3)'
              })
            }}>
{user.role === 'law_enforcement' ? 'Law Enforcement' : user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Access Level Details */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          {isPropertyOwner(user) ? (
            <div style={{ color: textColorSecondary, transition: 'color 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#60a5fa' }}>✓</span>
                <span>Full data access and management</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#60a5fa' }}>✓</span>
                <span>Add, edit, and delete items</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#60a5fa' }}>✓</span>
                <span>Upload evidence and generate reports</span>
              </div>
            </div>
          ) : (
            <div style={{ color: textColorSecondary, transition: 'color 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#4ade80' }}>✓</span>
                <span>Read-only access to property data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#4ade80' }}>✓</span>
                <span>Advanced search and analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#4ade80' }}>✓</span>
                <span>Generate reports and export data</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
