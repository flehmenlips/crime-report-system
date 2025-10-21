'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function PropertyManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  })

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load user and property data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUser(userData.user)
          
          if (userData.user.role !== 'property_owner') {
            router.push('/unauthorized')
            return
          }
        } else {
          router.push('/login-simple')
          return
        }

        // Load property
        const propResponse = await fetch('/api/property/my-property')
        if (propResponse.ok) {
          const data = await propResponse.json()
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
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load property details')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/property/my-property', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setProperty(data.property)
        setSuccess(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to update property')
      }
    } catch (err) {
      setError('Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (property) {
      setFormData({
        name: property.name || '',
        description: property.description || '',
        address: property.address || '',
        contactEmail: property.contactEmail || '',
        contactPhone: property.contactPhone || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading property...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '24px' }}>🏢</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
            No Property Found
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            You need to set up your property first.
          </p>
          <button
            onClick={() => router.push('/property-onboarding')}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Set Up Property
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      paddingBottom: isMobile ? '0' : '48px'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px 32px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0 16px'
          }}>
            Manage Property
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Success Message */}
          {success && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '16px',
              margin: isMobile ? '16px' : '32px',
              color: '#059669'
            }}>
              ✓ Property updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              margin: isMobile ? '16px' : '32px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          {/* Property Information (View Mode) */}
          {!isEditing && (
            <div style={{
              padding: isMobile ? '24px 16px 100px' : '32px'
            }}>
              {/* Property Header */}
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                padding: isMobile ? '24px' : '32px',
                borderRadius: '16px',
                color: 'white',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: isMobile ? '24px' : '32px',
                  fontWeight: '700',
                  margin: '0 0 8px 0'
                }}>
                  {property.name}
                </h2>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0',
                  opacity: 0.9
                }}>
                  {property.description || 'No description provided'}
                </p>
              </div>

              {/* Property Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Users</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
                    {property._count.users}
                  </div>
                </div>
                <div style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Items</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
                    {property._count.items}
                  </div>
                </div>
                <div style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  gridColumn: isMobile ? 'span 2' : 'auto'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Created</div>
                  <div style={{ fontSize: isMobile ? '16px' : '28px', fontWeight: '700', color: '#8b5cf6' }}>
                    {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{
                background: '#f9fafb',
                padding: isMobile ? '20px' : '24px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  📍 Property Details
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                      Address
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {property.address || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                      Contact Email
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {property.contactEmail || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                      Contact Phone
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {property.contactPhone || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                ✏️ Edit Property Details
              </button>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div style={{
              padding: isMobile ? '24px 16px 140px' : '32px'
            }}>
              <h2 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '24px'
              }}>
                ✏️ Edit Property Details
              </h2>

              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
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
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
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
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit'
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
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box'
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
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
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
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexDirection: isMobile ? 'column' : 'row',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    style={{
                      padding: '14px 24px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#374151',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      flex: isMobile ? 'none' : 1,
                      opacity: saving ? 0.5 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '14px 24px',
                      background: saving ? 'rgba(139, 92, 246, 0.7)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      flex: isMobile ? 'none' : 2,
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
