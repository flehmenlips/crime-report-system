'use client'

import React, { useState, useEffect } from 'react'

interface Property {
  id: string
  name: string
  description: string
  address: string
  contactEmail: string
  contactPhone: string
  createdAt: string
  _count: {
    users: number
    items: number
  }
}

export default function PropertyManagement() {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    loadProperty()
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/property/my-property')
      if (response.ok) {
        const data = await response.json()
        setProperty(data.property)
        if (data.property) {
          setFormData({
            name: data.property.name || '',
            description: data.property.description || '',
            address: data.property.address || '',
            contactEmail: data.property.contactEmail || '',
            contactPhone: data.property.contactPhone || ''
          })
        }
      } else {
        setError('Failed to load property details')
      }
    } catch (error) {
      setError('Failed to load property details')
      console.error('Error loading property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/property/my-property', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('✅ Property updated successfully!')
        loadProperty()
        setShowEditForm(false)
      } else {
        const result = await response.json()
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Failed to update property')
    }
  }

  const resetForm = () => {
    if (property) {
      setFormData({
        name: property.name || '',
        description: property.description || '',
        address: property.address || '',
        contactEmail: property.contactEmail || '',
        contactPhone: property.contactPhone || ''
      })
    }
    setShowEditForm(false)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading property details...
      </div>
    )
  }

  if (!property) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            fontSize: '40px'
          }}>
            🏢
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            No Property Setup Yet
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            You haven't set up your property details yet. This helps us customize your experience and provides important information for stakeholders.
          </p>
          <button
            onClick={() => window.location.href = '/property-onboarding'}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            Set Up My Property
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: isMobile ? '100%' : '1000px',
      margin: '0 auto',
      padding: isMobile ? '8px' : '24px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Navigation Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{
          height: '20px',
          width: '1px',
          background: '#cbd5e1'
        }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          🏠 <span>REMISE Asset Barn</span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            🏢 My Property
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Manage your property details and information
          </p>
        </div>
        <button
          onClick={() => setShowEditForm(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ✏️ Edit Property
        </button>
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

      {/* Edit Form */}
      {showEditForm && (
        <>
          {/* Modal Backdrop */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '32px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '20px' : '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e5e7eb',
              width: '100%',
              maxWidth: isMobile ? '100%' : '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={resetForm}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f3f4f6',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                ×
              </button>

              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px',
                paddingRight: '40px'
              }}>
                ✏️ Edit Property Details
              </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                placeholder="e.g., Malibu Mansion, Ron's Restaurant"
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

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '20px' 
            }}>
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

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    background: 'white',
                    color: '#374151',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Update Property
                </button>
              </div>
            </form>
            </div>
          </div>
        </>
      )}

      {/* Property Details */}
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '20px' : '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          📋 Property Information
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: isMobile ? '16px' : '24px'
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              🏢 Property Name
            </h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              {property.name}
            </p>

            {property.description && (
              <>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  📝 Description
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {property.description}
                </p>
              </>
            )}
          </div>

          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              📊 Statistics
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <strong>👥 Users:</strong> {property._count.users}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <strong>📦 Items:</strong> {property._count.items}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <strong>📅 Created:</strong> {new Date(property.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {(property.address || property.contactEmail || property.contactPhone) && (
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px'
            }}>
              📞 Contact Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {property.address && (
                <div>
                  <strong style={{ color: '#374151' }}>📍 Address:</strong>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{property.address}</p>
                </div>
              )}
              {property.contactEmail && (
                <div>
                  <strong style={{ color: '#374151' }}>📧 Email:</strong>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{property.contactEmail}</p>
                </div>
              )}
              {property.contactPhone && (
                <div>
                  <strong style={{ color: '#374151' }}>📞 Phone:</strong>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{property.contactPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
