'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
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

  const handleAddItem = async (formData: any) => {
    try {
      console.log('Adding item...')
      const ownerId = 'cmfeyn7es0000t6oil8p6d45c'
      const newItem = await addItem(formData, ownerId)
      
      if (newItem) {
        setAllItems(prev => [...prev, newItem])
        setTotalValue(prev => prev + newItem.estimatedValue)
        alert('✅ Item added successfully to database!')
        
        const updatedItems = await getAllItems()
        setAllItems(updatedItems)
      } else {
        alert('❌ Error: API returned null')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert(`❌ Error adding item: ${error}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="floating inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl mb-6">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Loading Your Portal</h2>
          <p className="text-white/80 text-lg">Preparing your stolen property database...</p>
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
      <div className="min-h-screen animated-gradient">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div className="floating inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl mb-6">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-2xl mb-4">
              Property Owner Portal
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Professional documentation system for your stolen property case
            </p>
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 pulse-soft"></span>
              Birkenfeld Farm Theft • Case #2023-12020
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card-gradient group">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8 text-center">
                <div className="text-5xl font-bold text-white mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {allItems.length}
                </div>
                <div className="text-white font-semibold text-lg">Items Stolen</div>
                <div className="text-white/80 text-sm mt-2">From your property</div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            </div>
            
            <div className="card-gradient group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-white font-semibold text-lg">Total Loss</div>
                <div className="text-white/80 text-sm mt-2">Insurance claim value</div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            </div>
            
            <div className="card-gradient group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center">
                <div className="text-5xl font-bold text-white mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {evidenceCount}
                </div>
                <div className="text-white font-semibold text-lg">Evidence Files</div>
                <div className="text-white/80 text-sm mt-2">Photos, videos, documents</div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-modern p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Manage Your Property</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Professional tools for documenting and organizing your stolen property case
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  const itemName = prompt('Enter item name:')
                  if (itemName) {
                    const description = prompt('Enter item description:')
                    const serialNumber = prompt('Enter serial number (optional):')
                    const purchaseDate = prompt('Enter purchase date (YYYY-MM-DD):')
                    const purchaseCost = prompt('Enter purchase cost:')
                    const dateLastSeen = prompt('Enter date last seen (YYYY-MM-DD):')
                    const locationLastSeen = prompt('Enter location last seen:')
                    const estimatedValue = prompt('Enter current estimated value:')
                    
                    if (itemName && description && purchaseDate && purchaseCost && dateLastSeen && locationLastSeen && estimatedValue) {
                      handleAddItem({
                        name: itemName,
                        description,
                        serialNumber: serialNumber || '',
                        purchaseDate,
                        purchaseCost: parseFloat(purchaseCost),
                        dateLastSeen,
                        locationLastSeen,
                        estimatedValue: parseFloat(estimatedValue)
                      })
                    }
                  }
                }}
                className="btn-primary group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Item
              </button>
              
              <button className="btn-success group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload
              </button>
              
              <button className="btn-warning group">
                <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Advanced Search
              </button>
              
              <button className="btn-danger group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>

          {/* Modern Item Grid */}
          <div className="card-modern p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Stolen Items</h2>
                <p className="text-gray-600 text-lg">
                  {allItems.length} items • Total value {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="badge-modern bg-blue-100 text-blue-800">
                  {allItems.length} Items
                </span>
                <span className="badge-modern bg-green-100 text-green-800">
                  Active Case
                </span>
              </div>
            </div>

            {allItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="floating inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No items documented yet</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Start building your professional stolen property database
                </p>
                <button className="btn-primary">Get Started</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {allItems.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="card-modern p-6 overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-gray-500 text-sm">ID: {item.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-lg">{formatCurrency(item.estimatedValue)}</span>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>

                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowSimpleUpload(true)
                          }}
                          className="w-full btn-primary"
                        >
                          📸 Upload Evidence
                        </button>
                        
                        <button
                          onClick={() => {
                            const evidenceCount = item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length
                            alert(`Evidence for: ${item.name}\n\n📷 Photos: ${item.evidence.photos.length}\n🎥 Videos: ${item.evidence.videos.length}\n📄 Documents: ${item.evidence.documents.length}\n\nTotal: ${evidenceCount} files`)
                          }}
                          className="w-full btn-secondary"
                        >
                          👁️ View Evidence ({item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simple File Upload Modal */}
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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Law Enforcement Portal</h1>
        <p className="text-gray-600 text-lg">Investigation interface for stolen items case</p>
      </div>
    </div>
  )
}
