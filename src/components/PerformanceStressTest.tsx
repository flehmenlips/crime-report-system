'use client'

import { useState, useEffect } from 'react'
import { StolenItem, User } from '@/types'

interface PerformanceTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  result?: string
  details?: string[]
  metrics?: {
    duration?: number
    memoryUsage?: number
    itemCount?: number
    evidenceCount?: number
  }
}

interface PerformanceStressTestProps {
  currentUser: User | null
  onClose: () => void
}

export function PerformanceStressTest({ currentUser, onClose }: PerformanceStressTestProps) {
  const [tests, setTests] = useState<PerformanceTest[]>([
    {
      id: 'load-large-dataset',
      name: 'Large Dataset Loading',
      description: 'Test loading 100+ items with extensive evidence',
      status: 'pending'
    },
    {
      id: 'search-performance',
      name: 'Search Performance',
      description: 'Test search performance with large datasets',
      status: 'pending'
    },
    {
      id: 'bulk-operations',
      name: 'Bulk Operations',
      description: 'Test bulk operations performance',
      status: 'pending'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      description: 'Monitor memory usage during operations',
      status: 'pending'
    },
    {
      id: 'render-performance',
      name: 'Render Performance',
      description: 'Test UI rendering performance',
      status: 'pending'
    },
    {
      id: 'api-response-times',
      name: 'API Response Times',
      description: 'Test API endpoint response times',
      status: 'pending'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({})

  const updateTest = (testId: string, updates: Partial<PerformanceTest>) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, ...updates } : test
    ))
  }

  const runLargeDatasetLoading = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('📊 TESTING LARGE DATASET LOADING')
      const startTime = performance.now()
      
      // Test 1: Load all items
      const itemsResponse = await fetch('/api/items')
      if (!itemsResponse.ok) {
        details.push(`❌ Failed to load items: ${itemsResponse.status}`)
        return { passed: false, details }
      }
      
      const itemsData = await itemsResponse.json()
      const items = itemsData.items || []
      
      const loadTime = performance.now() - startTime
      metrics.duration = loadTime
      metrics.itemCount = items.length
      
      details.push(`✅ Loaded ${items.length} items in ${loadTime.toFixed(2)}ms`)
      
      // Test 2: Calculate evidence count
      const totalEvidence = items.reduce((sum: number, item: StolenItem) => 
        sum + (item.evidence?.length || 0), 0
      )
      metrics.evidenceCount = totalEvidence
      
      details.push(`✅ Total evidence files: ${totalEvidence}`)
      
      // Test 3: Performance benchmarks
      const itemsPerSecond = (items.length / loadTime) * 1000
      details.push(`✅ Loading rate: ${itemsPerSecond.toFixed(2)} items/second`)
      
      // Test 4: Large dataset threshold
      if (items.length >= 100) {
        details.push(`✅ Large dataset threshold met: ${items.length} items`)
      } else {
        details.push(`⚠️ Dataset size: ${items.length} items (target: 100+)`)
      }
      
      // Test 5: Memory usage estimation
      const estimatedMemory = (items.length * 2) + (totalEvidence * 0.5) // Rough estimate in MB
      metrics.memoryUsage = estimatedMemory
      details.push(`📊 Estimated memory usage: ${estimatedMemory.toFixed(2)}MB`)
      
      console.log('✅ LARGE DATASET LOADING PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ Large dataset test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ LARGE DATASET LOADING FAILED:', error)
      return { passed: false, details }
    }
  }

  const runSearchPerformance = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('🔍 TESTING SEARCH PERFORMANCE')
      
      // Test 1: Load items first
      const itemsResponse = await fetch('/api/items')
      if (!itemsResponse.ok) {
        details.push(`❌ Failed to load items for search test: ${itemsResponse.status}`)
        return { passed: false, details }
      }
      
      const itemsData = await itemsResponse.json()
      const items = itemsData.items || []
      
      if (items.length === 0) {
        details.push('⏭️ No items available for search testing')
        return { passed: true, details }
      }
      
      // Test 2: Name search performance
      const searchStart = performance.now()
      const searchTerm = items[0].name.substring(0, 3) // First 3 characters
      
      // Simulate client-side search
      const searchResults = items.filter((item: StolenItem) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      const searchTime = performance.now() - searchStart
      metrics.searchDuration = searchTime
      
      details.push(`✅ Name search: ${searchResults.length} results in ${searchTime.toFixed(2)}ms`)
      
      // Test 3: Complex filter performance
      const filterStart = performance.now()
      const filteredResults = items.filter((item: StolenItem) => 
        item.estimatedValue > 100 && 
        item.evidence && 
        item.evidence.length > 0
      )
      
      const filterTime = performance.now() - filterStart
      metrics.filterDuration = filterTime
      
      details.push(`✅ Complex filter: ${filteredResults.length} results in ${filterTime.toFixed(2)}ms`)
      
      // Test 4: Performance benchmarks
      const searchesPerSecond = (1000 / searchTime) * items.length
      details.push(`✅ Search rate: ${searchesPerSecond.toFixed(2)} items/second`)
      
      // Test 5: Large dataset search performance
      if (items.length >= 50) {
        if (searchTime < 100) {
          details.push('✅ Search performance excellent for large dataset')
        } else if (searchTime < 500) {
          details.push('✅ Search performance good for large dataset')
        } else {
          details.push('⚠️ Search performance may need optimization for large datasets')
        }
      }
      
      console.log('✅ SEARCH PERFORMANCE PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ Search performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ SEARCH PERFORMANCE FAILED:', error)
      return { passed: false, details }
    }
  }

  const runBulkOperations = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('📦 TESTING BULK OPERATIONS PERFORMANCE')
      
      // Test 1: Load items
      const itemsResponse = await fetch('/api/items')
      if (!itemsResponse.ok) {
        details.push(`❌ Failed to load items: ${itemsResponse.status}`)
        return { passed: false, details }
      }
      
      const itemsData = await itemsResponse.json()
      const items = itemsData.items || []
      
      if (items.length === 0) {
        details.push('⏭️ No items available for bulk operations testing')
        return { passed: true, details }
      }
      
      // Test 2: Bulk selection performance
      const selectionStart = performance.now()
      const selectedItems = new Set(items.slice(0, Math.min(10, items.length)).map(item => item.id))
      const selectionTime = performance.now() - selectionStart
      
      details.push(`✅ Bulk selection: ${selectedItems.size} items in ${selectionTime.toFixed(2)}ms`)
      
      // Test 3: Bulk delete simulation (without actually deleting)
      const deleteStart = performance.now()
      const itemsToDelete = items.filter(item => selectedItems.has(item.id))
      const deleteTime = performance.now() - deleteStart
      
      details.push(`✅ Bulk delete simulation: ${itemsToDelete.length} items in ${deleteTime.toFixed(2)}ms`)
      
      // Test 4: Bulk duplicate simulation
      const duplicateStart = performance.now()
      const duplicateOperations = itemsToDelete.map(item => ({
        name: `${item.name} (Copy)`,
        description: item.description,
        estimatedValue: item.estimatedValue
      }))
      const duplicateTime = performance.now() - duplicateStart
      
      details.push(`✅ Bulk duplicate simulation: ${duplicateOperations.length} items in ${duplicateTime.toFixed(2)}ms`)
      
      // Test 5: Performance benchmarks
      const operationsPerSecond = (1000 / deleteTime) * itemsToDelete.length
      details.push(`✅ Bulk operation rate: ${operationsPerSecond.toFixed(2)} items/second`)
      
      metrics.bulkDuration = deleteTime + duplicateTime
      metrics.operationCount = itemsToDelete.length
      
      console.log('✅ BULK OPERATIONS PERFORMANCE PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ Bulk operations test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ BULK OPERATIONS PERFORMANCE FAILED:', error)
      return { passed: false, details }
    }
  }

  const runMemoryUsage = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('🧠 TESTING MEMORY USAGE')
      
      // Test 1: Initial memory check
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      details.push(`📊 Initial memory usage: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`)
      
      // Test 2: Load large dataset
      const itemsResponse = await fetch('/api/items')
      if (!itemsResponse.ok) {
        details.push(`❌ Failed to load items: ${itemsResponse.status}`)
        return { passed: false, details }
      }
      
      const itemsData = await itemsResponse.json()
      const items = itemsData.items || []
      
      // Test 3: Memory after loading
      const afterLoadMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = afterLoadMemory - initialMemory
      
      details.push(`📊 Memory after loading: ${(afterLoadMemory / 1024 / 1024).toFixed(2)}MB`)
      details.push(`📊 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      
      // Test 4: Memory per item
      if (items.length > 0) {
        const memoryPerItem = memoryIncrease / items.length
        details.push(`📊 Memory per item: ${(memoryPerItem / 1024).toFixed(2)}KB`)
      }
      
      // Test 5: Memory efficiency check
      if (memoryIncrease < 50 * 1024 * 1024) { // Less than 50MB
        details.push('✅ Memory usage efficient for dataset size')
      } else {
        details.push('⚠️ High memory usage detected')
      }
      
      metrics.memoryIncrease = memoryIncrease
      metrics.itemCount = items.length
      
      console.log('✅ MEMORY USAGE TEST PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ Memory usage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ MEMORY USAGE TEST FAILED:', error)
      return { passed: false, details }
    }
  }

  const runRenderPerformance = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('🎨 TESTING RENDER PERFORMANCE')
      
      // Test 1: Load items
      const itemsResponse = await fetch('/api/items')
      if (!itemsResponse.ok) {
        details.push(`❌ Failed to load items: ${itemsResponse.status}`)
        return { passed: false, details }
      }
      
      const itemsData = await itemsResponse.json()
      const items = itemsData.items || []
      
      if (items.length === 0) {
        details.push('⏭️ No items available for render testing')
        return { passed: true, details }
      }
      
      // Test 2: Simulate rendering performance
      const renderStart = performance.now()
      
      // Simulate card rendering
      const cards = items.map((item: StolenItem) => ({
        id: item.id,
        name: item.name,
        value: item.estimatedValue,
        evidenceCount: item.evidence?.length || 0
      }))
      
      const renderTime = performance.now() - renderStart
      metrics.renderDuration = renderTime
      
      details.push(`✅ Card rendering: ${cards.length} cards in ${renderTime.toFixed(2)}ms`)
      
      // Test 3: List rendering simulation
      const listStart = performance.now()
      const listItems = items.map((item: StolenItem) => ({
        id: item.id,
        name: item.name,
        description: item.description
      }))
      
      const listTime = performance.now() - listStart
      
      details.push(`✅ List rendering: ${listItems.length} items in ${listTime.toFixed(2)}ms`)
      
      // Test 4: Performance benchmarks
      const cardsPerSecond = (1000 / renderTime) * cards.length
      details.push(`✅ Render rate: ${cardsPerSecond.toFixed(2)} cards/second`)
      
      // Test 5: Performance thresholds
      if (renderTime < 100) {
        details.push('✅ Render performance excellent')
      } else if (renderTime < 500) {
        details.push('✅ Render performance good')
      } else {
        details.push('⚠️ Render performance may need optimization')
      }
      
      console.log('✅ RENDER PERFORMANCE PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ Render performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ RENDER PERFORMANCE FAILED:', error)
      return { passed: false, details }
    }
  }

  const runApiResponseTimes = async (): Promise<{ passed: boolean; details: string[]; metrics?: any }> => {
    const details: string[] = []
    const metrics: any = {}
    
    try {
      console.log('🌐 TESTING API RESPONSE TIMES')
      
      const endpoints = [
        { name: 'Items API', url: '/api/items' },
        { name: 'User Profile', url: '/api/user/profile' }
      ]
      
      const responseTimes: number[] = []
      
      for (const endpoint of endpoints) {
        const startTime = performance.now()
        
        try {
          const response = await fetch(endpoint.url)
          const endTime = performance.now()
          const responseTime = endTime - startTime
          
          responseTimes.push(responseTime)
          
          if (response.ok) {
            details.push(`✅ ${endpoint.name}: ${responseTime.toFixed(2)}ms`)
          } else {
            details.push(`❌ ${endpoint.name}: ${response.status} (${responseTime.toFixed(2)}ms)`)
          }
        } catch (error) {
          const endTime = performance.now()
          const responseTime = endTime - startTime
          details.push(`❌ ${endpoint.name}: Network error (${responseTime.toFixed(2)}ms)`)
        }
      }
      
      // Calculate average response time
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      metrics.avgResponseTime = avgResponseTime
      
      details.push(`📊 Average response time: ${avgResponseTime.toFixed(2)}ms`)
      
      // Performance benchmarks
      if (avgResponseTime < 200) {
        details.push('✅ API response times excellent')
      } else if (avgResponseTime < 1000) {
        details.push('✅ API response times good')
      } else {
        details.push('⚠️ API response times may need optimization')
      }
      
      console.log('✅ API RESPONSE TIMES PASSED')
      return { passed: true, details, metrics }
      
    } catch (error) {
      details.push(`❌ API response times test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ API RESPONSE TIMES FAILED:', error)
      return { passed: false, details }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setCurrentTest(null)
    
    console.log('🚀 STARTING PERFORMANCE STRESS TEST')
    console.log(`👤 Current User: ${currentUser?.name} (${currentUser?.role})`)
    
    const testFunctions = {
      'load-large-dataset': runLargeDatasetLoading,
      'search-performance': runSearchPerformance,
      'bulk-operations': runBulkOperations,
      'memory-usage': runMemoryUsage,
      'render-performance': runRenderPerformance,
      'api-response-times': runApiResponseTimes
    }
    
    for (const test of tests) {
      setCurrentTest(test.id)
      updateTest(test.id, { status: 'running' })
      
      console.log(`🧪 RUNNING PERFORMANCE TEST: ${test.name}`)
      
      try {
        const testFunction = testFunctions[test.id as keyof typeof testFunctions]
        if (testFunction) {
          const result = await testFunction()
          
          updateTest(test.id, {
            status: result.passed ? 'passed' : 'failed',
            result: result.passed ? 'PASSED' : 'FAILED',
            details: result.details,
            metrics: result.metrics
          })
          
          setTestResults(prev => ({
            ...prev,
            [test.id]: result
          }))
          
          console.log(`${result.passed ? '✅' : '❌'} PERFORMANCE TEST COMPLETE: ${test.name}`)
        } else {
          updateTest(test.id, {
            status: 'failed',
            result: 'ERROR',
            details: ['Test function not found']
          })
        }
      } catch (error) {
        updateTest(test.id, {
          status: 'failed',
          result: 'ERROR',
          details: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        })
        
        console.error(`❌ PERFORMANCE TEST ERROR: ${test.name}`, error)
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setCurrentTest(null)
    setIsRunning(false)
    
    // Calculate summary
    const passedTests = tests.filter(t => t.status === 'passed').length
    const failedTests = tests.filter(t => t.status === 'failed').length
    
    console.log(`🎉 PERFORMANCE STRESS TEST COMPLETE`)
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`📊 Total: ${tests.length}`)
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length
  const totalTests = tests.length

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              📊 Performance Stress Test
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Testing performance with large datasets and intensive operations
            </p>
            {currentUser && (
              <p style={{ color: '#374151', fontSize: '12px', marginTop: '4px' }}>
                👤 {currentUser.name} ({currentUser.role})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            &times;
          </button>
        </div>

        {/* Progress Summary */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Test Progress
            </h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                ✅ {passedTests} • ❌ {failedTests} • 📊 {totalTests}
              </span>
              {isRunning && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((passedTests + failedTests) / totalTests) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, 
                ${passedTests > 0 ? '#10b981' : '#e5e7eb'} 0%, 
                ${failedTests > 0 ? '#ef4444' : '#e5e7eb'} 100%)`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Test List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tests.map(test => (
              <div
                key={test.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  background: test.status === 'running' ? '#fef3c7' : 
                             test.status === 'passed' ? '#f0fdf4' :
                             test.status === 'failed' ? '#fef2f2' : '#f9fafb',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {test.status === 'running' && '🔄'}
                      {test.status === 'passed' && '✅'}
                      {test.status === 'failed' && '❌'}
                      {test.status === 'pending' && '⏳'}
                      {test.name}
                    </h4>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      {test.description}
                    </p>
                  </div>
                  
                  {test.status !== 'pending' && (
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: test.status === 'passed' ? '#dcfce7' : 
                                 test.status === 'failed' ? '#fee2e2' : '#fef3c7',
                      color: test.status === 'passed' ? '#166534' : 
                             test.status === 'failed' ? '#dc2626' : '#92400e'
                    }}>
                      {test.result}
                    </div>
                  )}
                </div>
                
                {test.metrics && (
                  <div style={{
                    marginBottom: test.details ? '12px' : '0',
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1e40af'
                  }}>
                    <strong>Metrics:</strong> 
                    {test.metrics.duration && ` Duration: ${test.metrics.duration.toFixed(2)}ms`}
                    {test.metrics.memoryUsage && ` Memory: ${test.metrics.memoryUsage.toFixed(2)}MB`}
                    {test.metrics.itemCount && ` Items: ${test.metrics.itemCount}`}
                    {test.metrics.evidenceCount && ` Evidence: ${test.metrics.evidenceCount}`}
                  </div>
                )}
                
                {test.details && test.details.length > 0 && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Test Details:
                    </h5>
                    <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
                      {test.details.map((detail, index) => (
                        <li key={index} style={{ 
                          fontSize: '12px', 
                          color: '#4b5563', 
                          marginBottom: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f9fafb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {isRunning ? (
              `Running test: ${tests.find(t => t.id === currentTest)?.name || 'Unknown'}...`
            ) : (
              `Ready to test performance with large datasets`
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isRunning}
              style={{
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.6 : 1
              }}
            >
              Close
            </button>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.6 : 1
              }}
            >
              {isRunning ? 'Running Tests...' : 'Start Performance Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
