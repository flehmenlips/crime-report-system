'use client'

import { useState, useEffect } from 'react'
import { SearchFilters, StolenItem } from '@/types'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  items: StolenItem[]
  totalItems: number
  filteredCount: number
}

export function AdvancedSearch({ onSearch, items, totalItems, filteredCount }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [location, setLocation] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique categories and locations from items
  const categories = Array.from(new Set(items.map(item => item.serialNumber?.split('-')[0] || 'Other').filter(Boolean)))
  const locations = Array.from(new Set(items.map(item => item.locationLastSeen).filter(Boolean)))

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: SearchFilters = {
        query: query || undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        dateRange: dateStart && dateEnd ? { start: dateStart, end: dateEnd } : undefined
      }
      onSearch(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, minValue, maxValue, dateStart, dateEnd, onSearch])

  const clearAllFilters = () => {
    setQuery('')
    setCategory('')
    setMinValue('')
    setMaxValue('')
    setDateStart('')
    setDateEnd('')
    setLocation('')
  }

  const hasActiveFilters = query || category || minValue || maxValue || dateStart || dateEnd || location

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing <span className="font-medium">{filteredCount}</span> of <span className="font-medium">{totalItems}</span> items
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? '− Hide Advanced' : '+ Show Advanced'}
        </button>
      </div>

      {/* Basic Search */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, description, or serial number..."
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

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuery('tractor')}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
          >
            Tractors
          </button>
          <button
            onClick={() => setQuery('equipment')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
          >
            Equipment
          </button>
          <button
            onClick={() => setQuery('combine')}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
          >
            Combines
          </button>
          <button
            onClick={() => {
              setMinValue('300000')
              setMaxValue('')
            }}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
          >
            High Value ($300K+)
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          {/* Value Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Value Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="1,000,000"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Date Last Seen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All locations</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={clearAllFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Search Stats */}
      {hasActiveFilters && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <span className="font-medium">{filteredCount}</span> items match your search criteria
            </div>
            <div className="text-xs text-blue-600">
              {query && `Text: "${query}"`}
              {minValue && ` • Min: $${parseFloat(minValue).toLocaleString()}`}
              {maxValue && ` • Max: $${parseFloat(maxValue).toLocaleString()}`}
              {dateStart && ` • From: ${dateStart}`}
              {dateEnd && ` • To: ${dateEnd}`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
