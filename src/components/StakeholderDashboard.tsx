'use client'

import { useState, useEffect } from 'react'
import { StolenItem, User, Role } from '@/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { ItemDetailView } from './ItemDetailView'
import { AdvancedSearch } from './AdvancedSearch'
import { GenerateReport } from './GenerateReport'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { UserProfile } from './UserProfile'
import { getRoleDisplayName, getDashboardTitle } from '@/lib/auth'

interface StakeholderDashboardProps {
  user: User
  items: StolenItem[]
  onItemsUpdate?: (items: StolenItem[]) => void
}

export function StakeholderDashboard({ user, items, onItemsUpdate }: StakeholderDashboardProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [detailViewItem, setDetailViewItem] = useState<StolenItem | null>(null)
  const [filteredItems, setFilteredItems] = useState<StolenItem[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Role-based access controls
  const canReadAll = () => user.role === 'law_enforcement' || user.role === 'insurance_agent' || user.role === 'banker'
  const canWriteAll = () => user.role === 'law_enforcement' || user.role === 'insurance_agent'
  const canGenerateReports = () => ['law_enforcement', 'insurance_agent', 'banker', 'asset_manager'].includes(user.role)
  const canAddNotes = () => ['law_enforcement', 'insurance_agent', 'broker', 'banker', 'asset_manager'].includes(user.role)
  const canExportData = () => ['law_enforcement', 'insurance_agent', 'banker'].includes(user.role)

  // Get role-specific dashboard configuration
  const getRoleConfig = () => {
    switch (user.role) {
      case 'law_enforcement':
        return {
          icon: '🚔',
          color: 'from-red-500 to-red-700',
          bgGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          title: 'Law Enforcement Portal',
          subtitle: 'Investigation interface for stolen items case',
          canEdit: true,
          canDelete: true,
          canUpload: true
        }
      case 'insurance_agent':
        return {
          icon: '🏢',
          color: 'from-green-500 to-green-700',
          bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          title: 'Insurance Agent Portal',
          subtitle: 'Claims assessment and investigation tools',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'broker':
        return {
          icon: '🤝',
          color: 'from-purple-500 to-purple-700',
          bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          title: 'Equipment Broker Portal',
          subtitle: 'Asset valuation and market analysis',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'banker':
        return {
          icon: '🏦',
          color: 'from-yellow-500 to-yellow-700',
          bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          title: 'Banking Portal',
          subtitle: 'Loan collateral assessment and risk analysis',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'asset_manager':
        return {
          icon: '📊',
          color: 'from-teal-500 to-teal-700',
          bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          title: 'Asset Management Portal',
          subtitle: 'Portfolio analysis and recovery tracking',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'assistant':
      case 'secretary':
      case 'executive_assistant':
        return {
          icon: '👤',
          color: 'from-gray-500 to-gray-700',
          bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          title: 'Assistant Portal',
          subtitle: 'Support access for case management',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      case 'manager':
        return {
          icon: '👔',
          color: 'from-orange-500 to-orange-700',
          bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          title: 'Management Portal',
          subtitle: 'Oversight and coordination tools',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
      default:
        return {
          icon: '👤',
          color: 'from-gray-500 to-gray-700',
          bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          title: 'Stakeholder Portal',
          subtitle: 'Access to case information',
          canEdit: false,
          canDelete: false,
          canUpload: false
        }
    }
  }

  const roleConfig = getRoleConfig()
  const displayItems = isFiltered ? filteredItems : items
  const evidenceCount = items.reduce((total, item) => 
    total + (item.evidence?.filter(e => e.type === 'photo')?.length || 0) + 
    (item.evidence?.filter(e => e.type === 'video')?.length || 0) + 
    (item.evidence?.filter(e => e.type === 'document')?.length || 0), 0
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: 'white'
    }}>
      {/* Role-Specific Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        margin: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        position: 'sticky',
        top: '24px',
        zIndex: 50
      }}>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: roleConfig.bgGradient,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                fontSize: '24px'
              }}>
                {roleConfig.icon}
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  margin: 0,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {roleConfig.title}
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '500' }}>
                  {roleConfig.subtitle}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserProfile showDetails={true} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Role-Specific Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: roleConfig.bgGradient,
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {items.length}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Stolen Items</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {formatCurrency(items.reduce((sum, item) => sum + item.estimatedValue, 0))}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Value</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {evidenceCount}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Evidence Files</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              {items.filter(item => item.evidence?.filter(e => e.type === 'photo')?.length > 0).length}
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Items w/ Photos</div>
          </div>
        </div>

        {/* Role-Specific Tools */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              {getRoleDisplayName(user.role)} Tools
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowAdvancedSearch(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔍 Advanced Search
              </button>
              
              {canGenerateReports() && (
                <button 
                  onClick={() => setShowGenerateReport(true)}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📄 Generate Report
                </button>
              )}
              
              <button 
                onClick={() => setShowAnalytics(true)}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📊 Analytics
              </button>
              
              {canExportData() && (
                <button 
                  onClick={() => alert('Export functionality coming soon!')}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📊 Export Data
                </button>
              )}
            </div>
          </div>
          
          {/* Role-Specific Tool Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {/* Advanced Search - Available to all */}
            <button 
              onClick={() => setShowAdvancedSearch(true)}
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Advanced Search</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Filter by multiple criteria</div>
            </button>
            
            {/* Analytics - Available to all */}
            <button 
              onClick={() => setShowAnalytics(true)}
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Analytics</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Value and trend analysis</div>
            </button>
            
            {/* Role-specific tools */}
            {user.role === 'law_enforcement' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Case Summary</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Generate case overview</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏷️</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Evidence Tags</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Organize by categories</div>
                </button>
              </>
            )}
            
            {user.role === 'insurance_agent' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>💰</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Claims Assessment</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Evaluate claim values</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Claims Report</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Generate claim documentation</div>
                </button>
              </>
            )}
            
            {user.role === 'banker' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏦</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Collateral Assessment</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Evaluate loan collateral</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Risk Analysis</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Assess financial risk</div>
                </button>
              </>
            )}
            
            {user.role === 'asset_manager' && (
              <>
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📈</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Portfolio Analysis</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Track asset recovery</div>
                </button>
                
                <button style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Recovery Tracking</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Monitor recovery progress</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Professional Evidence Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              Evidence Database
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {getRoleDisplayName(user.role)} view • {displayItems.length} items catalogued
              {isFiltered && (
                <button
                  onClick={() => {
                    setIsFiltered(false)
                    setFilteredItems([])
                  }}
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginLeft: '12px'
                  }}
                >
                  Clear Filter
                </button>
              )}
            </p>
          </div>

          {displayItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                No evidence items found
              </h3>
              <p style={{ color: '#6b7280' }}>
                {user.role === 'law_enforcement' 
                  ? 'Waiting for property owner to document stolen items'
                  : 'No items available for your access level'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Item</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Description</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Serial #</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Value</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Evidence</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Last Seen</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, index) => (
                    <tr key={item.id} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      background: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: 'white'
                          }}>
                            📦
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              ID: {item.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', maxWidth: '200px' }}>
                        <div style={{ color: '#374151', lineHeight: '1.4' }}>
                          {item.description.length > 80 
                            ? `${item.description.substring(0, 80)}...`
                            : item.description
                          }
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {item.serialNumber ? (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: 'monospace'
                          }}>
                            {item.serialNumber}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700', color: '#059669', fontSize: '16px' }}>
                          {formatCurrency(item.estimatedValue)}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.evidence?.filter(e => e.type === 'photo')?.length > 0 && (
                            <span style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📷 {item.evidence.filter(e => e.type === 'photo').length}
                            </span>
                          )}
                          {item.evidence?.filter(e => e.type === 'video')?.length > 0 && (
                            <span style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              🎥 {item.evidence.filter(e => e.type === 'video').length}
                            </span>
                          )}
                          {item.evidence?.filter(e => e.type === 'document')?.length > 0 && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📄 {item.evidence.filter(e => e.type === 'document').length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#374151', fontSize: '13px' }}>
                          {formatDate(item.dateLastSeen)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                          {item.locationLastSeen}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => {
                            setDetailViewItem(item)
                            setShowDetailView(true)
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailView && detailViewItem && (
          <ItemDetailView
            item={detailViewItem}
            onClose={() => {
              setShowDetailView(false)
              setDetailViewItem(null)
            }}
            onEdit={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              if (!roleConfig.canEdit) {
                alert(`⚠️ ${getRoleDisplayName(user.role)} users have read-only access. Please contact the property owner for edits.`)
              }
            }}
            onDelete={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              if (!roleConfig.canDelete) {
                alert(`⚠️ ${getRoleDisplayName(user.role)} users have read-only access. Please contact the property owner for deletions.`)
              }
            }}
            onDuplicate={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              alert(`⚠️ ${getRoleDisplayName(user.role)} users have read-only access. Please contact the property owner for item management.`)
            }}
            onUploadEvidence={(item) => {
              setShowDetailView(false)
              setDetailViewItem(null)
              if (!roleConfig.canUpload) {
                alert(`⚠️ ${getRoleDisplayName(user.role)} users have read-only access. Please contact the property owner to add evidence.`)
              }
            }}
          />
        )}

        {showAdvancedSearch && (
          <AdvancedSearch
            items={items}
            onClose={() => setShowAdvancedSearch(false)}
            onResults={(results) => {
              setFilteredItems(results)
              setIsFiltered(true)
              setShowAdvancedSearch(false)
            }}
          />
        )}

        {showGenerateReport && (
          <GenerateReport
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowGenerateReport(false)}
          />
        )}

        {showAnalytics && (
          <AnalyticsDashboard
            items={isFiltered ? filteredItems : items}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>
    </div>
  )
}
