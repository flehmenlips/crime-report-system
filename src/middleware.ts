import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Security middleware for production headers
export async function middleware(req: NextRequest) {
  // Allow access to auth pages and login without authentication
  if (req.nextUrl.pathname.startsWith('/api/auth') || 
      req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }
  
  // Check for user session
  const user = await getCurrentUser()
  
  // Redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login-simple', req.url))
  }
  
  // Role-based access control
  if (req.nextUrl.pathname.startsWith('/law-enforcement') && user.role !== 'law_enforcement') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  return NextResponse.next()
}

// Matcher: Apply to all routes except static files/internal Next.js paths
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
