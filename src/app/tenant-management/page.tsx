'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TenantManagement from '@/components/TenantManagement'

export default function TenantManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has admin privileges
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          
          // Only super_admin can access tenant management
          if (userData.user.role !== 'super_admin') {
            router.push('/unauthorized')
            return
          }
        } else {
          router.push('/login-simple')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login-simple')
        return
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <TenantManagement />
    </div>
  )
}
