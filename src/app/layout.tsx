import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { VersionCheck } from '@/components/VersionCheck'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'REMISE Asset Barn - Property & Asset Management',
  description: 'Official police report for stolen items from the Birkenfeld farm theft incident',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VersionCheck />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
