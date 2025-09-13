'use client'

import { useState } from 'react'

interface CloudinaryManagerProps {
  onClose: () => void
}

interface FolderAnalysis {
  totalFiles: number
  folderPatterns: Record<string, number>
  resourceTypes: Record<string, number>
  fileExtensions: Record<string, number>
  duplicateNames: Record<string, number>
}

export function CloudinaryManager({ onClose }: CloudinaryManagerProps) {
  const [analysis, setAnalysis] = useState<FolderAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'analysis' | 'cleanup' | 'complete'>('analysis')

  const analyzeStructure = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cloudinary-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        console.log('Cloudinary analysis:', data)
      } else {
        alert('Error analyzing Cloudinary structure')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error analyzing Cloudinary structure')
    } finally {
      setLoading(false)
    }
  }

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
        maxWidth: '900px',
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
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
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
                🗂️
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
                  Cloudinary Manager
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', fontWeight: '500' }}>
                  Analyze and organize your evidence file structure
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
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          {!analysis ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🗂️</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>
                Cloudinary Organization Analysis
              </h3>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
                Analyze your current Cloudinary folder structure to identify organization issues, 
                duplicate files, and inconsistent naming patterns.
              </p>
              
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '12px', margin: '0 0 12px 0' }}>
                  📋 Current Issues Identified:
                </h4>
                <ul style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                  <li>Multiple folder structures (evidence/, CrimeReport/, Home/)</li>
                  <li>Inconsistent file naming and extensions</li>
                  <li>Mixed resource types (/image/ vs /raw/)</li>
                  <li>Duplicate files from testing uploads</li>
                  <li>Files scattered across different locations</li>
                </ul>
              </div>

              <button
                onClick={analyzeStructure}
                disabled={loading}
                style={{
                  background: loading 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '18px' }}>🔍</span>
                    Analyze Cloudinary Structure
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '24px', margin: '0 0 24px 0' }}>
                📊 Cloudinary Structure Analysis
              </h3>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e40af', marginBottom: '4px' }}>
                    {analysis.totalFiles}
                  </div>
                  <div style={{ color: '#1e40af', fontWeight: '600' }}>Total Files</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#92400e', marginBottom: '4px' }}>
                    {Object.keys(analysis.folderPatterns).length}
                  </div>
                  <div style={{ color: '#92400e', fontWeight: '600' }}>Folder Patterns</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #ef4444'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>
                    {Object.values(analysis.duplicateNames).filter(count => count > 1).length}
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: '600' }}>Duplicate Files</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Folder Patterns */}
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '12px', margin: '0 0 12px 0' }}>
                    📁 Folder Patterns
                  </h4>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                    {Object.entries(analysis.folderPatterns).map(([pattern, count]) => (
                      <div key={pattern} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '8px 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace' }}>
                          {pattern}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                          {count} files
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Types */}
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '12px', margin: '0 0 12px 0' }}>
                    🔗 Resource Types
                  </h4>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                    {Object.entries(analysis.resourceTypes).map(([type, count]) => (
                      <div key={type} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '8px 0',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {type}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                          {count} files
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '32px'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af', marginBottom: '16px', margin: '0 0 16px 0' }}>
                  💡 Recommended Folder Structure
                </h4>
                <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6', fontFamily: 'monospace' }}>
                  <div style={{ marginBottom: '8px' }}>📁 CrimeReport/</div>
                  <div style={{ marginBottom: '8px', paddingLeft: '20px' }}>📅 2025-09-12/</div>
                  <div style={{ marginBottom: '8px', paddingLeft: '40px' }}>🏠 item_10/</div>
                  <div style={{ marginBottom: '8px', paddingLeft: '60px' }}>📷 photo/ → timestamp_filename.jpg</div>
                  <div style={{ marginBottom: '8px', paddingLeft: '60px' }}>🎥 video/ → timestamp_filename.mp4</div>
                  <div style={{ marginBottom: '8px', paddingLeft: '60px' }}>📄 document/ → timestamp_filename.pdf</div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
                  ✨ This structure provides date-based organization, clear item separation, 
                  and type-based folders for easy management and prevents conflicts.
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
            {analysis && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Analysis complete • {analysis.totalFiles} files analyzed
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Close
            </button>
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
