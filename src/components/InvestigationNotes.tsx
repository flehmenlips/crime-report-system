'use client'

import { useState, useEffect } from 'react'
import { StolenItem, User } from '@/types'
import { formatDate } from '@/lib/data'

interface InvestigationNotesProps {
  item: StolenItem
  user: User
  onClose: () => void
}

interface Note {
  id: number
  content: string
  createdBy: string
  createdByName: string
  createdByRole: string
  createdAt: string
  isConfidential: boolean
}

export function InvestigationNotes({ item, user, onClose }: InvestigationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isConfidential, setIsConfidential] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editConfidential, setEditConfidential] = useState(false)
  const [deletingNote, setDeletingNote] = useState<number | null>(null)

  useEffect(() => {
    loadNotes()
  }, [item.id])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notes?itemId=${item.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load notes')
      }

      const data = await response.json()
      setNotes(data.notes || [])
    } catch (err) {
      console.error('Error loading notes:', err)
      setError('Failed to load investigation notes')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setError('Please enter a note')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: item.id,
          content: newNote.trim(),
          createdBy: user.id,
          createdByName: user.name,
          createdByRole: user.role,
          isConfidential
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save note')
      }

      const savedNote = await response.json()
      
      // Add new note to the list
      setNotes([savedNote, ...notes])
      setNewNote('')
      setIsConfidential(false)
    } catch (err) {
      console.error('Error saving note:', err)
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  const handleEditNote = async (noteId: number) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
          isConfidential: editConfidential
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update note')
      }

      // Reload notes to get updated data
      await loadNotes()
      
      // Reset edit state
      setEditingNote(null)
      setEditContent('')
      setEditConfidential(false)

    } catch (err) {
      console.error('Error updating note:', err)
      setError(err instanceof Error ? err.message : 'Failed to update note')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    try {
      setDeletingNote(noteId)
      setError(null)

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete note')
      }

      // Reload notes to get updated data
      await loadNotes()

    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    } finally {
      setDeletingNote(null)
    }
  }

  const handleDuplicateNote = (note: Note) => {
    setNewNote(note.content)
    setIsConfidential(note.isConfidential)
    // Scroll to the add note section
    const addNoteSection = document.querySelector('[data-add-note-section]')
    if (addNoteSection) {
      addNoteSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const startEditNote = (note: Note) => {
    setEditingNote(note)
    setEditContent(note.content)
    setEditConfidential(note.isConfidential)
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setEditContent('')
    setEditConfidential(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'law_enforcement':
        return { bg: '#fee2e2', color: '#991b1b', icon: '🚔' }
      case 'insurance_agent':
        return { bg: '#dcfce7', color: '#166534', icon: '🏢' }
      case 'property_owner':
        return { bg: '#dbeafe', color: '#1e40af', icon: '👤' }
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: '📝' }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          padding: '32px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          color: 'white',
          position: 'relative',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            🔍 Investigation Notes
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {item.name}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {/* Add New Note */}
          <div 
            data-add-note-section
            style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '2px solid #e5e7eb'
            }}
          >
            <label style={{ display: 'block', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Add Investigation Note
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Document findings, observations, leads, or other investigation details..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '120px',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span>🔒 Mark as confidential (law enforcement only)</span>
              </label>

              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || saving}
                style={{
                  background: !newNote.trim() || saving
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: !newNote.trim() || saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {saving ? 'Saving...' : '💾 Add Note'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Notes List */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              Investigation History ({notes.length})
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #dc2626',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  No investigation notes yet. Add the first note above.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notes.map((note) => {
                  const roleBadge = getRoleBadgeColor(note.createdByRole)
                  // Fix: Ensure consistent ID type comparison (both should be strings)
                  const canEdit = user.role === 'law_enforcement' || String(user.id) === String(note.createdBy)
                  
                  return (
                    <div
                      key={note.id}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: note.isConfidential ? '2px solid #fef3c7' : '2px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {editingNote?.id === note.id ? (
                        // Edit Mode
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                background: roleBadge.bg,
                                color: roleBadge.color,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span>{roleBadge.icon}</span>
                                <span>{note.createdByName}</span>
                              </div>
                              {editConfidential && (
                                <div style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  🔒 Confidential
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatDate(note.createdAt)} • Editing
                            </div>
                          </div>
                          
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb',
                              fontSize: '14px',
                              fontFamily: 'inherit',
                              minHeight: '100px',
                              resize: 'vertical',
                              marginBottom: '12px'
                            }}
                          />
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              <input
                                type="checkbox"
                                checked={editConfidential}
                                onChange={(e) => setEditConfidential(e.target.checked)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer'
                                }}
                              />
                              <span>🔒 Mark as confidential</span>
                            </label>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                style={{
                                  background: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditNote(note.id)}
                                disabled={!editContent.trim() || saving}
                                style={{
                                  background: !editContent.trim() || saving
                                    ? '#d1d5db'
                                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  cursor: !editContent.trim() || saving ? 'not-allowed' : 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                background: roleBadge.bg,
                                color: roleBadge.color,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span>{roleBadge.icon}</span>
                                <span>{note.createdByName}</span>
                              </div>
                              {note.isConfidential && (
                                <div style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  🔒 Confidential
                                </div>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {formatDate(note.createdAt)}
                              </div>
                              
                              {canEdit && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => startEditNote(note)}
                                    style={{
                                      background: '#f3f4f6',
                                      border: '1px solid #d1d5db',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      color: '#374151'
                                    }}
                                    title="Edit note"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateNote(note)}
                                    style={{
                                      background: '#f3f4f6',
                                      border: '1px solid #d1d5db',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      color: '#374151'
                                    }}
                                    title="Duplicate note"
                                  >
                                    📋
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
                                        handleDeleteNote(note.id)
                                      }
                                    }}
                                    disabled={deletingNote === note.id}
                                    style={{
                                      background: deletingNote === note.id ? '#fca5a5' : '#fee2e2',
                                      border: '1px solid #fecaca',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: deletingNote === note.id ? 'not-allowed' : 'pointer',
                                      fontSize: '11px',
                                      color: '#991b1b'
                                    }}
                                    title="Delete note"
                                  >
                                    {deletingNote === note.id ? '⏳' : '🗑️'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p style={{
                            color: '#374151',
                            lineHeight: '1.6',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {note.content}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

