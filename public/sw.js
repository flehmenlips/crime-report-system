// Service Worker - DISABLED for debugging chunk loading issues
console.log('Service Worker loaded but DISABLED for debugging')

const CACHE_NAME = 'crime-report-v1.0.3-completely-disabled'

// Install event - DISABLED for debugging
self.addEventListener('install', (event) => {
  console.log('Service Worker installation DISABLED for debugging')
  
  // Skip all caching to eliminate service worker interference
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('Service Worker installation skipped - no caching')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating - cleaning up old caches')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
      })
      .then(() => {
        console.log('All old caches deleted')
        return self.clients.claim()
      })
  )
})

// Fetch event - DISABLED for debugging
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // DISABLED: Let all requests go through normally without service worker interference
  console.log('Service Worker fetch DISABLED - letting request pass through:', request.url)
  
  // Don't intercept any requests - let them go to network directly
  return
})

// Push notification event - DISABLED
self.addEventListener('push', (event) => {
  console.log('Push notification received but DISABLED for debugging:', event)
  
  const options = {
    body: 'Service Worker notifications disabled for debugging',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Crime Report System - Debug Mode', options)
  )
})

// Background sync - DISABLED
self.addEventListener('sync', (event) => {
  console.log('Background sync event DISABLED for debugging:', event.tag)
})

// Message event - for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('Service Worker setup complete - all functionality DISABLED for debugging')