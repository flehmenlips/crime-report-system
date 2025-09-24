'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  user: User | null
}

export function ResponsiveLayout({ children, user }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
    }

    // Initial check
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(checkScreenSize, 100) // Small delay to ensure accurate dimensions
    })

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      window.removeEventListener('orientationchange', checkScreenSize)
    }
  }, [])

  // Add responsive classes to body
  useEffect(() => {
    const body = document.body
    
    // Remove existing responsive classes
    body.classList.remove('mobile', 'tablet', 'desktop')
    
    // Add current responsive class
    if (isMobile) {
      body.classList.add('mobile')
    } else if (isTablet) {
      body.classList.add('tablet')
    } else {
      body.classList.add('desktop')
    }

    // Add viewport meta tag if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]')
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta')
      viewportMeta.setAttribute('name', 'viewport')
      document.head.appendChild(viewportMeta)
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')

    // Add PWA meta tags
    const addPWAMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    addPWAMetaTag('theme-color', '#3b82f6')
    addPWAMetaTag('apple-mobile-web-app-capable', 'yes')
    addPWAMetaTag('apple-mobile-web-app-status-bar-style', 'default')
    addPWAMetaTag('apple-mobile-web-app-title', 'Crime Report System')
    addPWAMetaTag('mobile-web-app-capable', 'yes')
    addPWAMetaTag('application-name', 'Crime Report System')

    // Add PWA link tags
    const addPWALinkTag = (rel: string, href: string, sizes?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        if (sizes) link.setAttribute('sizes', sizes)
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
    }

    addPWALinkTag('manifest', '/manifest.json')
    addPWALinkTag('apple-touch-icon', '/icons/icon-192x192.png')
    addPWALinkTag('icon', '/icons/icon-192x192.png', '192x192')
    addPWALinkTag('icon', '/icons/icon-512x512.png', '512x512')

    return () => {
      body.classList.remove('mobile', 'tablet', 'desktop')
    }
  }, [isMobile, isTablet, isDesktop])

  // Create responsive styles
  const responsiveStyles = `
    /* Mobile-first responsive styles */
    .mobile {
      --header-height: 60px;
      --sidebar-width: 0px;
      --content-padding: 16px;
      --font-size-base: 14px;
      --font-size-lg: 16px;
      --font-size-xl: 18px;
      --font-size-2xl: 20px;
      --border-radius: 12px;
      --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tablet {
      --header-height: 64px;
      --sidebar-width: 0px;
      --content-padding: 20px;
      --font-size-base: 15px;
      --font-size-lg: 17px;
      --font-size-xl: 19px;
      --font-size-2xl: 22px;
      --border-radius: 14px;
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .desktop {
      --header-height: 72px;
      --sidebar-width: 280px;
      --content-padding: 24px;
      --font-size-base: 16px;
      --font-size-lg: 18px;
      --font-size-xl: 20px;
      --font-size-2xl: 24px;
      --border-radius: 16px;
      --shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    /* Touch-friendly sizing for mobile */
    .mobile button,
    .mobile input,
    .mobile select,
    .mobile textarea {
      min-height: 44px;
      font-size: 16px; /* Prevents zoom on iOS */
    }

    .mobile .touch-target {
      min-height: 44px;
      min-width: 44px;
    }

    /* Mobile-specific optimizations */
    .mobile .card {
      margin-bottom: 12px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
    }

    .mobile .grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .mobile .flex {
      flex-direction: column;
    }

    /* Tablet optimizations */
    .tablet .grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .tablet .card {
      margin-bottom: 16px;
    }

    /* Desktop optimizations */
    .desktop .grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .desktop .sidebar {
      width: var(--sidebar-width);
    }

    /* Responsive typography */
    h1 { font-size: var(--font-size-2xl); }
    h2 { font-size: var(--font-size-xl); }
    h3 { font-size: var(--font-size-lg); }
    p, span, div { font-size: var(--font-size-base); }

    /* Responsive spacing */
    .container {
      padding: var(--content-padding);
    }

    /* Hide/show elements based on screen size */
    .mobile-only { display: block; }
    .tablet-only { display: none; }
    .desktop-only { display: none; }

    .tablet .mobile-only { display: none; }
    .tablet .tablet-only { display: block; }

    .desktop .mobile-only { display: none; }
    .desktop .tablet-only { display: none; }
    .desktop .desktop-only { display: block; }

    /* Mobile navigation adjustments */
    .mobile .mobile-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .mobile .mobile-content {
      padding-top: var(--header-height);
      padding-bottom: 80px; /* Space for floating action buttons */
    }

    /* PWA-specific styles */
    @media (display-mode: standalone) {
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .mobile,
      .tablet,
      .desktop {
        --bg-color: #0f172a;
        --text-color: #f8fafc;
        --border-color: #334155;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* High contrast support */
    @media (prefers-contrast: high) {
      .mobile,
      .tablet,
      .desktop {
        --shadow: 0 0 0 2px currentColor;
      }
    }
  `

  return (
    <>
      {/* Inject responsive styles */}
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      
      {/* Responsive layout wrapper */}
      <div 
        className={`responsive-layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace'
          }}>
            {screenSize.width}×{screenSize.height} | {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </div>
        )}
        
        {/* Main content */}
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </div>
      </div>
    </>
  )
}
