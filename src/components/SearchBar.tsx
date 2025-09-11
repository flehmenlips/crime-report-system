'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/types'

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  totalItems: number
  filteredCount: number
}

export function SearchBar({ onSearch, totalItems, filteredCount }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: SearchFilters = {
        query: query || undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
      }
      onSearch(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, minValue, maxValue, onSearch])

  const clearFilters = () => {
    setQuery('')
    setMinValue('')
    setMaxValue('')
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="search"
          type="text"
          placeholder="Search by item name, description, or serial number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Info and Filters Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredCount}</span> of <span className="font-medium">{totalItems}</span> items found
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? '− Hide Filters' : '+ Show Filters'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Value Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minValue" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="maxValue" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">$</span>
                </div>
                <input
                  id="maxValue"
                  type="number"
                  placeholder="1,000,000"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          {(minValue || maxValue) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setMinValue('')
                  setMaxValue('')
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear Value Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clear All Filters */}
      {(query || minValue || maxValue) && (
        <div className="text-center">
          <button
            onClick={clearFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
