'use client'

import { useState, useEffect, useRef } from 'react'
import { StolenItem } from '@/types'

interface InstantSearchProps {
  items: StolenItem[]
  onItemSelect: (item: StolenItem) => void
  placeholder?: string
}

export function InstantSearch({ items, onItemSelect, placeholder = "Search your stolen items..." }: InstantSearchProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Filter items based on query
  const filteredItems = items.filter(item => {
    if (!query) return false
    const searchTerm = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.serialNumber?.toLowerCase().includes(searchTerm) ||
      item.locationLastSeen.toLowerCase().includes(searchTerm)
    )
  }).slice(0, 8) // Limit to 8 results

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    setShowResults(query.length > 0 && filteredItems.length > 0)
  }, [query, filteredItems.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          selectItem(filteredItems[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowResults(false)
        setQuery('')
        break
    }
  }

  const selectItem = (item: StolenItem) => {
    onItemSelect(item)
    setQuery('')
    setShowResults(false)
    inputRef.current?.blur()
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowResults(true)}
          className="input-modern pl-12 pr-4 py-4 text-lg shadow-lg focus:shadow-2xl"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setShowResults(false)
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50"
        >
          <div className="p-3 border-b border-gray-200/50 bg-gray-50/50">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {filteredItems.length} results for "{query}"
              </span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-white rounded">↑↓</kbd>
                <span>navigate</span>
                <kbd className="px-2 py-1 bg-white rounded">⏎</kbd>
                <span>select</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                className={`w-full flex items-center space-x-4 p-4 text-left transition-all duration-150 ${
                  index === selectedIndex
                    ? 'bg-blue-50 border-r-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate ${
                    index === selectedIndex ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {highlightMatch(item.name, query)}
                  </h4>
                  <p className={`text-sm truncate ${
                    index === selectedIndex ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {highlightMatch(item.description, query)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Serial: {item.serialNumber || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-green-600 font-semibold">
                      ${item.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.evidence.photos.length > 0 && (
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      📷
                    </span>
                  )}
                  {item.evidence.videos.length > 0 && (
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                      🎥
                    </span>
                  )}
                  {item.evidence.documents.length > 0 && (
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                      📄
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && query && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="font-semibold text-gray-900 mb-2">No items found</h4>
              <p className="text-gray-600 text-sm">
                Try searching for item names, descriptions, or serial numbers
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Suggestions */}
      {!query && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
              <span className="font-medium">Quick searches:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['tractor', 'combine', 'equipment', 'john deere', 'high value'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
