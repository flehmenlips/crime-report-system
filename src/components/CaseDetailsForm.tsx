'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'

interface CaseDetailsFormProps {
  user: User
  caseId?: string | null
  onClose: () => void
  onSave?: () => void
}

interface FormData {
  caseName: string
  caseNumber: string
  dateReported: string
  dateOccurred: string
  location: string
  status: string
  priority: string
  assignedOfficer: string
  description: string
}

interface TimelineEvent {
  id?: string
  date: string
  time: string
  event: string
  description: string
}

interface Suspect {
  id?: string
  name: string
  description: string
  address?: string
  phone?: string
  status: string
}

interface Evidence {
  id?: string
  type: string
  description: string
  location: string
  collectedBy: string
  dateCollected: string
}

interface Update {
  id?: string
  date: string
  update: string
}

export function CaseDetailsForm({ user, caseId, onClose, onSave }: CaseDetailsFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    caseName: '',
    caseNumber: '',
    dateReported: new Date().toISOString().split('T')[0],
    dateOccurred: '',
    location: '',
    status: 'open',
    priority: 'medium',
    assignedOfficer: '',
    description: ''
  })
  
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  
  // Sub-form states
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null)
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null)
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null)
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null)

  const isEditMode = !!caseId

  useEffect(() => {
    if (caseId) {
      loadCaseDetails()
    }
  }, [caseId])

  const loadCaseDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/case-details?tenantId=${user.tenant?.id}&userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load case details')
      }

      const data = await response.json()
      const caseData = data.caseDetails.find((c: any) => c.id === caseId)
      
      if (caseData) {
        setFormData({
          caseName: caseData.caseName,
          caseNumber: caseData.caseNumber || '',
          dateReported: new Date(caseData.dateReported).toISOString().split('T')[0],
          dateOccurred: new Date(caseData.dateOccurred).toISOString().split('T')[0],
          location: caseData.location,
          status: caseData.status,
          priority: caseData.priority,
          assignedOfficer: caseData.assignedOfficer || '',
          description: caseData.description
        })
        setTimeline(caseData.timeline || [])
        setSuspects(caseData.suspects || [])
        setEvidence(caseData.caseEvidence || [])
        setUpdates(caseData.updates || [])
      }
    } catch (err) {
      console.error('Error loading case details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load case details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate required fields
      if (!formData.caseName || !formData.dateReported || !formData.dateOccurred || !formData.location || !formData.description) {
        setError('Please fill in all required fields')
        return
      }

      if (isEditMode) {
        // Update existing case
        const response = await fetch('/api/case-details', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: caseId,
            ...formData,
            userId: user.id
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update case')
        }

        // Update child entities if changed
        await saveChildEntities(caseId!)

      } else {
        // Create new case
        const response = await fetch('/api/case-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: user.tenant?.id || 'tenant-1',
            ...formData,
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create case')
        }

        const result = await response.json()
        const newCaseId = result.caseDetails.id

        // Save child entities
        await saveChildEntities(newCaseId)
      }

      if (onSave) {
        onSave()
      }
      
      onClose()

    } catch (err) {
      console.error('Error saving case:', err)
      setError(err instanceof Error ? err.message : 'Failed to save case')
    } finally {
      setSaving(false)
    }
  }

  const saveChildEntities = async (caseId: string) => {
    // Save timeline events
    for (const event of timeline) {
      if (!event.id) {
        await fetch('/api/case-details/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            ...event,
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role
          })
        })
      }
    }

    // Save suspects
    for (const suspect of suspects) {
      if (!suspect.id) {
        await fetch('/api/case-details/suspects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            ...suspect,
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role
          })
        })
      }
    }

    // Save evidence
    for (const evidenceItem of evidence) {
      if (!evidenceItem.id) {
        await fetch('/api/case-details/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            ...evidenceItem,
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role
          })
        })
      }
    }

    // Save updates
    for (const update of updates) {
      if (!update.id) {
        await fetch('/api/case-details/updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            ...update,
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role
          })
        })
      }
    }
  }

  const totalSteps = 5

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: s <= step ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#e5e7eb',
            color: s <= step ? 'white' : '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px'
          }}>
            {s}
          </div>
          {s < 5 && (
            <div style={{
              flex: 1,
              height: '3px',
              background: s < step ? '#3b82f6' : '#e5e7eb',
              borderRadius: '2px'
            }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
            maxWidth: '900px',
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
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            padding: '32px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            color: 'white',
            flexShrink: 0
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
              {isEditMode ? '✏️ Edit Case Report' : '📝 Create Case Report'}
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Case Description'}
              {step === 3 && 'Timeline Events'}
              {step === 4 && 'Suspects & Evidence'}
              {step === 5 && 'Review & Submit'}
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
            {renderStepIndicator()}

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

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Case Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.caseName}
                    onChange={(e) => setFormData({ ...formData, caseName: e.target.value })}
                    placeholder="e.g., Birkenfeld Farm Theft Investigation"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Case Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="e.g., CC-2025-001234"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Date Reported <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateReported}
                      onChange={(e) => setFormData({ ...formData, dateReported: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Date Occurred <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOccurred}
                      onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Location <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., 10640 Freeman Road, Birkenfeld, OR 97016"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px'
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '14px'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Assigned Officer (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.assignedOfficer}
                    onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                    placeholder="e.g., Deputy Dave Brown"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {step === 2 && (
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Case Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  Provide a comprehensive description of the incident, including all relevant details, circumstances, and background information.
                </p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the incident in detail..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    minHeight: '400px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                  {formData.description.length} characters
                </div>
              </div>
            )}

            {/* Step 3: Timeline */}
            {step === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                    Timeline Events
                  </h3>
                  <button
                    onClick={() => setEditingTimeline({
                      date: new Date().toISOString().split('T')[0],
                      time: '12:00',
                      event: '',
                      description: ''
                    })}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add Event
                  </button>
                </div>

                {editingTimeline && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '2px solid #3b82f6'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                      {editingTimeline.id ? 'Edit Event' : 'New Event'}
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="date"
                        value={editingTimeline.date}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, date: e.target.value })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="time"
                        value={editingTimeline.time}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, time: e.target.value })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <input
                      type="text"
                      value={editingTimeline.event}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, event: e.target.value })}
                      placeholder="Event title (e.g., 'Initial Contact')"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}
                    />
                    
                    <textarea
                      value={editingTimeline.description}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, description: e.target.value })}
                      placeholder="Event description..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        marginBottom: '12px'
                      }}
                    />
                    
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingTimeline(null)}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingTimeline.event && editingTimeline.description) {
                            if (editingTimeline.id) {
                              setTimeline(timeline.map(e => e.id === editingTimeline.id ? editingTimeline : e))
                            } else {
                              setTimeline([...timeline, { ...editingTimeline, id: `temp-${Date.now()}` }])
                            }
                            setEditingTimeline(null)
                          }
                        }}
                        disabled={!editingTimeline.event || !editingTimeline.description}
                        style={{
                          background: !editingTimeline.event || !editingTimeline.description ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: !editingTimeline.event || !editingTimeline.description ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Save Event
                      </button>
                    </div>
                  </div>
                )}

                {timeline.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏰</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No timeline events added yet. Click "Add Event" to start building your case timeline.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {timeline.map((event, index) => (
                      <div key={event.id || index} style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                              {event.event}
                            </h4>
                            <span style={{
                              background: '#f3f4f6',
                              color: '#6b7280',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {event.date} {event.time}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                            {event.description}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => setEditingTimeline(event)}
                            style={{
                              background: '#f3f4f6',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setTimeline(timeline.filter(e => e.id !== event.id))}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Description - Moved to step 2 */}
            
            {/* Step 4: Suspects & Evidence */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Suspects Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      👤 Suspects
                    </h3>
                    <button
                      onClick={() => setEditingSuspect({
                        name: '',
                        description: '',
                        status: 'active'
                      })}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      ➕ Add Suspect
                    </button>
                  </div>

                  {editingSuspect && (
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      border: '2px solid #3b82f6'
                    }}>
                      <input
                        type="text"
                        value={editingSuspect.name}
                        onChange={(e) => setEditingSuspect({ ...editingSuspect, name: e.target.value })}
                        placeholder="Suspect name"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}
                      />
                      <textarea
                        value={editingSuspect.description}
                        onChange={(e) => setEditingSuspect({ ...editingSuspect, description: e.target.value })}
                        placeholder="Description..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          minHeight: '60px',
                          marginBottom: '8px'
                        }}
                      />
                      <input
                        type="text"
                        value={editingSuspect.address || ''}
                        onChange={(e) => setEditingSuspect({ ...editingSuspect, address: e.target.value })}
                        placeholder="Address (optional)"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}
                      />
                      <input
                        type="tel"
                        value={editingSuspect.phone || ''}
                        onChange={(e) => setEditingSuspect({ ...editingSuspect, phone: e.target.value })}
                        placeholder="Phone (optional)"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}
                      />
                      
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingSuspect(null)}
                          style={{
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editingSuspect.name && editingSuspect.description) {
                              if (editingSuspect.id) {
                                setSuspects(suspects.map(s => s.id === editingSuspect.id ? editingSuspect : s))
                              } else {
                                setSuspects([...suspects, { ...editingSuspect, id: `temp-${Date.now()}` }])
                              }
                              setEditingSuspect(null)
                            }
                          }}
                          disabled={!editingSuspect.name || !editingSuspect.description}
                          style={{
                            background: !editingSuspect.name || !editingSuspect.description ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: !editingSuspect.name || !editingSuspect.description ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {suspects.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '32px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                        No suspects added yet. Click "Add Suspect" to add suspect information.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {suspects.map((suspect) => (
                        <div key={suspect.id} style={{
                          background: 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'start',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                              {suspect.name}
                            </h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                              {suspect.description}
                            </p>
                            {suspect.address && (
                              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                                📍 {suspect.address}
                              </p>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => setEditingSuspect(suspect)}
                              style={{
                                background: '#f3f4f6',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setSuspects(suspects.filter(s => s.id !== suspect.id))}
                              style={{
                                background: '#fee2e2',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Evidence Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      🔍 Evidence Documentation
                    </h3>
                    <button
                      onClick={() => setEditingEvidence({
                        type: '',
                        description: '',
                        location: '',
                        collectedBy: user.name,
                        dateCollected: new Date().toISOString().split('T')[0]
                      })}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      ➕ Add Evidence
                    </button>
                  </div>

                  {editingEvidence && (
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      border: '2px solid #3b82f6'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          value={editingEvidence.type}
                          onChange={(e) => setEditingEvidence({ ...editingEvidence, type: e.target.value })}
                          placeholder="Evidence type (e.g., 'Photographs', 'Video')"
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="date"
                          value={editingEvidence.dateCollected}
                          onChange={(e) => setEditingEvidence({ ...editingEvidence, dateCollected: e.target.value })}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <textarea
                        value={editingEvidence.description}
                        onChange={(e) => setEditingEvidence({ ...editingEvidence, description: e.target.value })}
                        placeholder="Evidence description..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          minHeight: '60px',
                          marginBottom: '12px'
                        }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          value={editingEvidence.location}
                          onChange={(e) => setEditingEvidence({ ...editingEvidence, location: e.target.value })}
                          placeholder="Evidence location"
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="text"
                          value={editingEvidence.collectedBy}
                          onChange={(e) => setEditingEvidence({ ...editingEvidence, collectedBy: e.target.value })}
                          placeholder="Collected by"
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingEvidence(null)}
                          style={{
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editingEvidence.type && editingEvidence.description && editingEvidence.location && editingEvidence.collectedBy) {
                              if (editingEvidence.id) {
                                setEvidence(evidence.map(e => e.id === editingEvidence.id ? editingEvidence : e))
                              } else {
                                setEvidence([...evidence, { ...editingEvidence, id: `temp-${Date.now()}` }])
                              }
                              setEditingEvidence(null)
                            }
                          }}
                          disabled={!editingEvidence.type || !editingEvidence.description || !editingEvidence.location || !editingEvidence.collectedBy}
                          style={{
                            background: !editingEvidence.type || !editingEvidence.description || !editingEvidence.location || !editingEvidence.collectedBy ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: !editingEvidence.type || !editingEvidence.description || !editingEvidence.location || !editingEvidence.collectedBy ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {suspects.length === 0 && !editingSuspect && (
                    <div style={{
                      textAlign: 'center',
                      padding: '24px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                        No suspects added yet.
                      </p>
                    </div>
                  )}

                  {suspects.length > 0 && !editingSuspect && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {suspects.map((suspect) => (
                        <div key={suspect.id} style={{
                          background: 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                              {suspect.name}
                            </h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                              {suspect.description}
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => setEditingSuspect(suspect)}
                              style={{
                                background: '#f3f4f6',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setSuspects(suspects.filter(s => s.id !== suspect.id))}
                              style={{
                                background: '#fee2e2',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Evidence Section */}
                {evidence.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      Evidence Items ({evidence.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {evidence.map((item) => (
                        <div key={item.id} style={{
                          background: 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                              {item.type}
                            </h4>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                              {item.description}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => setEvidence(evidence.filter(e => e.id !== item.id))}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                  Review Your Case Report
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      Case Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Name:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937', marginLeft: '8px' }}>{formData.caseName}</span>
                      </div>
                      {formData.caseNumber && (
                        <div>
                          <span style={{ color: '#6b7280' }}>Case #:</span>
                          <span style={{ fontWeight: '600', color: '#1f2937', marginLeft: '8px' }}>{formData.caseNumber}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: '#6b7280' }}>Date Reported:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937', marginLeft: '8px' }}>{formData.dateReported}</span>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Date Occurred:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937', marginLeft: '8px' }}>{formData.dateOccurred}</span>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#6b7280' }}>Location:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937', marginLeft: '8px' }}>{formData.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                      Summary
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                          {timeline.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Timeline Events</div>
                      </div>
                      
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                          {suspects.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Suspects</div>
                      </div>
                      
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                          {evidence.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Evidence Items</div>
                      </div>
                      
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                          {updates.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Updates</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#eff6ff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #dbeafe'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>ℹ️</div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px 0' }}>
                          Ready to Submit
                        </h4>
                        <p style={{ margin: 0, color: '#3b82f6', fontSize: '13px', lineHeight: '1.5' }}>
                          Once you save this case report, it will be stored securely in your account. 
                          You can edit it anytime and grant access to law enforcement and other stakeholders as needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={saving}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  disabled={saving}
                  style={{
                    background: 'transparent',
                    color: '#6b7280',
                    border: '2px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>

                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={saving}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.caseName || !formData.description}
                    style={{
                      background: saving || !formData.caseName || !formData.description
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 32px',
                      borderRadius: '12px',
                      cursor: saving || !formData.caseName || !formData.description ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {saving ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        💾 {isEditMode ? 'Update Case' : 'Save Case Report'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
