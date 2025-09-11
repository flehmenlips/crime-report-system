'use client'

import { useState, useRef } from 'react'
import { StolenItem } from '@/types'

interface SimpleFileUploadProps {
  item: StolenItem
  onClose: () => void
  onSuccess: () => void
}

export function SimpleFileUpload({ item, onClose, onSuccess }: SimpleFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const results: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        console.log('Uploading file:', file.name)
        
        // Determine file type
        let evidenceType = 'document'
        if (file.type.startsWith('image/')) evidenceType = 'photo'
        else if (file.type.startsWith('video/')) evidenceType = 'video'

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('itemId', item.id.toString())
        formData.append('type', evidenceType)

        // Upload file
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (response.ok) {
          results.push(`✅ ${file.name} uploaded successfully`)
          console.log('Upload successful:', result)
        } else {
          results.push(`❌ ${file.name} failed: ${result.error}`)
          console.error('Upload failed:', result)
        }
        
      } catch (error) {
        results.push(`❌ ${file.name} failed: ${error}`)
        console.error('Upload error:', error)
      }
    }

    setUploadResults(results)
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
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

        {/* Content */}
        <div className="p-6">
          {!uploading && uploadResults.length === 0 && (
            <div>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Files to Upload
                </h3>
                <p className="text-gray-600">
                  Choose photos, videos, or documents related to this stolen item
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*'
                      fileInputRef.current.click()
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
                >
                  📷 Upload Photos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'video/*'
                      fileInputRef.current.click()
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
                >
                  🎥 Upload Videos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.pdf,.doc,.docx,.txt'
                      fileInputRef.current.click()
                    }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
                >
                  📄 Upload Documents
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Supported Files:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Photos:</strong> JPG, PNG, HEIC, WebP</li>
                  <li>• <strong>Videos:</strong> MP4, MOV, AVI, WebM</li>
                  <li>• <strong>Documents:</strong> PDF, Word, Text files</li>
                </ul>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Files...</h3>
              <p className="text-gray-600">Please wait while we process your evidence files</p>
            </div>
          )}

          {uploadResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
              <div className="space-y-2 mb-6">
                {uploadResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm ${
                    result.startsWith('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {result}
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setUploadResults([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Upload More Files
                </button>
                <button
                  onClick={() => {
                    onSuccess()
                    onClose()
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
