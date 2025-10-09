'use client'

import { useState, useEffect } from 'react'
import { StolenItem, ItemFormData } from '@/types'
import { getAllItems, formatCurrency, formatDate } from '@/lib/data'
import { AddItemForm } from './AddItemForm'
import { EvidenceManager } from './EvidenceManager'

export function CitizenDashboard() {
  const [items, setItems] = useState<StolenItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StolenItem | null>(null)
  const [showEvidenceManager, setShowEvidenceManager] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedItems = await getAllItems()
        setItems(loadedItems)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)
  const evidenceCount = items.reduce((total, item) => 
    total + item.evidence?.filter(e => e.type === 'photo')?.length + 
    item.evidence?.filter(e => e.type === 'video')?.length + 
    item.evidence?.filter(e => e.type === 'document')?.length, 0
  ) ?? 0

  const handleAddItem = async (formData: ItemFormData) => {
    try {
      // Create new item with next available ID
      const newItem: StolenItem = {
        id: Math.max(...items.map(i => i.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        serialNumber: formData.serialNumber || `AUTO-${Date.now()}`,
        purchaseDate: formData.purchaseDate,
        purchaseCost: formData.purchaseCost,
        dateLastSeen: formData.dateLastSeen,
        locationLastSeen: formData.locationLastSeen,
        estimatedValue: formData.estimatedValue,
        category: formData.category,
        evidence: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantId: "tenant-1", // Default tenant for now
        tenant: {
          id: "tenant-1",
          name: "Birkenfeld Farm",
          description: "Original Birkenfeld Farm theft case",
          isActive: true,
          createdAt: "2023-09-01T00:00:00Z",
          updatedAt: "2023-09-19T00:00:00Z"
        }
      }

      // Add to local state (in real app, this would save to database)
      setItems(prev => [...prev, newItem])
      
      console.log('New item added:', newItem)
      alert('Item added successfully! (In a real app, this would save to the database)')
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error adding item. Please try again.')
    }
  }

  const handleItemUpdate = (updatedItem: StolenItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const openEvidenceManager = (item: StolenItem) => {
    setSelectedItem(item)
    setShowEvidenceManager(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your stolen items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Property Owner Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stolen Property</h1>
        <p className="text-gray-600 text-lg">Birkenfeld Farm Theft • Manage your stolen items and evidence</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">{items.length}</div>
          <div className="text-red-800 font-medium">Items Stolen</div>
          <div className="text-sm text-red-600 mt-1">From your property</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(totalValue)}</div>
          <div className="text-green-800 font-medium">Total Loss</div>
          <div className="text-sm text-green-600 mt-1">Insurance claim value</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{evidenceCount}</div>
          <div className="text-blue-800 font-medium">Evidence Files</div>
          <div className="text-sm text-blue-600 mt-1">Photos, videos, documents</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Your Stolen Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              console.log('Add New Item button clicked')
              setShowAddForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Add New Item
          </button>
          <button 
            onClick={() => {
              if (items.length > 0) {
                openEvidenceManager(items[0])
              } else {
                alert('Please add an item first before uploading evidence')
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            📸 Upload Evidence
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            🏷️ Manage Tags
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            📄 Generate Report
          </button>
        </div>
      </div>

      {/* Items Grid - Better for citizen view */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Stolen Items</h2>
          <span className="text-sm text-gray-600">{items.length} items total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                <button 
                  onClick={() => openEvidenceManager(item)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Manage Evidence
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                <p className="text-sm"><span className="font-medium">Serial:</span> {item.serialNumber}</p>
                <p className="text-sm"><span className="font-medium">Value:</span> {formatCurrency(item.estimatedValue)}</p>
                <p className="text-sm"><span className="font-medium">Last Seen:</span> {formatDate(item.dateLastSeen)}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {item.evidence?.filter(e => e.type === 'photo')?.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      📷 {item.evidence.filter(e => e.type === 'photo').length}
                    </span>
                  )}
                  {item.evidence?.filter(e => e.type === 'video')?.length > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      🎥 {item.evidence.filter(e => e.type === 'video').length}
                    </span>
                  )}
                  {item.evidence?.filter(e => e.type === 'document')?.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      📄 {item.evidence.filter(e => e.type === 'document').length}
                    </span>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Form Modal */}
      {showAddForm && (
        <AddItemForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddItem}
        />
      )}

      {/* Evidence Manager Modal */}
      {showEvidenceManager && selectedItem && (
        <EvidenceManager
          item={selectedItem}
          onClose={() => {
            setShowEvidenceManager(false)
            setSelectedItem(null)
          }}
          onUpdate={handleItemUpdate}
        />
      )}
    </div>
  )
}
