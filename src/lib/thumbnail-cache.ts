/**
 * Thumbnail Cache Manager
 * 
 * Uses localStorage for small thumbnails (localStorage has a ~5-10MB limit)
 * Falls back to memory cache if localStorage is full
 */

interface CachedThumbnail {
  url: string
  timestamp: number
  data?: string // For small base64 encoded images
}

const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_SIZE = 4.5 * 1024 * 1024 // 4.5MB to stay under 5MB limit

class ThumbnailCache {
  private memoryCache: Map<string, CachedThumbnail> = new Map()
  private readonly CACHE_KEY = 'remise_thumbnail_cache'
  private cacheSize = 0

  constructor() {
    this.loadFromStorage()
    this.cleanExpired()
  }

  /**
   * Get cached thumbnail URL or fetch and cache it
   */
  async getOrFetch(itemId: number, evidenceId: number, cloudinaryId: string, type: string): Promise<string> {
    const cacheKey = `${itemId}_${evidenceId}`
    
    // Check memory cache first
    const cached = this.memoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
      return cached.url
    }

    // Generate Cloudinary URL
    const url = this.generateCloudinaryUrl(cloudinaryId, type)
    
    // Try to cache in localStorage
    try {
      this.setCache(cacheKey, url)
    } catch (error) {
      console.warn('Failed to cache thumbnail in localStorage:', error)
    }

    // Also cache in memory
    this.memoryCache.set(cacheKey, {
      url,
      timestamp: Date.now()
    })

    return url
  }

  /**
   * Generate Cloudinary thumbnail URL with optimizations
   */
  private generateCloudinaryUrl(cloudinaryId: string, type: string): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhaacekdd'
    
    // If it's already a full URL, use it
    if (cloudinaryId.startsWith('https://res.cloudinary.com/')) {
      return cloudinaryId
    }

    // Determine resource type
    const resourceType = type === 'video' ? 'video' : type === 'document' ? 'raw' : 'image'
    
    // Add thumbnail transformation for better performance
    const transformation = type === 'photo' 
      ? 'w_200,h_150,c_fill,f_auto,q_auto'
      : type === 'video'
      ? 'w_200,h_150,c_fill,f_auto,q_auto'
      : 'f_auto'

    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformation}/${cloudinaryId}`
  }

  /**
   * Set cache entry
   */
  private setCache(key: string, url: string): void {
    const data: CachedThumbnail = {
      url,
      timestamp: Date.now()
    }

    try {
      const serialized = JSON.stringify(data)
      const size = new Blob([serialized]).size

      // Check if adding this would exceed max size
      if (this.cacheSize + size > MAX_CACHE_SIZE) {
        this.evictOldest()
      }

      localStorage.setItem(`${this.CACHE_KEY}_${key}`, serialized)
      this.cacheSize += size - (localStorage.getItem(`${this.CACHE_KEY}_${key}`)?.length || 0)
      this.memoryCache.set(key, data)
    } catch (error) {
      // localStorage might be full, use memory cache only
      this.memoryCache.set(key, data)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_KEY))
      
      keys.forEach(storageKey => {
        const data = localStorage.getItem(storageKey)
        if (data) {
          const cached: CachedThumbnail = JSON.parse(data)
          const key = storageKey.replace(`${this.CACHE_KEY}_`, '')
          this.memoryCache.set(key, cached)
          this.cacheSize += data.length
        }
      })
    } catch (error) {
      console.error('Error loading cache from storage:', error)
    }
  }

  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.memoryCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_EXPIRY_MS) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => {
      this.memoryCache.delete(key)
      try {
        localStorage.removeItem(`${this.CACHE_KEY}_${key}`)
      } catch (error) {
        console.error('Error removing expired cache entry:', error)
      }
    })
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    // Find oldest entry
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    this.memoryCache.forEach((value, key) => {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
      try {
        localStorage.removeItem(`${this.CACHE_KEY}_${oldestKey}`)
      } catch (error) {
        console.error('Error evicting cache entry:', error)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.memoryCache.clear()
    this.cacheSize = 0

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_KEY))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { entries: number; size: number } {
    return {
      entries: this.memoryCache.size,
      size: this.cacheSize
    }
  }
}

// Export singleton instance
export const thumbnailCache = new ThumbnailCache()

