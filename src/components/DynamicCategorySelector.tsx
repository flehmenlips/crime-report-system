import React, { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description?: string
  isSystem: boolean
  sortOrder: number
}

interface DynamicCategorySelectorProps {
  value: string
  onChange: (value: string) => void
  tenantId: string
  userId: string
}

export function DynamicCategorySelector({ value, onChange, tenantId, userId }: DynamicCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/categories?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories')
        setError('Failed to load categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Error loading categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchCategories()
    }
  }, [tenantId])

  // Create new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      setIsCreating(true)
      setError('')
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          tenantId,
          createdBy: userId
        })
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories(prev => [...prev, newCategory])
        onChange(newCategory.name)
        setNewCategoryName('')
        setNewCategoryDescription('')
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      setError('Error creating category')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading categories...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Category Selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            transition: 'border-color 0.2s ease',
            outline: 'none',
            background: 'white'
          }}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name} {category.isSystem ? '🔒' : ''}
            </option>
          ))}
        </select>
        
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '120px',
            justifyContent: 'center'
          }}
        >
          {showCreateForm ? '✖️' : '➕'} {showCreateForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Create Category Form */}
      {showCreateForm && (
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          marginTop: '12px'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1f2937' 
          }}>
            Create New Category
          </h4>
          
          <form onSubmit={handleCreateCategory}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Livestock, Fencing, Appliance"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Brief description of this category"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '14px', 
                marginBottom: '16px',
                padding: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isCreating || !newCategoryName.trim()}
                style={{
                  padding: '12px 24px',
                  background: isCreating || !newCategoryName.trim() ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isCreating || !newCategoryName.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isCreating ? '⏳' : '✅'} {isCreating ? 'Creating...' : 'Create Category'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewCategoryName('')
                  setNewCategoryDescription('')
                  setError('')
                }}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Info */}
      {value && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📂</span>
          <span>
            {categories.find(cat => cat.name === value)?.description || 'No description available'}
          </span>
        </div>
      )}
    </div>
  )
}
