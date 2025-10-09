'use client'

import { useState, useEffect, useRef } from 'react'
import { StolenItem, User, Evidence } from '@/types'
import { generateEvidenceTagsPDF, EvidenceTagsData } from '@/lib/pdf-export'

interface EvidenceTagsProps {
  user: User
  items: StolenItem[]
  onClose: () => void
}

interface TagCategory {
  id: string
  name: string
  color: string
  description: string
  items: StolenItem[]
}

interface EvidenceWithTags extends Evidence {
  itemId: number
  itemName: string
  tags?: string[]
}

export function EvidenceTags({ user, items, onClose }: EvidenceTagsProps) {
  const [exporting, setExporting] = useState(false)
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([
    {
      id: 'high-value',
      name: 'High Value',
      color: '#dc2626',
      description: 'Items over $5,000',
      items: []
    },
    {
      id: 'electronics',
      name: 'Electronics',
      color: '#7c3aed',
      description: 'Electronic devices and equipment',
      items: []
    },
    {
      id: 'tools',
      name: 'Tools',
      color: '#059669',
      description: 'Tools and equipment',
      items: []
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      color: '#d97706',
      description: 'Vehicles and transportation',
      items: []
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      color: '#db2777',
      description: 'Jewelry and valuables',
      items: []
    },
    {
      id: 'documents',
      name: 'Documents',
      color: '#0891b2',
      description: 'Important documents and papers',
      items: []
    }
  ])
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [evidenceItems, setEvidenceItems] = useState<EvidenceWithTags[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const organizeEvidence = () => {
      if (!items || items.length === 0) {
        setLoading(false)
        return
      }

      // Collect all evidence with item context
      const allEvidence: EvidenceWithTags[] = []
      items.forEach(item => {
        if (item.evidence && item.evidence.length > 0) {
          item.evidence.forEach(evidence => {
            allEvidence.push({
              ...evidence,
              itemId: item.id,
              itemName: item.name
            })
          })
        }
      })

      // Auto-categorize items based on value, category, and name
      const categorizedItems = tagCategories.map(category => ({
        ...category,
        items: items.filter(item => {
          switch (category.id) {
            case 'high-value':
              return item.estimatedValue >= 5000
            case 'electronics':
              return item.category?.toLowerCase().includes('electronic') ||
                     item.category?.toLowerCase().includes('computer') ||
                     item.category?.toLowerCase().includes('phone') ||
                     item.name.toLowerCase().includes('laptop') ||
                     item.name.toLowerCase().includes('phone') ||
                     item.name.toLowerCase().includes('computer') ||
                     item.name.toLowerCase().includes('tv') ||
                     item.name.toLowerCase().includes('camera')
            case 'tools':
              return item.category?.toLowerCase().includes('tool') ||
                     item.name.toLowerCase().includes('tool') ||
                     item.name.toLowerCase().includes('equipment') ||
                     item.name.toLowerCase().includes('saw') ||
                     item.name.toLowerCase().includes('drill')
            case 'vehicles':
              return item.category?.toLowerCase().includes('vehicle') ||
                     item.category?.toLowerCase().includes('car') ||
                     item.name.toLowerCase().includes('car') ||
                     item.name.toLowerCase().includes('truck') ||
                     item.name.toLowerCase().includes('vehicle') ||
                     item.name.toLowerCase().includes('motorcycle')
            case 'jewelry':
              return item.category?.toLowerCase().includes('jewelry') ||
                     item.name.toLowerCase().includes('ring') ||
                     item.name.toLowerCase().includes('necklace') ||
                     item.name.toLowerCase().includes('watch') ||
                     item.name.toLowerCase().includes('jewelry')
            case 'documents':
              return item.category?.toLowerCase().includes('document') ||
                     item.name.toLowerCase().includes('document') ||
                     item.name.toLowerCase().includes('certificate') ||
                     item.name.toLowerCase().includes('title')
            default:
              return false
          }
        })
      }))

      setTagCategories(categorizedItems)
      setEvidenceItems(allEvidence)
      setLoading(false)
    }

    organizeEvidence()
  }, [items])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const pdfData: EvidenceTagsData = {
        tagCategories: tagCategories.map(category => ({
          id: category.id,
          name: category.name,
          color: category.color,
          description: category.description,
          items: category.items.map(item => ({
            id: item.id,
            name: item.name,
            estimatedValue: item.estimatedValue,
            category: item.category,
            description: item.description,
            dateLastSeen: item.dateLastSeen,
            evidence: item.evidence?.map(evidence => ({
              type: evidence.type,
              filename: evidence.originalName
            }))
          }))
        })),
        totalItems: items.length,
        totalEvidence: evidenceItems.length,
        generatedBy: user.name,
        generatedAt: new Date().toLocaleString(),
        caseName: 'kenfeld-farm-case'
      }
      
      await generateEvidenceTagsPDF(pdfData)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>🏷️</div>
          <div>Organizing evidence by categories...</div>
        </div>
      </div>
    )
  }

  const selectedCategoryData = tagCategories.find(cat => cat.id === selectedCategory)

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>🏷️ Evidence Tags</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Organize evidence by categories and tags</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden'
        }}>
          {/* Categories Sidebar */}
          <div style={{
            width: '300px',
            borderRight: '1px solid #e2e8f0',
            overflow: 'auto',
            background: '#f8fafc'
          }}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '16px' }}>Categories</h3>
              
              {tagCategories.map(category => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedCategory === category.id ? 'white' : 'transparent',
                    border: selectedCategory === category.id ? `2px solid ${category.color}` : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      marginRight: '8px'
                    }}></div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {category.name}
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      background: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {category.items.length}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {category.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <div style={{ padding: '24px' }}>
              {selectedCategoryData ? (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px' }}>
                      {selectedCategoryData.name} ({selectedCategoryData.items.length} items)
                    </h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      {selectedCategoryData.description}
                    </p>
                  </div>

                  {selectedCategoryData.items.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gap: '16px'
                    }}>
                      {selectedCategoryData.items.map(item => (
                        <div key={item.id} style={{
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ 
                                margin: '0 0 4px 0', 
                                fontSize: '16px', 
                                fontWeight: '600',
                                color: '#1f2937'
                              }}>
                                {item.name}
                              </h4>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                {item.category || 'Uncategorized'} • {item.dateLastSeen}
                              </div>
                              <div style={{ fontSize: '14px', color: '#374151' }}>
                                {item.description}
                              </div>
                            </div>
                            <div style={{
                              background: selectedCategoryData.color,
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginLeft: '12px'
                            }}>
                              ${item.estimatedValue.toLocaleString()}
                            </div>
                          </div>

                          {/* Evidence for this item */}
                          {item.evidence && item.evidence.length > 0 && (
                            <div style={{
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '12px'
                            }}>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                Evidence ({item.evidence.length} files):
                              </div>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px'
                              }}>
                                {item.evidence.map((evidence, index) => (
                                  <div key={index} style={{
                                    background: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    color: '#374151',
                                    textTransform: 'capitalize'
                                  }}>
                                    {evidence.type}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>No items in this category</div>
                      <div style={{ fontSize: '14px' }}>Items will be automatically categorized based on their details</div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>Select a category to view items</div>
                  <div style={{ fontSize: '14px' }}>Choose from the categories on the left to organize evidence</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Total evidence files: {evidenceItems.length} • Auto-categorized items
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                padding: '8px 16px',
                backgroundColor: exporting ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                opacity: exporting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {exporting ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Generating...
                </>
              ) : (
                <>📊 Export PDF</>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
