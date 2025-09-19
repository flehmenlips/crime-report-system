'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// NextAuth login page disabled - redirect to custom login

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to custom login page
    router.push('/login-simple')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  )
}