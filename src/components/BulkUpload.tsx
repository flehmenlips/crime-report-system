'use client'

import { useState, useRef } from 'react'
import { StolenItem } from '@/types'

interface BulkUploadProps {
  items: StolenItem[]
  onClose: () => void
  onSuccess: () => void
}

interface UploadFile {
  file: File
  id: string
  type: 'photo' | 'video' | 'document'
  preview?: string
  assignedItemId?: number
  newItemName?: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export function BulkUpload({ items, onClose, onSuccess }: BulkUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'assign' | 'processing' | 'results'>('upload')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFilesSelected(files)
    }
  }

  const handleFilesSelected = (fileList: FileList) => {
    const newFiles: UploadFile[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileId = `${Date.now()}-${i}-${file.name}`
      
      let fileType: 'photo' | 'video' | 'document' = 'document'
      if (file.type.startsWith('image/')) fileType = 'photo'
      else if (file.type.startsWith('video/')) fileType = 'video'

      const uploadFile: UploadFile = {
        file,
        id: fileId,
        type: fileType,
        progress: 0,
        status: 'pending'
      }

      // Create preview for images
      if (fileType === 'photo') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(uploadFile)
    }

    setUploadFiles(prev => [...prev, ...newFiles])
    
    // Auto-advance to assignment step if we have files
    if (newFiles.length > 0) {
      setCurrentStep('assign')
    }
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
    if (uploadFiles.length === 1) {
      setCurrentStep('upload')
    }
  }

  const assignFileToItem = (fileId: string, itemId: number) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, assignedItemId: itemId, newItemName: undefined } : f
    ))
  }

  const assignFileToNewItem = (fileId: string, itemName: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, newItemName: itemName, assignedItemId: undefined } : f
    ))
  }

  const processUploads = async () => {
    setCurrentStep('processing')
    setUploading(true)

    // Group files by their assignment
    const filesByAssignment = uploadFiles.reduce((acc, file) => {
      const key = file.assignedItemId ? `item-${file.assignedItemId}` : `new-${file.newItemName || 'Unnamed'}`
      if (!acc[key]) acc[key] = []
      acc[key].push(file)
      return acc
    }, {} as Record<string, UploadFile[]>)

    // Process each group
    for (const [assignment, files] of Object.entries(filesByAssignment)) {
      let targetItemId: number

      // Create new item if needed
      if (assignment.startsWith('new-')) {
        const itemName = assignment.replace('new-', '')
        try {
          const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: itemName,
              description: `Item created from bulk upload with ${files.length} files`,
              ownerId: 'cmfeyn7es0000t6oil8p6d45c' // Hardcoded for now
            })
          })

          if (response.ok) {
            const result = await response.json()
            targetItemId = result.item.id
          } else {
            // Mark files as error
            files.forEach(file => {
              setUploadFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, status: 'error', error: 'Failed to create item' } : f
              ))
            })
            continue
          }
        } catch (error) {
          files.forEach(file => {
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'error', error: 'Failed to create item' } : f
            ))
          })
          continue
        }
      } else {
        targetItemId = parseInt(assignment.replace('item-', ''))
      }

      // Upload files for this item
      for (const file of files) {
        try {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          ))

          const formData = new FormData()
          formData.append('file', file.file)
          formData.append('itemId', targetItemId.toString())
          formData.append('type', file.type)

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
            ))
          }, 200)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          clearInterval(progressInterval)

          if (response.ok) {
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
            ))
          } else {
            const result = await response.json()
            setUploadFiles(prev => prev.map(f => 
              f.id === file.id ? { 
                ...f, 
                status: 'error', 
                progress: 0, 
                error: result.error || 'Upload failed' 
              } : f
            ))
          }
        } catch (error) {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error', 
              progress: 0, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } : f
          ))
        }
      }
    }

    setUploading(false)
    setCurrentStep('results')
  }

  const getFilesByType = (type: 'photo' | 'video' | 'document') => {
    return uploadFiles.filter(f => f.type === type)
  }

  const getAssignmentSummary = () => {
    const assigned = uploadFiles.filter(f => f.assignedItemId || f.newItemName).length
    return `${assigned} of ${uploadFiles.length} files assigned`
  }

  const canProceed = uploadFiles.every(f => f.assignedItemId || f.newItemName)

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
            opacity: 0.1
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                📤
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
                  Bulk Upload Evidence
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', fontWeight: '500' }}>
                  Upload multiple files and organize them efficiently
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div style={{ 
            marginTop: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            position: 'relative',
            zIndex: 1
          }}>
            {['upload', 'assign', 'processing', 'results'].map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep === step || 
                    (['assign', 'processing', 'results'].includes(currentStep) && step === 'upload') ||
                    (['processing', 'results'].includes(currentStep) && step === 'assign') ||
                    (currentStep === 'results' && step === 'processing')
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.3)',
                  color: currentStep === step || 
                    (['assign', 'processing', 'results'].includes(currentStep) && step === 'upload') ||
                    (['processing', 'results'].includes(currentStep) && step === 'assign') ||
                    (currentStep === 'results' && step === 'processing')
                    ? '#d97706' 
                    : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}>
                  {index + 1}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  opacity: currentStep === step ? 1 : 0.7
                }}>
                  {step}
                </span>
                {index < 3 && (
                  <div style={{
                    width: '24px',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    marginLeft: '8px'
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          {currentStep === 'upload' && (
            <div>
              {/* Drag & Drop Area */}
              <div
                style={{
                  border: dragActive 
                    ? '3px dashed #f59e0b' 
                    : '2px dashed #d1d5db',
                  borderRadius: '20px',
                  padding: '64px 32px',
                  textAlign: 'center',
                  marginBottom: '32px',
                  background: dragActive 
                    ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' 
                    : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onMouseOver={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = '#9ca3af'
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseOut={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.background = '#fafafa'
                  }
                }}
              >
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>
                  {dragActive ? '📤' : '📁'}
                </div>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  {dragActive ? 'Drop files here!' : 'Upload Multiple Files'}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '24px',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  margin: '0 0 24px 0',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {dragActive 
                    ? 'Release to upload all files at once' 
                    : 'Drag and drop multiple files here, or click to browse and select many files'
                  }
                </p>
                <div style={{ fontSize: '16px', color: '#9ca3af', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>✨ Smart bulk upload features:</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Upload dozens of files simultaneously</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Organize files by existing or new items</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Automatic file type detection</p>
                  <p style={{ margin: 0 }}>• Progress tracking for each file</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                style={{ display: 'none' }}
              />

              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                border: '1px solid #f59e0b',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#92400e', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>🚀</span>
                  Ready for Bulk Upload
                </h4>
                <p style={{ color: '#92400e', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                  Select multiple files to get started. You'll be able to organize and assign them to items on the next step.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'assign' && (
            <div>
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Organize Your Files
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 16px 0' }}>
                  Assign each file to an existing item or create new items
                </p>
                <div style={{
                  background: '#f3f4f6',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {getAssignmentSummary()}
                </div>
              </div>

              {/* File Organization */}
              <div style={{ display: 'grid', gap: '24px' }}>
                {['photo', 'video', 'document'].map(type => {
                  const filesOfType = getFilesByType(type as any)
                  if (filesOfType.length === 0) return null

                  return (
                    <div key={type} style={{
                      background: '#f9fafb',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '16px',
                        margin: '0 0 16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {type === 'photo' ? '📷' : type === 'video' ? '🎥' : '📄'}
                        </span>
                        {type === 'photo' ? 'Photos' : type === 'video' ? 'Videos' : 'Documents'} ({filesOfType.length})
                      </h4>
                      
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {filesOfType.map(file => (
                          <div key={file.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                          }}>
                            {/* File Preview */}
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              background: file.preview ? `url(${file.preview}) center/cover` : '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}>
                              {!file.preview && (
                                type === 'photo' ? '📷' : type === 'video' ? '🎥' : '📄'
                              )}
                            </div>

                            {/* File Info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                {file.file.name}
                              </div>
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>

                            {/* Assignment Controls */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select
                                value={file.assignedItemId || ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value === 'new') {
                                    const itemName = prompt('Enter name for new item:')
                                    if (itemName) {
                                      assignFileToNewItem(file.id, itemName)
                                    }
                                  } else if (value) {
                                    assignFileToItem(file.id, parseInt(value))
                                  }
                                }}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '14px',
                                  minWidth: '200px'
                                }}
                              >
                                <option value="">Select item...</option>
                                {items.map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                                <option value="new">+ Create New Item</option>
                              </select>

                              {file.newItemName && (
                                <div style={{
                                  background: '#dbeafe',
                                  color: '#1e40af',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  New: {file.newItemName}
                                </div>
                              )}

                              <button
                                onClick={() => removeFile(file.id)}
                                style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: 'none',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 32px'
              }}></div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Processing Your Files...
              </h3>
              <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '32px', margin: '0 0 32px 0' }}>
                Creating items and uploading evidence files
              </p>

              {/* Progress for each file */}
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                {uploadFiles.map(file => (
                  <div key={file.id} style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px' 
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        {file.file.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          background: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {file.status === 'completed' ? '✅' : file.status === 'error' ? '❌' : '⏳'} {file.progress}%
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      background: '#e5e7eb', 
                      borderRadius: '8px', 
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: file.status === 'error' 
                          ? '#ef4444' 
                          : file.status === 'completed' 
                            ? '#10b981' 
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        width: `${file.progress}%`
                      }}></div>
                    </div>
                    {file.error && (
                      <div style={{ 
                        color: '#dc2626', 
                        fontSize: '12px', 
                        marginTop: '4px',
                        fontWeight: '500'
                      }}>
                        Error: {file.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'results' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Bulk Upload Complete!
                </h3>
                <p style={{ color: '#6b7280', fontSize: '18px', margin: 0 }}>
                  Your files have been processed and organized
                </p>
              </div>

              {/* Results Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #22c55e'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>
                    {uploadFiles.filter(f => f.status === 'completed').length}
                  </div>
                  <div style={{ color: '#166534', fontWeight: '600' }}>Successful</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #ef4444'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>
                    {uploadFiles.filter(f => f.status === 'error').length}
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: '600' }}>Failed</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#92400e', marginBottom: '4px' }}>
                    {uploadFiles.length}
                  </div>
                  <div style={{ color: '#92400e', fontWeight: '600' }}>Total Files</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Upload Details
                </h4>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {uploadFiles.map(file => (
                    <div key={file.id} style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px' }}>
                          {file.status === 'completed' ? '✅' : '❌'}
                        </span>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                            {file.file.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {file.assignedItemId 
                              ? `→ ${items.find(i => i.id === file.assignedItemId)?.name || 'Unknown Item'}`
                              : `→ New Item: ${file.newItemName}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      {file.error && (
                        <div style={{ 
                          color: '#dc2626', 
                          fontSize: '12px',
                          fontWeight: '500',
                          maxWidth: '200px',
                          textAlign: 'right'
                        }}>
                          {file.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            {currentStep === 'assign' && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {uploadFiles.length} files ready • {getAssignmentSummary()}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep === 'assign' && (
              <button
                onClick={() => setCurrentStep('upload')}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back
              </button>
            )}
            
            {currentStep === 'assign' && (
              <button
                onClick={processUploads}
                disabled={!canProceed || uploading}
                style={{
                  background: canProceed 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: canProceed ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                Process Files →
              </button>
            )}
            
            {currentStep === 'results' && (
              <button
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                ✅ Done
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
