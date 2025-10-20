'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PropertyFormData {
  name: string
  description: string
  address: string
  contactEmail: string
  contactPhone: string
  propertyType: string
}

export default function PropertyOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    propertyType: 'residential'
  })

  const propertyTypes = [
    { value: 'residential', label: '🏠 Residential Property', description: 'Home, apartment, condo' },
    { value: 'commercial', label: '🏢 Commercial Property', description: 'Office, retail, warehouse' },
    { value: 'agricultural', label: '🚜 Agricultural Property', description: 'Farm, ranch, vineyard' },
    { value: 'marine', label: '⛵ Marine Property', description: 'Boatyard, marina, dock' },
    { value: 'collection', label: '📚 Personal Collection', description: 'Art, antiques, collectibles' },
    { value: 'business', label: '🍽️ Business Property', description: 'Restaurant, shop, service' },
    { value: 'other', label: '📦 Other', description: 'Custom property type' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/property/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Redirect to main dashboard
        router.push('/')
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to setup property')
      }
    } catch (error) {
      setError('Failed to setup property')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '28px'
          }}>
            🏢
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Welcome to REMISE Asset Barn!
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Let's set up your property details to get started
          </p>
          
          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px'
          }}>
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: stepNum <= step ? '#2563eb' : '#e5e7eb',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Property Type */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                What type of property are you managing?
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                This helps us customize your experience
              </p>

              <div style={{ display: 'grid', gap: '12px' }}>
                {propertyTypes.map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      border: formData.propertyType === type.value ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: formData.propertyType === type.value ? '#eff6ff' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={type.value}
                      checked={formData.propertyType === type.value}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      style={{ marginRight: '12px' }}
                    />
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '2px'
                      }}>
                        {type.label}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Details */}
          {step === 2 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Basic Property Information
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Tell us about your property
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Malibu Mansion, Ron's Restaurant, George's Antique Collection"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your property, business, or collection..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Contact Information
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Optional: Add contact details for your property
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="contact@property.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px'
          }}>
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                background: 'white',
                color: step === 1 ? '#9ca3af' : '#374151',
                opacity: step === 1 ? 0.5 : 1
              }}
            >
              ← Previous
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !formData.propertyType}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.name}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none'
                }}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>

        {/* Skip Option */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip for now (can set up later)
          </button>
        </div>

        {/* Navigation */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px'
        }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
