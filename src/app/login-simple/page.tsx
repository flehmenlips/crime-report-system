'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfileManagement } from '@/components/UserProfileManagement'

export default function SimpleLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful, redirect to dashboard
        router.push('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen modern-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Enhanced Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl floating-icon">
              <span className="text-white text-4xl">🛡️</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl mx-auto blur-xl opacity-30 animate-pulse"></div>
          </div>

          {/* Enhanced Typography */}
          <h1 className="text-5xl font-black text-white mb-3 modern-text-gradient">
            Crime Report System
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
            <span className="text-blue-200 text-sm font-medium">Birkenfeld Farm Theft Case</span>
          </div>
          <h3 className="text-xl font-semibold text-white/90 mb-2">
            Professional Security Portal
          </h3>
          <p className="text-white/70 text-sm">
            Secure access for law enforcement, property owners, and stakeholders
          </p>
        </div>
      </div>

      <div className="mt-12 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-10 px-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-white/90 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 text-lg"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 text-lg"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-4 animate-pulse">
                <div className="text-sm text-red-200 flex items-center">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 px-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-lg text-white/70 rounded-full border border-white/10">
                New to the system?
              </span>
            </div>
          </div>

          {/* Registration Button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowRegistration(true)}
              className="btn-secondary w-full py-4 px-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create New Account
              </div>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-500/10 backdrop-blur-lg border border-blue-500/20 rounded-2xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Secure Access</p>
                <p className="text-blue-300/80 text-xs">Your connection is encrypted and secure. All data is protected with enterprise-grade security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistration && (
        <UserProfileManagement
          user={null}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  )
}
