'use client'

import { useState } from 'react'
import { StolenItem } from '@/types'
import { FileUpload } from './FileUpload'

interface EvidenceManagerProps {
  item: StolenItem
  onClose: () => void
  onUpdate: (item: StolenItem) => void
}

export function EvidenceManager({ item, onClose, onUpdate }: EvidenceManagerProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents'>('photos')
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (files: File[]) => {
    setUploading(true)
    try {
      // Simulate Cloudinary upload
      const uploadedFiles = files.map(file => {
        const publicId = `evidence/${item.id}/${activeTab}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        return publicId
      })

      // Update item evidence
      const updatedItem = {
        ...item,
        evidence: {
          ...item.evidence,
          [activeTab]: [...item.evidence[activeTab], ...uploadedFiles]
        }
      }

      onUpdate(updatedItem)
      console.log(`Uploaded ${files.length} ${activeTab} files for item:`, item.name)
      
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeEvidence = (type: 'photos' | 'videos' | 'documents', index: number) => {
    const updatedItem = {
      ...item,
      evidence: {
        ...item.evidence,
        [type]: item.evidence[type].filter((_, i) => i !== index)
      }
    }
    onUpdate(updatedItem)
  }

  const getFileIcon = (type: 'photos' | 'videos' | 'documents') => {
    switch (type) {
      case 'photos': return '📷'
      case 'videos': return '🎥'
      case 'documents': return '📄'
    }
  }

  const tabs = [
    { key: 'photos' as const, label: 'Photos', count: item.evidence.photos.length },
    { key: 'videos' as const, label: 'Videos', count: item.evidence.videos.length },
    { key: 'documents' as const, label: 'Documents', count: item.evidence.documents.length }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Manage Evidence</h2>
              <p className="text-blue-100 text-sm">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {getFileIcon(tab.key)} {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div>
                <FileUpload
                  onUpload={handleFileUpload}
                  acceptedTypes={
                    activeTab === 'photos' ? 'image/*' :
                    activeTab === 'videos' ? 'video/*' :
                    '.pdf,.doc,.docx,.txt'
                  }
                  title={`Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                />
              </div>

              {/* Existing Files */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({item.evidence[activeTab].length})
                </h3>
                
                {item.evidence[activeTab].length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">{getFileIcon(activeTab)}</div>
                    <p>No {activeTab} uploaded yet</p>
                    <p className="text-sm">Upload files using the area on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {item.evidence[activeTab].map((fileId, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getFileIcon(activeTab)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {fileId.split('/').pop()?.replace(/_/g, ' ') || `${activeTab.slice(0, -1)} ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">Cloudinary ID: {fileId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // In real app, this would open the file
                              console.log('View file:', fileId)
                              alert('In a real app, this would open the file for viewing')
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => removeEvidence(activeTab, index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total evidence files: {item.evidence.photos.length + item.evidence.videos.length + item.evidence.documents.length}
              </div>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
