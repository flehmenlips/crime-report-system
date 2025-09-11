'use client'

import { useState, useRef } from 'react'
import { StolenItem } from '@/types'

interface EvidenceUploadProps {
  item: StolenItem
  onClose: () => void
  onSuccess: () => void
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  cloudinaryId?: string
  error?: string
}

export function EvidenceUpload({ item, onClose, onSuccess }: EvidenceUploadProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'documents'>('photos')
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptedTypes = () => {
    switch (activeTab) {
      case 'photos': return 'image/*'
      case 'videos': return 'video/*'
      case 'documents': return '.pdf,.doc,.docx,.txt,.rtf'
      default: return '*/*'
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'photos': return '📷'
      case 'videos': return '🎥'
      case 'documents': return '📄'
      default: return '📁'
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    setUploadProgress(initialProgress)

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        await uploadSingleFile(file, i)
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'error', error: 'Upload failed' } : item
        ))
      }
    }
  }

  const uploadSingleFile = async (file: File, index: number) => {
    // Simulate Cloudinary upload for now (replace with real Cloudinary integration)
    const cloudinaryId = `evidence/${item.id}/${activeTab}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { ...item, progress } : item
      ))
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    try {
      // Save evidence to database
      const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          type: activeTab.slice(0, -1), // Remove 's' from photos/videos/documents
          cloudinaryId,
          originalName: file.name,
          description: `${activeTab.slice(0, -1)} evidence for ${item.name}`
        })
      })

      if (response.ok) {
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'success', cloudinaryId } : item
        ))
      } else {
        throw new Error('Failed to save evidence to database')
      }
    } catch (error) {
      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error', error: 'Database save failed' } : item
      ))
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const isUploading = uploadProgress.some(p => p.status === 'uploading')
  const successCount = uploadProgress.filter(p => p.status === 'success').length
  const errorCount = uploadProgress.filter(p => p.status === 'error').length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Upload Evidence</h2>
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

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {(['photos', 'videos', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getTabIcon(tab)} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={getAcceptedTypes()}
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />

            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">{getTabIcon(activeTab)}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dragActive ? `Drop ${activeTab} here` : `Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="text-sm text-gray-500">
                <p>Accepted: {getAcceptedTypes()}</p>
                <p>Max file size: 50MB per file</p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h4>
              <div className="space-y-3">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getTabIcon(activeTab)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                          <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-blue-600">{item.progress}%</span>
                          </div>
                        )}
                        {item.status === 'success' && (
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-green-600">Success</span>
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm text-red-600">Error</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {item.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Error Message */}
                    {item.status === 'error' && item.error && (
                      <p className="text-sm text-red-600 mt-2">{item.error}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Summary */}
              {uploadProgress.length > 0 && !isUploading && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Upload Complete:</span>
                      <span className="text-green-600 ml-2">{successCount} successful</span>
                      {errorCount > 0 && (
                        <span className="text-red-600 ml-2">{errorCount} failed</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setUploadProgress([])}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear
                      </button>
                      <button
                        onClick={onSuccess}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {uploadProgress.length === 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Upload Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Photos:</strong> Pictures of the stolen item, serial numbers, damage</li>
                <li>• <strong>Videos:</strong> Walkaround videos, operation demonstrations</li>
                <li>• <strong>Documents:</strong> Receipts, warranties, insurance papers, manuals</li>
              </ul>
              <p className="text-xs text-blue-700 mt-3">
                All files are securely stored and organized for law enforcement and insurance purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
