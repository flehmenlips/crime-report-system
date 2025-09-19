'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, getRoleDisplayName } from '@/lib/auth'
import { UserProfile } from './UserProfile'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login-simple')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const userRole = user?.role
  const isPropertyOwner = userRole === 'property_owner'
  const isLawEnforcement = userRole === 'law_enforcement'

  return (
    <header className="glass-card mx-4 mt-4 sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 ${
              isPropertyOwner 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 glow' 
                : isLawEnforcement
                ? 'bg-gradient-to-br from-red-500 to-red-700 glow'
                : 'bg-gradient-to-br from-gray-700 to-gray-900'
            }`}>
              <span className="text-white font-bold text-xl">
                {isPropertyOwner ? '🏠' : isLawEnforcement ? '🛡️' : '👤'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {user ? `${getRoleDisplayName(user.role)} Portal` : 'Crime Report System'}
              </h1>
              <p className="text-white/80 text-sm font-medium">
                {isPropertyOwner ? 'Manage your stolen property' : 'Professional Crime Report Management'}
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <UserProfile className="hidden sm:flex" />
              
              {/* Mobile logout button */}
              <button
                onClick={handleLogout}
                className="btn-secondary group sm:hidden"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
