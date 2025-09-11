'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SimpleFileUpload } from '@/components/SimpleFileUpload'
import { StolenItem } from '@/types'
import { getAllItems, getTotalValue, formatCurrency, formatDate, addItem } from '@/lib/data'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allItems, setAllItems] = useState<StolenItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSimpleUpload, setShowSimpleUpload] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StolenItem | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        const loadedItems = await getAllItems()
        const total = await getTotalValue()
        setAllItems(loadedItems)
        setTotalValue(total)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [session, status, router])

  const handleAddItem = async () => {
    const itemName = prompt('Enter item name:')
    if (!itemName) return

    const description = prompt('Enter item description:')
    if (!description) return

    const serialNumber = prompt('Enter serial number (optional):') || ''
    const purchaseDate = prompt('Enter purchase date (YYYY-MM-DD):')
    if (!purchaseDate) return

    const purchaseCost = prompt('Enter purchase cost:')
    if (!purchaseCost) return

    const dateLastSeen = prompt('Enter date last seen (YYYY-MM-DD):')
    if (!dateLastSeen) return

    const locationLastSeen = prompt('Enter location last seen:')
    if (!locationLastSeen) return

    const estimatedValue = prompt('Enter current estimated value:')
    if (!estimatedValue) return

    try {
      console.log('Starting item creation process...')
      const ownerId = 'cmfeyn7es0000t6oil8p6d45c'
      
      const itemData = {
        name: itemName,
        description,
        serialNumber,
        purchaseDate,
        purchaseCost: parseFloat(purchaseCost),
        dateLastSeen,
        locationLastSeen,
        estimatedValue: parseFloat(estimatedValue)
      }
      
      console.log('Item data prepared:', itemData)
      console.log('Using owner ID:', ownerId)
      
      const newItem = await addItem(itemData, ownerId)
      
      if (newItem) {
        console.log('Item created successfully:', newItem)
        setAllItems(prev => [...prev, newItem])
        setTotalValue(prev => prev + newItem.estimatedValue)
        alert(`✅ Item "${newItem.name}" added successfully to database!`)
        
        // Reload data to ensure consistency
        console.log('Reloading items from database...')
        const updatedItems = await getAllItems()
        setAllItems(updatedItems)
        console.log('Data reloaded, new total:', updatedItems.length)
      } else {
        console.error('addItem returned null')
        alert('❌ Error: Failed to create item in database')
      }
    } catch (error) {
      console.error('Error in handleAddItem:', error)
      alert(`❌ Error adding item: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Loading Your Portal</h2>
          <p style={{ opacity: 0.8 }}>Preparing your stolen property database...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role || 'law_enforcement'
  const evidenceCount = allItems.reduce((total, item) => total + item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length, 0)

  if (userRole === 'citizen') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        color: 'white'
      }}>
        {/* Modern Header */}
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                  fontSize: '24px'
                }}>
                  🏠
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
                    Property Owner Portal
                  </h1>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '500' }}>
                    Birkenfeld Farm Theft • Case #2023-12020
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }}>
          {/* Hero Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px', 
            marginBottom: '64px' 
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #be185d 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(239, 68, 68, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {allItems.length}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Items Stolen</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px' }}>From your property</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(16, 185, 129, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '56px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {formatCurrency(totalValue)}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Total Loss</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px' }}>Insurance claim value</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 32px 64px rgba(59, 130, 246, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
                {evidenceCount}
              </div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '600' }}>Evidence Files</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', marginTop: '8px' }}>Photos, videos, documents</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '64px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>
                Manage Your Property
              </h2>
              <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Professional tools for documenting and organizing your stolen property case
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px' 
            }}>
              <button
                onClick={handleAddItem}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '18px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)'
                }}
              >
                <span style={{ fontSize: '20px' }}>➕</span>
                Add New Item
              </button>
              
              <button style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '20px 32px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                Bulk Upload
              </button>
              
              <button style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '20px 32px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>🔍</span>
                Advanced Search
              </button>
              
              <button style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '20px 32px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                Generate Report
              </button>
            </div>
          </div>

          {/* Modern Item Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>
                Your Stolen Items
              </h2>
              <p style={{ fontSize: '20px', color: '#6b7280' }}>
                {allItems.length} items documented • {formatCurrency(totalValue)} total value
              </p>
            </div>

            {allItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{
                  width: '128px',
                  height: '128px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 32px',
                  fontSize: '64px',
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                }}>
                  📦
                </div>
                <h3 style={{ fontSize: '36px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  No items documented yet
                </h3>
                <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                  Start building your professional stolen property database for law enforcement
                </p>
                <button
                  onClick={handleAddItem}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '18px',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '32px' 
              }}>
                {allItems.map((item) => (
                  <div key={item.id} style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.4s ease',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 32px 64px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'
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
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                        fontSize: '24px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                          {item.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>ID: {item.id}</p>
                      </div>
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '24px',
                      right: '24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>
                      {formatCurrency(item.estimatedValue)}
                    </div>

                    <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                      {item.evidence.photos.length > 0 && (
                        <div style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          📷 {item.evidence.photos.length}
                        </div>
                      )}
                      {item.evidence.videos.length > 0 && (
                        <div style={{
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          🎥 {item.evidence.videos.length}
                        </div>
                      )}
                      {item.evidence.documents.length > 0 && (
                        <div style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          📄 {item.evidence.documents.length}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button
                        onClick={() => {
                          setSelectedItem(item)
                          setShowSimpleUpload(true)
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '16px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        📸 Upload Evidence
                      </button>
                      
                      <button
                        onClick={() => {
                          const evidenceCount = item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length
                          alert(`Evidence for: ${item.name}\n\n📷 Photos: ${item.evidence.photos.length}\n🎥 Videos: ${item.evidence.videos.length}\n📄 Documents: ${item.evidence.documents.length}\n\nTotal: ${evidenceCount} files`)
                        }}
                        style={{
                          background: 'rgba(0, 0, 0, 0.05)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          color: '#374151',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '16px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        👁️ View Evidence ({item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Modal */}
          {showSimpleUpload && selectedItem && (
            <SimpleFileUpload
              item={selectedItem}
              onClose={() => {
                setShowSimpleUpload(false)
                setSelectedItem(null)
              }}
              onSuccess={async () => {
                const updatedItems = await getAllItems()
                setAllItems(updatedItems)
                setShowSimpleUpload(false)
                setSelectedItem(null)
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // Law enforcement interface
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 100%)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: 'white',
      padding: '24px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>
          Law Enforcement Portal
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.8 }}>
          Investigation interface for stolen items case
        </p>
      </div>
    </div>
  )
}