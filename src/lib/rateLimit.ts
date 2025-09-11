// Simple in-memory rate limiter for development
// In production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return false
    }

    if (entry.count >= this.maxRequests) {
      return true
    }

    entry.count++
    return false
  }

  getRemainingRequests(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return this.maxRequests

    const now = Date.now()
    if (now > entry.resetTime) {
      return this.maxRequests
    }

    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(key: string): number {
    const entry = this.store.get(key)
    return entry?.resetTime || Date.now() + this.windowMs
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes for auth
export const apiRateLimiter = new RateLimiter(60 * 1000, 100) // 100 requests per minute for API

export function createRateLimitKey(request: Request, identifier?: string): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // Add user identifier if available (for authenticated requests)
  const userId = identifier || 'anonymous'

  return `${ip}:${userId}`
}

export function createRateLimitResponse(
  remaining: number,
  resetTime: number,
  message = 'Too many requests'
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
    }
  })
}
