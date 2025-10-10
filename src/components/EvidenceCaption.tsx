'use client'

import { useState } from 'react'

interface EvidenceCaptionProps {
  evidenceId: number
  initialDescription?: string | null
  canEdit: boolean
  onUpdate?: (description: string) => void
}

export function EvidenceCaption({ evidenceId, initialDescription, canEdit, onUpdate }: EvidenceCaptionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(initialDescription || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')

      const response = await fetch(`/api/evidence/${evidenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: description.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsEditing(false)
        if (onUpdate) {
          onUpdate(data.description || '')
        }
        console.log('✅ Evidence description updated')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update description')
      }
    } catch (error) {
      console.error('Error updating evidence description:', error)
      setError('Failed to update description')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDescription(initialDescription || '')
    setIsEditing(false)
    setError('')
  }

  if (!canEdit && !initialDescription) {
    return null
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          📝 Description / Caption
        </label>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#eff6ff'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            {initialDescription ? '✏️ Edit' : '➕ Add Description'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description or caption for this evidence file..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          
          {error && (
            <div style={{
              color: '#ef4444',
              fontSize: '14px',
              marginTop: '8px',
              padding: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !description.trim()}
              style={{
                padding: '10px 20px',
                background: isSaving || !description.trim() ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSaving || !description.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              {isSaving ? '💾 Saving...' : '✅ Save'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px',
          background: initialDescription ? '#f9fafb' : '#fef3c7',
          border: `1px solid ${initialDescription ? '#e5e7eb' : '#fcd34d'}`,
          borderRadius: '8px',
          fontSize: '14px',
          color: '#374151',
          lineHeight: '1.6',
          fontStyle: initialDescription ? 'normal' : 'italic'
        }}>
          {initialDescription || 'No description added yet'}
        </div>
      )}
    </div>
  )
}

