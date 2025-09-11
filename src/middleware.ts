import { NextRequest, NextResponse } from 'next/server'
import { securityMiddleware, apiSecurityMiddleware } from './middleware/security'

export function middleware(request: NextRequest) {
  // Apply general security middleware
  const response = securityMiddleware(request)

  // Apply API-specific security for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return apiSecurityMiddleware(request)
  }

  // Additional route-specific security
  if (request.nextUrl.pathname === '/login') {
    // Ensure login page is not cached
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
    const url = request.url.replace('http://', 'https://')
    return NextResponse.redirect(url, 301)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
