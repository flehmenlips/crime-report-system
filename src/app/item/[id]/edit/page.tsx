'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StolenItem } from '@/types'

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  
  const [isMobile, setIsMobile] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    estimatedValue: '',
    serialNumber: '',
    manufacturer: '',
    model: ''
  })

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          setAuthenticated(true)
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

  // Load item data and categories
  useEffect(() => {
    if (!authenticated || !itemId) return

    const loadData = async () => {
      try {
        // Load item
        const itemsResponse = await fetch('/api/items')
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          const foundItem = itemsData.items.find((i: StolenItem) => i.id.toString() === itemId.toString())
          if (foundItem) {
            setFormData({
              name: foundItem.name || '',
              description: foundItem.description || '',
              category: foundItem.category || '',
              estimatedValue: foundItem.estimatedValue?.toString() || '',
              serialNumber: foundItem.serialNumber || '',
              manufacturer: (foundItem as any).manufacturer || '',
              model: (foundItem as any).model || ''
            })
          } else {
            router.back()
            return
          }
        }

        // Load categories
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        router.back()
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authenticated, itemId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue) || 0
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/item/${itemId}`)
        }, 1500)
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to update item')
      }
    } catch (err) {
      setError('Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {authLoading ? 'Checking authentication...' : 'Loading item...'}
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      paddingBottom: isMobile ? '140px' : '48px'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            Edit Item
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px 16px' : '32px'
          }}>
            {/* Success Message */}
            {success && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                color: '#059669',
                textAlign: 'center'
              }}>
                ✓ Item updated successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Estimated Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isMobile ? 'column' : 'row',
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={saving}
                  style={{
                    padding: '14px 24px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    flex: isMobile ? 'none' : 1,
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || success}
                  style={{
                    padding: '14px 24px',
                    background: (saving || success) ? 'rgba(59, 130, 246, 0.7)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (saving || success) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    flex: isMobile ? 'none' : 2,
                    opacity: (saving || success) ? 0.7 : 1
                  }}
                >
                  {saving ? '💾 Saving...' : success ? '✓ Saved!' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

