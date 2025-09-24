'use client'

import { NotificationProvider } from '@/contexts/NotificationContext'

// NextAuth SessionProvider disabled - using custom authentication
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider user={null}>
      {children}
    </NotificationProvider>
  )
}
