'use client'

import { signOut, useSession } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const userRole = (session?.user as any)?.role || 'law_enforcement'
  const isCitizen = userRole === 'citizen'

  return (
    <header className="glass-card mx-4 mt-4 sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 ${
              isCitizen 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 glow' 
                : 'bg-gradient-to-br from-gray-700 to-gray-900'
            }`}>
              <span className="text-white font-bold text-xl">
                {isCitizen ? '🏠' : '🛡️'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {isCitizen ? 'Property Owner Portal' : 'Crime Report System'}
              </h1>
              <p className="text-white/80 text-sm font-medium">
                {isCitizen ? 'Manage your stolen property' : 'Law Enforcement Portal'}
              </p>
            </div>
          </div>

          {session && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-white/70 text-xs">
                    {isCitizen ? 'Property Owner' : 'Law Enforcement'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-secondary group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
