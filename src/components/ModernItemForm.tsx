'use client'

import { useState, useEffect } from 'react'
import { ItemFormData } from '@/types'

interface ModernItemFormProps {
  onClose: () => void
  onSubmit: (data: ItemFormData) => void
  initialData?: Partial<ItemFormData>
  mode?: 'create' | 'edit'
}

export function ModernItemForm({ onClose, onSubmit, initialData, mode = 'create' }: ModernItemFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
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

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Tell us about the stolen item',
      icon: '📝',
      fields: ['name', 'description', 'serialNumber']
    },
    {
      id: 2,
      title: 'Purchase Details',
      description: 'When and how much did you pay?',
      icon: '💰',
      fields: ['purchaseDate', 'purchaseCost']
    },
    {
      id: 3,
      title: 'Theft Information',
      description: 'When and where was it last seen?',
      icon: '📍',
      fields: ['dateLastSeen', 'locationLastSeen', 'estimatedValue']
    },
    {
      id: 4,
      title: 'Organization',
      description: 'Categorize and add notes',
      icon: '🏷️',
      fields: ['category', 'tags', 'notes']
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Confirm your information',
      icon: '✅',
      fields: []
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)
  const progress = (currentStep / steps.length) * 100

  const updateField = (field: keyof ItemFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}
    const currentFields = currentStepData?.fields || []

    currentFields.forEach(field => {
      if (field === 'name' && !formData.name.trim()) {
        newErrors.name = 'Item name is required'
      }
      if (field === 'description' && !formData.description.trim()) {
        newErrors.description = 'Description is required'
      }
      if (field === 'purchaseDate' && !formData.purchaseDate) {
        newErrors.purchaseDate = 'Purchase date is required'
      }
      if (field === 'purchaseCost' && formData.purchaseCost <= 0) {
        newErrors.purchaseCost = 'Purchase cost must be greater than 0'
      }
      if (field === 'dateLastSeen' && !formData.dateLastSeen) {
        newErrors.dateLastSeen = 'Date last seen is required'
      }
      if (field === 'locationLastSeen' && !formData.locationLastSeen.trim()) {
        newErrors.locationLastSeen = 'Location is required'
      }
      if (field === 'estimatedValue' && formData.estimatedValue <= 0) {
        newErrors.estimatedValue = 'Estimated value must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (currentStep !== steps.length) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
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
        maxWidth: '800px',
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
              padding: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
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
              {currentStepData?.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
                {mode === 'edit' ? 'Edit' : 'Add New'} Stolen Item
              </h2>
              <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
                {currentStepData?.title}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Step {currentStep} of {steps.length}</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{Math.round(progress)}% Complete</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <p style={{ fontSize: '16px', opacity: 0.8, margin: 0 }}>
            {currentStepData?.description}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', minHeight: '400px' }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb'
                    }}
                  />
                  {errors.name && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed description including model, color, condition, special features..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.description ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.description ? '#ef4444' : '#e5e7eb'
                    }}
                  />
                  {errors.description && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => updateField('serialNumber', e.target.value)}
                    placeholder="e.g., JD8R250-2023-001 (optional)"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                    }}
                  />
                </div>
              </div>

              {/* Real-time Preview */}
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  📋 Preview
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                        {formData.serialNumber || 'No serial number'}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                    {formData.description || 'Description will appear here...'}
                  </p>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <p>Step {currentStep} of {steps.length} • {Math.round(progress)}% complete</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Purchase Details */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                  />
                  {errors.purchaseDate && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.purchaseDate}
                    </p>
                  )}
                </div>

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
                    }}>
                      $
                    </span>
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
                        transition: 'border-color 0.2s ease',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.purchaseCost && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.purchaseCost}
                    </p>
                  )}
                </div>
              </div>

              {/* Purchase Preview */}
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  💰 Purchase Summary
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Purchase Date</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                      {formData.purchaseDate ? new Date(formData.purchaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not selected'}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Purchase Cost</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                      {formatCurrency(formData.purchaseCost)}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
                    This information helps with insurance claims and legal documentation
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Theft Information */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                  />
                  {errors.dateLastSeen && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.dateLastSeen}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Location Last Seen *
                  </label>
                  <input
                    type="text"
                    value={formData.locationLastSeen}
                    onChange={(e) => updateField('locationLastSeen', e.target.value)}
                    placeholder="e.g., Main barn, equipment shed #2, north field"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: errors.locationLastSeen ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                  />
                  {errors.locationLastSeen && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.locationLastSeen}
                    </p>
                  )}
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
                    }}>
                      $
                    </span>
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
                        transition: 'border-color 0.2s ease',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.estimatedValue && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      {errors.estimatedValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Theft Information Preview */}
              <div style={{ flex: 1, background: '#fef2f2', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  📍 Theft Details
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #fecaca'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Last Seen</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                      {formData.dateLastSeen ? new Date(formData.dateLastSeen).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not selected'}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      {formData.locationLastSeen || 'Not specified'}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Current Value</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                      {formatCurrency(formData.estimatedValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Organization */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="">Select a category</option>
                    <option value="tractors">Tractors</option>
                    <option value="equipment">Farm Equipment</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                    onChange={(e) => updateField('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                    placeholder="e.g., john deere, heavy equipment, valuable (separate with commas)"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Tags help organize and search your items
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Any additional information about the theft, circumstances, or special details..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Organization Preview */}
              <div style={{ flex: 1, background: '#f0f9ff', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  🏷️ Organization
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #bfdbfe'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Category</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                      {formData.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) => (
                        <span key={index} style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {tag}
                        </span>
                      ))}
                      {(!formData.tags || formData.tags.length === 0) && (
                        <span style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
                          No tags added
                        </span>
                      )}
                    </div>
                  </div>
                  {formData.notes && (
                    <div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Notes</div>
                      <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                        {formData.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div style={{ height: '100%' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
                  📋 Review Your Item
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #bfdbfe'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '24px'
                    }}>
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                        {formData.name}
                      </h4>
                      <p style={{ fontSize: '16px', color: '#6b7280' }}>
                        {formData.serialNumber || 'No serial number'}
                      </p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
                        {formatCurrency(formData.estimatedValue)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Current Value</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>
                    {formData.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Purchase Date</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {new Date(formData.purchaseDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Purchase Cost</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {formatCurrency(formData.purchaseCost)}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date Last Seen</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {new Date(formData.dateLastSeen).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        {formData.locationLastSeen}
                      </div>
                    </div>
                  </div>

                  {(formData.category || (formData.tags && formData.tags.length > 0)) && (
                    <div style={{ marginBottom: '16px' }}>
                      {formData.category && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            📂 {formData.category}
                          </span>
                        </div>
                      )}
                      {formData.tags && formData.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {formData.tags.map((tag, index) => (
                            <span key={index} style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                style={{
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Step {currentStep} of {steps.length}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Continue
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
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
                  gap: '8px'
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
