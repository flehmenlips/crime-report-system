'use client'

import { useState, useEffect, useRef } from 'react'

interface EnhancedTagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxTags?: number
  allowCustom?: boolean
  className?: string
}

export function EnhancedTagInput({
  tags = [],
  onChange,
  placeholder = "Add tags...",
  suggestions = [],
  maxTags = 10,
  allowCustom = true,
  className = ''
}: EnhancedTagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Common tag suggestions based on existing data
  const defaultSuggestions = [
    'valuable', 'high-value', 'electronics', 'tools', 'equipment',
    'john deere', 'case ih', 'kubota', 'new holland', 'fendt',
    'tractor', 'combine', 'planter', 'sprayer', 'cultivator',
    'heavy equipment', 'farm machinery', 'construction',
    'stolen', 'recovered', 'suspicious', 'damaged', 'working',
    'antique', 'vintage', 'new', 'used', 'restored'
  ]

  const allSuggestions = [...new Set([...defaultSuggestions, ...suggestions])]

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
      )
      setFilteredSuggestions(filtered.slice(0, 8)) // Show top 8 suggestions
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
  }, [inputValue, tags, allSuggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const getTagColor = (tag: string) => {
    // Color coding based on tag type
    const tagLower = tag.toLowerCase()
    if (tagLower.includes('valuable') || tagLower.includes('high-value')) return '#dc2626' // Red
    if (tagLower.includes('john deere') || tagLower.includes('case ih') || tagLower.includes('kubota')) return '#059669' // Green
    if (tagLower.includes('tractor') || tagLower.includes('combine') || tagLower.includes('equipment')) return '#3b82f6' // Blue
    if (tagLower.includes('stolen') || tagLower.includes('recovered')) return '#d97706' // Orange
    if (tagLower.includes('antique') || tagLower.includes('vintage')) return '#7c3aed' // Purple
    return '#6b7280' // Default gray
  }

  return (
    <div className={`relative ${className}`}>
      {/* Tag Container */}
      <div
        style={{
          minHeight: '48px',
          padding: '8px',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          cursor: 'text',
          transition: 'border-color 0.2s ease',
          ...(showSuggestions && { borderColor: '#3b82f6' })
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: getTagColor(tag),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '200px'
            }}
          >
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {tag}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Input Field */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (inputValue.trim()) {
                setShowSuggestions(true)
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              flex: 1,
              minWidth: '120px',
              background: 'transparent',
              padding: '4px'
            }}
          />
        )}

        {/* Max Tags Indicator */}
        {tags.length >= maxTags && (
          <span style={{
            color: '#6b7280',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            Maximum {maxTags} tags reached
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '14px',
                color: '#374151',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ fontWeight: '500' }}>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <span>
          Press Enter to add tags • {tags.length}/{maxTags} tags used
        </span>
        {tags.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
