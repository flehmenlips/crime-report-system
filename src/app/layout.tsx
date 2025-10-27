import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
      <head>
        {/* Google tag (gtag.js) - placed immediately after <head> as per Google's instructions */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EV66WDMTTG"
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EV66WDMTTG');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <VersionCheck />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
