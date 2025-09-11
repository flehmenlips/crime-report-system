'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  itemCount: number
  totalValue: number
  evidenceCount: number
}

export function ModernSidebar({ currentView, onViewChange, itemCount, totalValue, evidenceCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()

  const userRole = (session?.user as any)?.role || 'law_enforcement'
  const isCitizen = userRole === 'citizen'

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      description: 'Overview & statistics',
      badge: null
    },
    {
      id: 'items',
      label: 'My Items',
      icon: '📦',
      description: 'Stolen property list',
      badge: itemCount.toString()
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: '📸',
      description: 'Photos & documents',
      badge: evidenceCount.toString()
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📄',
      description: 'Generate & export',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      description: 'Case insights',
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Account & preferences',
      badge: null
    }
  ]

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-2xl border-r border-white/20 transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">🏠</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Property Portal</h2>
                <p className="text-white/70 text-sm">Case #2023-12020</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-white/70 text-sm">
                {isCitizen ? 'Property Owner' : 'Law Enforcement'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-white/20 shadow-lg'
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <span className="text-lg">{item.icon}</span>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold truncate">{item.label}</p>
                      <p className="text-xs text-white/60">{item.description}</p>
                    </div>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-white/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Total Loss</span>
              <span className="text-white font-bold">${totalValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Evidence Files</span>
              <span className="text-white font-bold">{evidenceCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Case Status</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
