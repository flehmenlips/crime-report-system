'use client'

import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext'
// import { NotificationProvider } from '@/contexts/NotificationContext'

// NextAuth SessionProvider disabled - using custom authentication
// NotificationProvider disabled - causing hydration issues
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserPreferencesProvider user={null}>
      {children}
    </UserPreferencesProvider>
  )
}
