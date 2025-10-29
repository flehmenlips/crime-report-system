'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { User } from '@/types'
import { CasePermissions } from './CasePermissions'

interface CaseDetailsViewProps {
  user: User
  caseId?: string | null
  onClose: () => void
  onEdit?: (caseId: string) => void
  onManagePermissions?: (caseId: string) => void
}

interface CaseDetailsData {
  id: string
  caseName: string
  caseNumber?: string
  dateReported: string
  dateOccurred: string
  location: string
  status: string
  priority: string
  assignedOfficer?: string
  description: string
  timeline: any[]
  suspects: any[]
  caseEvidence: any[]
  updates: any[]
  createdBy: string
  createdByName: string
  createdByRole: string
  createdAt: string
  updatedAt: string
}

export function CaseDetailsView({ user, caseId, onClose, onEdit, onManagePermissions }: CaseDetailsViewProps) {
  console.log('🔴 CaseDetailsView COMPONENT RENDERED', { 
    caseId, 
    userId: user?.id, 
    tenantId: user?.tenant?.id,
    userRole: user?.role,
    hasUser: !!user,
    hasTenant: !!user?.tenant
  })
  
  const [caseDetails, setCaseDetails] = useState<CaseDetailsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'suspects' | 'evidence' | 'updates'>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)
  
  console.log('🔴 CaseDetailsView state initialized', { loading, error, hasCaseDetails: !!caseDetails })

  // Check if user can edit this case
  const canEdit = caseDetails && (
    user.role === 'property_owner' && caseDetails.createdBy === user.id ||
    user.role === 'law_enforcement' ||
    user.role === 'super_admin'
  )

  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadFirstCase = useCallback(async () => {
    try {
      setError(null)
      
      const tenantId = user.tenant?.id
      const userId = user.id
      
      console.log('🔍 Loading first case details:', { tenantId, userId })
      
      if (!tenantId) {
        throw new Error('Tenant ID is required but missing')
      }
      
      if (!userId) {
        throw new Error('User ID is required but missing')
      }
      
      const apiUrl = `/api/case-details?tenantId=${tenantId}&userId=${userId}`
      console.log('📡 Fetching from:', apiUrl)
      
      const fetchStartTime = Date.now()
      const response = await fetch(apiUrl)
      const fetchDuration = Date.now() - fetchStartTime
      
      console.log(`⏱️ API call completed in ${fetchDuration}ms, status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API error response:', { status: response.status, statusText: response.statusText, body: errorText })
        throw new Error(`Failed to load case details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Received case details response:', { 
        caseCount: data.caseDetails?.length || 0,
        hasData: !!data.caseDetails,
        responseData: data
      })
      
      if (data.caseDetails && data.caseDetails.length > 0) {
        console.log('✅ Setting case details:', data.caseDetails[0].caseName)
        setCaseDetails(data.caseDetails[0])
      } else {
        console.warn('⚠️ No case details found in response - showing error state')
        setError('No case details found. Property owner should create a case report first.')
      }
    } catch (err) {
      console.error('❌ Error loading case details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load case details'
      console.error('Error details:', { errorMessage, error: err })
      setError(errorMessage)
    } finally {
      // Clear timeout since we're done loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      console.log('✅ Loading complete, setting loading to false')
      setLoading(false)
    }
  }, [user.tenant?.id, user.id])

  const loadCaseDetails = useCallback(async () => {
    try {
      setError(null)
      
      console.log('🔍 Loading specific case details:', { caseId, tenantId: user.tenant?.id, userId: user.id })
      
      const response = await fetch(`/api/case-details?tenantId=${user.tenant?.id}&userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load case details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📦 Received case details response:', { 
        caseCount: data.caseDetails?.length || 0,
        searchingFor: caseId
      })
      
      const foundCase = data.caseDetails.find((c: CaseDetailsData) => c.id === caseId)
      
      if (foundCase) {
        console.log('✅ Found case:', foundCase.caseName)
        setCaseDetails(foundCase)
      } else {
        console.warn('⚠️ Case not found:', caseId)
        setError('Case not found or you do not have permission to view it')
      }
    } catch (err) {
      console.error('❌ Error loading case details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load case details')
    } finally {
      // Clear timeout since we're done loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      setLoading(false)
    }
  }, [caseId, user.tenant?.id, user.id])

  useEffect(() => {
    // Reset states when component mounts or caseId/tenant changes
    console.log('🚀 CaseDetailsView useEffect triggered:', { 
      caseId, 
      tenantId: user.tenant?.id, 
      userId: user.id,
      userRole: user.role 
    })
    
    setLoading(true)
    setError(null)
    setCaseDetails(null)
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    // Validate required data before making API call
    if (!user.tenant?.id) {
      console.error('❌ CaseDetailsView: Missing tenantId', { user })
      setError('Property tenant information is missing. Please refresh the page.')
      setLoading(false)
      return
    }

    if (!user.id) {
      console.error('❌ CaseDetailsView: Missing userId', { user })
      setError('User information is missing. Please refresh the page.')
      setLoading(false)
      return
    }

    // Load case details
    if (caseId) {
      console.log('📞 Calling loadCaseDetails with caseId:', caseId)
      loadCaseDetails()
    } else {
      console.log('📞 Calling loadFirstCase (no caseId provided)')
      loadFirstCase()
    }
    
    // Set timeout to prevent infinite spinner (only if still loading after 10s)
    loadingTimeoutRef.current = setTimeout(() => {
      // Check loading state via a closure-safe check
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.error('⚠️ Case Details loading timeout after 10 seconds - API call may have failed silently')
          setError('Loading timeout. The request took too long. Please check your connection and try again.')
          return false
        }
        return currentLoading
      })
    }, 10000) // 10 second timeout
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [caseId, user.tenant?.id, loadCaseDetails, loadFirstCase]) // Include functions in dependencies

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3b82f6'
      case 'investigating': return '#f59e0b'
      case 'closed': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      case 'critical': return '#dc2626'
      default: return '#6b7280'
    }
  }

  // Show loading state
  if (loading) {
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
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Loading Case Details...
          </h3>
        </div>
      </div>
    )
  }

  // Only show error state after loading completes - prevents flashing
  if (error || !caseDetails) {
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
            padding: '48px',
            maxWidth: '500px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            {error || 'No Case Details Found'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            {user.role === 'property_owner' 
              ? 'You need to create a case report first. Click "Create Case Report" in your dashboard.'
              : 'The property owner needs to create a case report before you can view case details.'}
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
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
    )
  }

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
            maxWidth: '1200px',
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
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>
                  🏛️ Case Details
                </h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '18px' }}>
                  {caseDetails.caseName}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Show Manage Permissions button for property owners who created the case */}
                {user.role === 'property_owner' && caseDetails.createdBy === user.id && (
                  <button
                    onClick={() => setShowPermissions(true)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    🔐 Manage Permissions
                  </button>
                )}
                
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(caseDetails.id)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ✏️ Edit Case
                  </button>
                )}
              </div>
            </div>

            {/* Case Info Bar */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {caseDetails.caseNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ opacity: 0.8 }}>Case #:</span>
                  <span style={{ fontWeight: '600' }}>{caseDetails.caseNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.8 }}>Status:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: getStatusColor(caseDetails.status),
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {caseDetails.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.8 }}>Priority:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: getPriorityColor(caseDetails.priority),
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {caseDetails.priority.toUpperCase()}
                </span>
              </div>
              {caseDetails.assignedOfficer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ opacity: 0.8 }}>Officer:</span>
                  <span style={{ fontWeight: '600' }}>{caseDetails.assignedOfficer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 32px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', gap: '0' }}>
              {[
                { id: 'overview', label: '📋 Overview' },
                { id: 'timeline', label: '⏰ Timeline', count: caseDetails.timeline.length },
                { id: 'suspects', label: '👤 Suspects', count: caseDetails.suspects.length },
                { id: 'evidence', label: '🔍 Evidence', count: caseDetails.caseEvidence.length },
                { id: 'updates', label: '📝 Updates', count: caseDetails.updates.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                    borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span style={{
                      background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
                      color: activeTab === tab.id ? 'white' : '#6b7280',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Basic Information */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                    📋 Case Information
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Location
                      </label>
                      <p style={{ margin: 0, color: '#6b7280' }}>{caseDetails.location}</p>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Date Reported
                      </label>
                      <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(caseDetails.dateReported)}</p>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Date Occurred
                      </label>
                      <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(caseDetails.dateOccurred)}</p>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Reported By
                      </label>
                      <p style={{ margin: 0, color: '#6b7280' }}>{caseDetails.createdByName}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                    📝 Case Description
                  </h3>
                  
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#374151', 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {caseDetails.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {caseDetails.timeline.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No timeline events yet. {canEdit && 'Edit the case to add events.'}
                    </p>
                  </div>
                ) : (
                  caseDetails.timeline.map((event, index) => (
                    <div key={event.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '16px',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                              {event.event}
                            </h4>
                            <span style={{
                              background: '#f3f4f6',
                              color: '#6b7280',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {formatDate(event.date)} at {event.time}
                            </span>
                          </div>
                          
                          <p style={{ margin: '0 0 8px 0', color: '#374151', lineHeight: '1.5' }}>
                            {event.description}
                          </p>
                          
                          <span style={{
                            background: '#e5e7eb',
                            color: '#6b7280',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {event.createdByRole === 'property_owner' ? '👤' : '🚔'} {event.createdByName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'suspects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {caseDetails.suspects.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No suspects added yet. {canEdit && 'Edit the case to add suspects.'}
                    </p>
                  </div>
                ) : (
                  caseDetails.suspects.map((suspect) => (
                    <div key={suspect.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            {suspect.name}
                          </h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            {suspect.description}
                          </p>
                        </div>
                        
                        <span style={{
                          background: suspect.status === 'active' ? '#fee2e2' : suspect.status === 'cleared' ? '#dcfce7' : '#fef3c7',
                          color: suspect.status === 'active' ? '#991b1b' : suspect.status === 'cleared' ? '#166534' : '#92400e',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {suspect.status}
                        </span>
                      </div>
                      
                      {suspect.address && (
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Address: </span>
                          <span style={{ color: '#6b7280' }}>{suspect.address}</span>
                        </div>
                      )}
                      {suspect.phone && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Phone: </span>
                          <span style={{ color: '#6b7280' }}>{suspect.phone}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {caseDetails.caseEvidence.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No evidence documented yet. {canEdit && 'Edit the case to add evidence.'}
                    </p>
                  </div>
                ) : (
                  caseDetails.caseEvidence.map((evidence) => (
                    <div key={evidence.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            {evidence.type}
                          </h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            {evidence.description}
                          </p>
                        </div>
                        
                        <span style={{
                          background: '#e5e7eb',
                          color: '#6b7280',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {formatDate(evidence.dateCollected)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                        <div>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Location: </span>
                          <span style={{ color: '#6b7280' }}>{evidence.location}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Collected by: </span>
                          <span style={{ color: '#6b7280' }}>{evidence.collectedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'updates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {caseDetails.updates.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No updates yet. {canEdit && 'Edit the case to add updates.'}
                    </p>
                  </div>
                ) : (
                  caseDetails.updates.map((update) => (
                    <div key={update.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          background: update.createdByRole === 'property_owner' ? '#dbeafe' : '#fee2e2',
                          color: update.createdByRole === 'property_owner' ? '#1e40af' : '#991b1b',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{update.createdByRole === 'property_owner' ? '👤' : '🚔'}</span>
                          <span>{update.createdByName}</span>
                        </span>
                        
                        <span style={{
                          background: '#f3f4f6',
                          color: '#6b7280',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {formatDate(update.date)}
                        </span>
                      </div>
                      
                      <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
                        {update.update}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Last updated: {formatDateTime(caseDetails.updatedAt)}
              </div>
              
              <button
                onClick={onClose}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
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
        </div>
      </div>

      {/* Permissions Management Modal */}
      {showPermissions && caseDetails && (
        <CasePermissions
          caseId={caseDetails.id}
          user={user}
          onClose={() => setShowPermissions(false)}
        />
      )}
    </>
  )
}
