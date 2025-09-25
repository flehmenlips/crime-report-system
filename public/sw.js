const CACHE_NAME = 'crime-report-v1.0.1'
const STATIC_CACHE_NAME = 'crime-report-static-v1.0.1'
const DYNAMIC_CACHE_NAME = 'crime-report-dynamic-v1.0.1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/offline.html'
]

// API routes to cache
const API_ROUTES = [
  '/api/items',
  '/api/user/profile'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url)
          // Special debugging for manifest.json
          if (request.url.includes('manifest.json')) {
            console.log('Manifest.json being served from cache')
            cachedResponse.clone().text().then(text => {
              console.log('Cached manifest.json content preview:', text.substring(0, 200))
            }).catch(err => {
              console.error('Error reading cached manifest.json:', err)
            })
          }
          return cachedResponse
        }
        
        // Otherwise, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Special debugging for manifest.json
            if (request.url.includes('manifest.json')) {
              console.log('Fetching manifest.json from network, status:', networkResponse.status)
              if (networkResponse.ok) {
                networkResponse.clone().text().then(text => {
                  console.log('Network manifest.json content preview:', text.substring(0, 200))
                }).catch(err => {
                  console.error('Error reading network manifest.json:', err)
                })
              }
            }
            
            // Check if response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone()
            
            // Cache API responses
            if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
            }
            
            // Cache static assets
            if (STATIC_ASSETS.includes(url.pathname)) {
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
            }
            
            return networkResponse
          })
          .catch((error) => {
            console.log('Network request failed:', request.url, error)
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            
            // Return cached API response if available
            if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
              return caches.match(request)
            }
            
            // Return a generic offline response
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'You are currently offline. Please check your internet connection.'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when connection is restored
      handleBackgroundSync()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Crime Report System',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.svg'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Crime Report System', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await syncOfflineAction(action)
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync offline action:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
  // This would integrate with IndexedDB to get pending actions
  // For now, return empty array
  return []
}

// Sync an offline action
async function syncOfflineAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  })
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`)
  }
  
  return response
}

// Remove offline action after successful sync
async function removeOfflineAction(actionId) {
  // This would remove the action from IndexedDB
  console.log('Removing offline action:', actionId)
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

console.log('Service Worker loaded successfully')
