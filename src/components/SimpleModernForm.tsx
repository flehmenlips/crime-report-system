'use client'

import { useState } from 'react'
import { ItemFormData } from '@/types'

interface SimpleModernFormProps {
  onClose: () => void
  onSubmit: (data: ItemFormData) => void
  initialData?: Partial<ItemFormData>
  mode?: 'create' | 'edit'
}

export function SimpleModernForm({ onClose, onSubmit, initialData, mode = 'create' }: SimpleModernFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    serialNumber: initialData?.serialNumber || '',
    purchaseDate: initialData?.purchaseDate || '',
    purchaseCost: initialData?.purchaseCost || 0,
    dateLastSeen: initialData?.dateLastSeen || '',
    locationLastSeen: initialData?.locationLastSeen || '',
    estimatedValue: initialData?.estimatedValue || 0,
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    notes: initialData?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof ItemFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Item name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required'
    if (formData.purchaseCost <= 0) newErrors.purchaseCost = 'Purchase cost must be greater than 0'
    if (!formData.dateLastSeen) newErrors.dateLastSeen = 'Date last seen is required'
    if (!formData.locationLastSeen.trim()) newErrors.locationLastSeen = 'Location is required'
    if (formData.estimatedValue <= 0) newErrors.estimatedValue = 'Estimated value must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
          color: 'white',
          padding: '32px',
          position: 'relative'
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              {mode === 'edit' ? '✏️' : '➕'}
            </div>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
                {mode === 'edit' ? 'Edit' : 'Add New'} Stolen Item
              </h2>
              <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
                Professional documentation for your case
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ height: 'calc(90vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., John Deere Tractor Model 8R 250"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  {errors.name && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed description..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.description ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  {errors.description && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.description}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => updateField('serialNumber', e.target.value)}
                    placeholder="e.g., JD8R250-2023-001"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => updateField('purchaseDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.purchaseDate ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  {errors.purchaseDate && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.purchaseDate}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Purchase Cost *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.purchaseCost || ''}
                      onChange={(e) => updateField('purchaseCost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 40px',
                        border: errors.purchaseCost ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.purchaseCost && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.purchaseCost}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Date Last Seen *
                  </label>
                  <input
                    type="date"
                    value={formData.dateLastSeen}
                    onChange={(e) => updateField('dateLastSeen', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.dateLastSeen ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  {errors.dateLastSeen && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.dateLastSeen}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Location Last Seen *
                  </label>
                  <input
                    type="text"
                    value={formData.locationLastSeen}
                    onChange={(e) => updateField('locationLastSeen', e.target.value)}
                    placeholder="e.g., Main barn, equipment shed"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.locationLastSeen ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  {errors.locationLastSeen && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.locationLastSeen}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Current Estimated Value *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimatedValue || ''}
                      onChange={(e) => updateField('estimatedValue', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 40px',
                        border: errors.estimatedValue ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.estimatedValue && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.estimatedValue}</p>}
                </div>
              </div>
            </div>

            {/* Real-time Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                📋 Preview
              </h3>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '2px solid #bfdbfe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {formData.name || 'Item Name'}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      Value: ${formData.estimatedValue?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                  {formData.description || 'Description will appear here...'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Submit Button - ALWAYS VISIBLE */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            bottom: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '18px',
                boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {mode === 'edit' ? 'Update Item' : 'Create Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
