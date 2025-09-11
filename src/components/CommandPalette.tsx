'use client'

import { useState, useEffect, useRef } from 'react'
import { StolenItem } from '@/types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  items: StolenItem[]
  onAction: (action: string, data?: any) => void
}

export function CommandPalette({ isOpen, onClose, items, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = [
    {
      id: 'add-item',
      title: 'Add New Item',
      description: 'Document a new stolen item',
      icon: '➕',
      action: 'add-item',
      keywords: ['add', 'new', 'item', 'create', 'document']
    },
    {
      id: 'upload-evidence',
      title: 'Upload Evidence',
      description: 'Add photos, videos, or documents',
      icon: '📸',
      action: 'upload-evidence',
      keywords: ['upload', 'evidence', 'photo', 'video', 'document', 'file']
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create PDF for law enforcement',
      icon: '📄',
      action: 'generate-report',
      keywords: ['report', 'pdf', 'export', 'generate', 'law enforcement']
    },
    {
      id: 'search-items',
      title: 'Search Items',
      description: 'Find specific stolen property',
      icon: '🔍',
      action: 'search-items',
      keywords: ['search', 'find', 'filter', 'look']
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Case insights and statistics',
      icon: '📊',
      action: 'view-analytics',
      keywords: ['analytics', 'stats', 'insights', 'data']
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      description: 'Manage multiple items at once',
      icon: '⚡',
      action: 'bulk-operations',
      keywords: ['bulk', 'multiple', 'batch', 'mass']
    }
  ]

  // Add item-specific commands
  const itemCommands = items.map(item => ({
    id: `view-item-${item.id}`,
    title: `View ${item.name}`,
    description: `Open ${item.name} details`,
    icon: '👁️',
    action: 'view-item',
    data: item,
    keywords: ['view', item.name.toLowerCase(), item.serialNumber?.toLowerCase() || '']
  }))

  const allCommands = [...commands, ...itemCommands]

  const filteredCommands = allCommands.filter(command => {
    if (!query) return true
    const searchTerm = query.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.includes(searchTerm))
    )
  })

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const executeCommand = (command: any) => {
    onAction(command.action, command.data)
    onClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-gray-200/50">
            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands or items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-lg"
            />
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
              <span>navigate</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">⏎</kbd>
              <span>select</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">esc</kbd>
              <span>close</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try searching for "add item", "upload", or "report"</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 text-left transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-r-2 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      index === selectedIndex
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-lg">{command.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${
                        index === selectedIndex ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {command.title}
                      </p>
                      <p className={`text-sm truncate ${
                        index === selectedIndex ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {command.description}
                      </p>
                    </div>
                    {index === selectedIndex && (
                      <div className="flex items-center space-x-2">
                        <kbd className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">⏎</kbd>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>💡 Tip: Use ⌘K (Ctrl+K) to open command palette anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{filteredCommands.length} results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
