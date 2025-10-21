'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'
import { MobileAdvancedSearch } from '@/components/MobileAdvancedSearch'

export default function SearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [allItems, setAllItems] = useState<StolenItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [evidenceCache, setEvidenceCache] = useState<Record<string, any[]>>({})
  const [evidenceLoaded, setEvidenceLoaded] = useState(false)

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          setAuthenticated(true)
          setUser(userData)
        } else {
          router.push('/login-simple')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login-simple')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Load all items and evidence (only after authentication)
  useEffect(() => {
    if (!authenticated) return

    const loadData = async () => {
      try {
        // Load items
        const itemsResponse = await fetch('/api/items')
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          setAllItems(itemsData.items || [])
          
          // Load evidence for all items
          if (itemsData.items && itemsData.items.length > 0) {
            const cache: Record<string, any[]> = {}
            const batchSize = 5
            
            for (let i = 0; i < itemsData.items.length; i += batchSize) {
              const batch = itemsData.items.slice(i, i + batchSize)
              const batchPromises = batch.map(async (item: StolenItem) => {
                try {
                  const evidenceResponse = await fetch(`/api/evidence?itemId=${item.id}`)
                  if (evidenceResponse.ok) {
                    const evidenceData = await evidenceResponse.json()
                    return { itemId: item.id, evidence: evidenceData.evidence || [] }
                  }
                  return { itemId: item.id, evidence: [] }
                } catch (error) {
                  console.error(`Error loading evidence for item ${item.id}:`, error)
                  return { itemId: item.id, evidence: [] }
                }
              })
              
              const batchResults = await Promise.all(batchPromises)
              batchResults.forEach(({ itemId, evidence }) => {
                cache[itemId] = evidence
              })
            }
            
            setEvidenceCache(cache)
            setEvidenceLoaded(true)
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authenticated])

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading search data...'}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <MobileAdvancedSearch 
      items={allItems}
      user={user}
      evidenceCache={evidenceCache}
    />
  )
}

