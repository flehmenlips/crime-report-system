import { NextRequest, NextResponse } from 'next/server'

// Security middleware for production headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Content-Security-Policy (adjust sources as needed for your app)
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com;")
  
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Strict referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
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
