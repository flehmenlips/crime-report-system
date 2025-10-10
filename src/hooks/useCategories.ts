import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description?: string
  isSystem: boolean
  sortOrder: number
}

export function useCategories(tenantId?: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return

    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/categories?tenantId=${tenantId}`)
        
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        } else {
          setError('Failed to fetch categories')
        }
      } catch (err) {
        setError('Error fetching categories')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [tenantId])

  return { categories, loading, error }
}
