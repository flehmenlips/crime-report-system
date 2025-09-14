'use client'

import React, { useState } from 'react'
import { StolenItem } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { MediaGallery } from './MediaGallery'

interface ItemTableProps {
  items: StolenItem[]
}

export function ItemTable({ items }: ItemTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRowExpansion = (itemId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedRows(newExpanded)
  }

  const getEvidenceCount = (item: StolenItem) => {
    const photos = item.evidence?.filter(e => e.type === 'photo')?.length ?? 0
    const videos = item.evidence?.filter(e => e.type === 'video')?.length ?? 0
    const documents = item.evidence?.filter(e => e.type === 'document')?.length ?? 0
    return { photos, videos, documents }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items found matching your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Details
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase Info
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Seen
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evidence
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="relative px-4 sm:px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const isExpanded = expandedRows.has(item.id)
              const { photos, videos, documents } = getEvidenceCount(item)
              return (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Serial: {item.serialNumber}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                            {item.description}
                          </div>
                          {/* Mobile-only purchase info */}
                          <div className="md:hidden mt-1 text-xs text-gray-500">
                            {formatDate(item.purchaseDate)} • {formatCurrency(item.purchaseCost)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(item.purchaseDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.purchaseCost)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(item.dateLastSeen)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                        {item.locationLastSeen}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <MediaGallery item={item} compact={true} />
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(item.estimatedValue)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                      >
                        {isExpanded ? 'Less' : 'More'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${item.id}-expanded`}>
                      <td colSpan={6} className="px-4 sm:px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Full Description</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Evidence Gallery</h4>
                            <MediaGallery item={item} compact={false} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
