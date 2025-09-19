import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { canReadAll, canWriteAll, canManageUsers, canAccessAdmin, Role } from '@/lib/auth'

// Define route access rules
const ROUTE_PERMISSIONS = {
  '/admin': ['admin:system'],
  '/law-enforcement': ['law_enforcement'],
  '/insurance': ['insurance_agent'],
  '/broker': ['broker'],
  '/banking': ['banker'],
  '/assets': ['asset_manager'],
  '/assistant': ['assistant', 'secretary', 'executive_assistant'],
  '/management': ['manager'],
} as const

// Security middleware with enhanced RBAC
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow access to auth pages and login without authentication
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/login') ||
      pathname.startsWith('/unauthorized') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/serve-document') ||
      pathname.startsWith('/api/document-proxy')) {
    return NextResponse.next()
  }
  
  // Check for user session
  const user = await getCurrentUser()
  console.log('Middleware - User check for path:', pathname, 'User:', user ? `${user.name} (${user.role})` : 'null')
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('Middleware - No user found, redirecting to login-simple')
    return NextResponse.redirect(new URL('/login-simple', req.url))
  }
  
  // Enhanced Role-based access control
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      // Check if user has required permissions or role
      const hasAccess = permissions.some(permission => {
        if (permission.includes(':')) {
          // It's a permission string
          return user.permissions?.includes(permission) || false
        } else {
          // It's a role string
          return user.role === permission
        }
      })
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      break
    }
  }
  
  // API route protection
  if (pathname.startsWith('/api/')) {
    // Admin-only API routes
    if (pathname.startsWith('/api/admin') && !canAccessAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // User management API routes
    if (pathname.startsWith('/api/users') && !canManageUsers(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Write operations require write permissions
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      if (!canWriteAll(user) && !user.permissions?.includes('write:own')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
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
