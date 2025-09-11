'use client'

import { useState } from 'react'
import { StolenItem } from '@/types'

interface BulkOperationsProps {
  items: StolenItem[]
  onUpdate: () => void
}

export function BulkOperations({ items, onUpdate }: BulkOperationsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<string>('')

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(items.map(item => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleBulkOperation = async (operation: string) => {
    const selectedItemsArray = items.filter(item => selectedItems.has(item.id))
    
    switch (operation) {
      case 'export':
        alert(`Exporting ${selectedItems.size} items to PDF...`)
        break
      case 'tag':
        const tag = prompt('Enter tag to add to selected items:')
        if (tag) {
          alert(`Would add tag "${tag}" to ${selectedItems.size} items`)
        }
        break
      case 'category':
        const category = prompt('Enter category for selected items:')
        if (category) {
          alert(`Would set category "${category}" for ${selectedItems.size} items`)
        }
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
          alert(`Would delete ${selectedItems.size} items`)
          clearSelection()
        }
        break
      default:
        alert('Unknown operation')
    }
  }

  const totalValue = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.estimatedValue, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Bulk Operations</h2>
        <button
          onClick={() => setShowBulkActions(!showBulkActions)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
        </button>
      </div>

      {showBulkActions && (
        <div className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.size} of {items.length} items selected
              </span>
              {selectedItems.size > 0 && (
                <span className="text-sm text-green-600">
                  Total value: ${totalValue.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleBulkOperation('export')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => handleBulkOperation('tag')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🏷️ Add Tag
              </button>
              <button
                onClick={() => handleBulkOperation('category')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                📂 Set Category
              </button>
              <button
                onClick={() => handleBulkOperation('delete')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {/* Item Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <label key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">${item.estimatedValue.toLocaleString()}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
