'use client'

import React, { useState, useEffect } from 'react'

interface Tenant {
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

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants || [])
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTenant ? `/api/tenants/${editingTenant.id}` : '/api/tenants'
      const method = editingTenant ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingTenant ? '✅ Tenant updated successfully!' : '✅ Tenant created successfully!')
        loadTenants()
        resetForm()
      } else {
        const result = await response.json()
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Failed to save tenant')
    }
  }

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${tenantName}"? This action cannot be undone and will remove all associated users and items.`)) {
      return
    }

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Tenant deleted successfully!')
        loadTenants()
      } else {
        const result = await response.json()
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Failed to delete tenant')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      contactEmail: '',
      contactPhone: ''
    })
    setEditingTenant(null)
    setShowCreateForm(false)
  }

  const startEdit = (tenant: Tenant) => {
    setFormData({
      name: tenant.name,
      description: tenant.description,
      address: tenant.address,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone
    })
    setEditingTenant(tenant)
    setShowCreateForm(true)
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
        Loading tenants...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            🏢 Tenant Management
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Manage properties and their associated users and assets
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
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
          ➕ Create New Tenant
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            {editingTenant ? '✏️ Edit Tenant' : '➕ Create New Tenant'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                  placeholder="e.g., Birkenfeld Farm, Smith Ranch"
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
                placeholder="Brief description of the property, business type, or purpose"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'p1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                  color: '#374151'
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
                  border: 'none'
                }}
              >
                {editingTenant ? 'Update Tenant' : 'Create Tenant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          📋 Active Tenants ({tenants.length})
        </h2>

        {tenants.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No tenants found</p>
            <p>Create your first tenant property to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  background: '#f9fafb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      🏢 {tenant.name}
                    </h3>
                    {tenant.description && (
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}>
                        {tenant.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(tenant)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: 'white',
                        color: '#374151'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id, tenant.name)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: 'white',
                        color: '#ef4444'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div>
                    <strong>👥 Users:</strong> {tenant._count.users}
                  </div>
                  <div>
                    <strong>📦 Items:</strong> {tenant._count.items}
                  </div>
                  {tenant.address && (
                    <div>
                      <strong>📍 Address:</strong> {tenant.address}
                    </div>
                  )}
                  {tenant.contactEmail && (
                    <div>
                      <strong>📧 Email:</strong> {tenant.contactEmail}
                    </div>
                  )}
                  {tenant.contactPhone && (
                    <div>
                      <strong>📞 Phone:</strong> {tenant.contactPhone}
                    </div>
                  )}
                  <div>
                    <strong>📅 Created:</strong> {new Date(tenant.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
