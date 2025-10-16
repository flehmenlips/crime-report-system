'use client'

interface EnhancedTagDisplayProps {
  tags: string[]
  maxDisplay?: number
  showAll?: boolean
  onToggleShowAll?: () => void
  className?: string
}

export function EnhancedTagDisplay({
  tags = [],
  maxDisplay = 5,
  showAll = false,
  onToggleShowAll,
  className = ''
}: EnhancedTagDisplayProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  const getTagColor = (tag: string) => {
    // Color coding based on tag type
    const tagLower = tag.toLowerCase()
    if (tagLower.includes('valuable') || tagLower.includes('high-value')) {
      return {
        background: '#fee2e2',
        color: '#dc2626',
        border: '#fecaca'
      }
    }
    if (tagLower.includes('john deere') || tagLower.includes('case ih') || tagLower.includes('kubota')) {
      return {
        background: '#dcfce7',
        color: '#059669',
        border: '#bbf7d0'
      }
    }
    if (tagLower.includes('tractor') || tagLower.includes('combine') || tagLower.includes('equipment')) {
      return {
        background: '#dbeafe',
        color: '#3b82f6',
        border: '#bfdbfe'
      }
    }
    if (tagLower.includes('stolen') || tagLower.includes('recovered')) {
      return {
        background: '#fed7aa',
        color: '#d97706',
        border: '#fdba74'
      }
    }
    if (tagLower.includes('antique') || tagLower.includes('vintage')) {
      return {
        background: '#e9d5ff',
        color: '#7c3aed',
        border: '#ddd6fe'
      }
    }
    if (tagLower.includes('electronics') || tagLower.includes('computer') || tagLower.includes('phone')) {
      return {
        background: '#f3e8ff',
        color: '#8b5cf6',
        border: '#e9d5ff'
      }
    }
    // Default gray
    return {
      background: '#f3f4f6',
      color: '#6b7280',
      border: '#e5e7eb'
    }
  }

  const displayedTags = showAll ? tags : tags.slice(0, maxDisplay)
  const remainingCount = tags.length - maxDisplay

  return (
    <div className={className}>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        alignItems: 'center'
      }}>
        {displayedTags.map((tag, index) => {
          const colors = getTagColor(tag)
          return (
            <span
              key={index}
              style={{
                background: colors.background,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                cursor: 'default',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={tag} // Show full tag on hover
            >
              <span style={{ fontSize: '12px' }}>
                {getTagIcon(tag)}
              </span>
              {tag}
            </span>
          )
        })}
        
        {!showAll && remainingCount > 0 && (
          <button
            onClick={onToggleShowAll}
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#6b7280',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.2)'
            }}
          >
            +{remainingCount} more
          </button>
        )}
        
        {showAll && remainingCount > 0 && onToggleShowAll && (
          <button
            onClick={onToggleShowAll}
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#6b7280',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.2)'
            }}
          >
            Show less
          </button>
        )}
      </div>
    </div>
  )
}

function getTagIcon(tag: string): string {
  const tagLower = tag.toLowerCase()
  
  if (tagLower.includes('valuable') || tagLower.includes('high-value')) return '💎'
  if (tagLower.includes('john deere')) return '🟢'
  if (tagLower.includes('case ih')) return '🔴'
  if (tagLower.includes('kubota')) return '🟠'
  if (tagLower.includes('tractor')) return '🚜'
  if (tagLower.includes('combine')) return '🌾'
  if (tagLower.includes('equipment')) return '⚙️'
  if (tagLower.includes('stolen')) return '🚨'
  if (tagLower.includes('recovered')) return '✅'
  if (tagLower.includes('antique') || tagLower.includes('vintage')) return '🏛️'
  if (tagLower.includes('electronics') || tagLower.includes('computer')) return '💻'
  if (tagLower.includes('phone')) return '📱'
  if (tagLower.includes('camera')) return '📷'
  if (tagLower.includes('tools')) return '🔧'
  if (tagLower.includes('heavy')) return '🏗️'
  
  return '🏷️' // Default tag icon
}
