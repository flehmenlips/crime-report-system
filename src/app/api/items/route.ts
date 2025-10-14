import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { StolenItem, SearchFilters } from '@/types'

async function getAllItems(userTenantId?: string, userRole?: string): Promise<StolenItem[]> {
  try {
    // CRITICAL: Filter by tenantId for proper data isolation
    // Super admin and law enforcement can access all tenants, others only their own
    const canAccessAllTenants = userRole === 'super_admin' || userRole === 'law_enforcement'
    const whereClause = (!canAccessAllTenants && userTenantId) ? { tenantId: userTenantId } : {}
    
    const items = await prisma.stolenItem.findMany({
      where: whereClause,
      include: {
        // Don't include evidence here - it will be loaded progressively in the background
        // This dramatically improves initial page load time (29s → ~2-3s)
        owner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert database format to frontend format
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate,
      purchaseCost: item.purchaseCost,
      dateLastSeen: item.dateLastSeen,
      locationLastSeen: item.locationLastSeen,
      estimatedValue: item.estimatedValue,
      category: item.category || 'other',
      tags: item.tags ? JSON.parse(item.tags) : [],
      notes: item.notes || undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      // Tenant info (use actual tenantId if available, fallback to default)
      tenantId: (item as any).tenantId || "tenant-1",
      tenant: {
        id: (item as any).tenantId || "tenant-1",
        name: "Birkenfeld Farm",
        description: "Original Birkenfeld Farm theft case",
        isActive: true,
        createdAt: "2023-09-01T00:00:00Z",
        updatedAt: "2023-09-19T00:00:00Z"
      },
      // Evidence is loaded separately in the background for better performance
      evidence: []
    }))
  } catch (error) {
    console.error('Error loading items from database:', error)
    return []
  }
}

async function searchItems(filters: SearchFilters, userTenantId?: string, userRole?: string): Promise<StolenItem[]> {
  try {
    const whereClause: any = {
      // CRITICAL: Filter by tenantId for proper data isolation
      // Super admin and law enforcement can access all tenants, others only their own
      ...((userRole !== 'super_admin' && userRole !== 'law_enforcement') && userTenantId && { tenantId: userTenantId })
    }

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { serialNumber: { contains: query, mode: 'insensitive' } },
        { locationLastSeen: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Value range filters
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      whereClause.estimatedValue = {}
      if (filters.minValue !== undefined) {
        whereClause.estimatedValue.gte = filters.minValue
      }
      if (filters.maxValue !== undefined) {
        whereClause.estimatedValue.lte = filters.maxValue
      }
    }

    // Date range filter
    if (filters.dateRange) {
      whereClause.dateLastSeen = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      }
    }

    const items = await prisma.stolenItem.findMany({
      where: whereClause,
      include: {
        // Don't include evidence for search results either - better performance
        owner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert to frontend format
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate,
      purchaseCost: item.purchaseCost,
      dateLastSeen: item.dateLastSeen,
      locationLastSeen: item.locationLastSeen,
      estimatedValue: item.estimatedValue,
      category: item.category || 'other',
      tags: item.tags ? JSON.parse(item.tags) : [],
      notes: item.notes || undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      // Tenant info (use actual tenantId if available, fallback to default)
      tenantId: (item as any).tenantId || "tenant-1",
      tenant: {
        id: (item as any).tenantId || "tenant-1",
        name: "Birkenfeld Farm",
        description: "Original Birkenfeld Farm theft case",
        isActive: true,
        createdAt: "2023-09-01T00:00:00Z",
        updatedAt: "2023-09-19T00:00:00Z"
      },
      // Evidence is loaded separately in the background for better performance
      evidence: []
    }))
  } catch (error) {
    console.error('Error searching items in database:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user for tenant filtering
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Input validation and sanitization
    const query = searchParams.get('query')?.trim()
    const minValueStr = searchParams.get('minValue')?.trim()
    const maxValueStr = searchParams.get('maxValue')?.trim()
    const dateStart = searchParams.get('dateStart')?.trim()
    const dateEnd = searchParams.get('dateEnd')?.trim()

    // Validate and sanitize numeric inputs
    let minValue: number | undefined
    let maxValue: number | undefined

    if (minValueStr) {
      const parsed = parseFloat(minValueStr)
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: 'Invalid minimum value. Must be a positive number.' },
          { status: 400 }
        )
      }
      minValue = parsed
    }

    if (maxValueStr) {
      const parsed = parseFloat(maxValueStr)
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: 'Invalid maximum value. Must be a positive number.' },
          { status: 400 }
        )
      }
      maxValue = parsed
    }

    // Validate date inputs
    if (dateStart && !isValidDateString(dateStart)) {
      return NextResponse.json(
        { error: 'Invalid start date format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    if (dateEnd && !isValidDateString(dateEnd)) {
      return NextResponse.json(
        { error: 'Invalid end date format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // Validate date range
    if (dateStart && dateEnd && new Date(dateStart) > new Date(dateEnd)) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date.' },
        { status: 400 }
      )
    }

    // Sanitize text input (remove potential XSS)
    const sanitizedQuery = query ? sanitizeString(query) : undefined

    // Validate query length
    if (sanitizedQuery && sanitizedQuery.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long. Maximum 100 characters.' },
        { status: 400 }
      )
    }

    const filters: SearchFilters = {
      query: sanitizedQuery,
      minValue,
      maxValue,
      dateRange: dateStart && dateEnd ? { start: dateStart, end: dateEnd } : undefined
    }

    const items = await searchItems(filters, user.tenantId, user.role)

    return NextResponse.json({
      items,
      total: items.length,
      filters: filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching items:', error)

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production'
    const errorMessage = isProduction
      ? 'An error occurred while processing your request'
      : `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Helper functions for validation and sanitization
function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

function sanitizeString(input: string): string {
  // Remove potentially dangerous characters and trim
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

export async function POST(request: NextRequest) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields - only name and ownerId are required for quick entry
    if (!body.name || !body.ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and ownerId' },
        { status: 400 }
      )
    }

    // Validate name is not empty
    if (!body.name.trim()) {
      return NextResponse.json(
        { error: 'Item name cannot be empty' },
        { status: 400 }
      )
    }

    // Create new item in database with optional fields
    const newItem = await prisma.stolenItem.create({
      data: {
        name: sanitizeString(body.name),
        description: body.description ? sanitizeString(body.description) : 'No description provided',
        serialNumber: body.serialNumber ? sanitizeString(body.serialNumber) : null,
        purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0], // Default to today
        purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : 0,
        dateLastSeen: body.dateLastSeen || new Date().toISOString().split('T')[0], // Default to today
        locationLastSeen: body.locationLastSeen ? sanitizeString(body.locationLastSeen) : 'Location not specified',
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : 0,
        category: body.category ? sanitizeString(body.category) : 'other',
        tags: body.tags ? JSON.stringify(body.tags) : null,
        notes: body.notes ? sanitizeString(body.notes) : null,
        ownerId: body.ownerId,
        tenantId: user.tenantId // CRITICAL: Set tenantId for proper data isolation
      },
      include: {
        evidence: true,
        owner: true
      }
    })

    // Convert to frontend format
    return NextResponse.json({
      ...newItem,
      tags: newItem.tags ? JSON.parse(newItem.tags) : [],
      evidence: newItem.evidence.map(e => ({ 
        ...e, 
        createdAt: e.createdAt.toISOString(),
        type: e.type as 'photo' | 'video' | 'document' 
      }))
    })

  } catch (error) {
    console.error('Error creating item:', error)
    
    const isProduction = process.env.NODE_ENV === 'production'
    const errorMessage = isProduction
      ? 'An error occurred while creating the item'
      : `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // First, verify the item belongs to the user's tenant (unless they're law enforcement)
    const existingItem = await prisma.stolenItem.findUnique({
      where: { id: parseInt(body.id) }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check tenant isolation (law enforcement can update any item)
    if (user.role !== 'law_enforcement' && existingItem.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to update this item' }, { status: 403 })
    }

    console.log('Updating item with data:', body)
    
    const updatedItem = await prisma.stolenItem.update({
      where: { id: parseInt(body.id) },
      data: {
        name: sanitizeString(body.name),
        description: body.description ? sanitizeString(body.description) : 'No description provided',
        serialNumber: body.serialNumber ? sanitizeString(body.serialNumber) : null,
        purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
        purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : 0,
        dateLastSeen: body.dateLastSeen || new Date().toISOString().split('T')[0],
        locationLastSeen: body.locationLastSeen ? sanitizeString(body.locationLastSeen) : 'Location not specified',
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : 0,
        category: body.category ? sanitizeString(body.category) : 'other',
        tags: body.tags ? JSON.stringify(body.tags) : null,
        notes: body.notes ? sanitizeString(body.notes) : null,
        updatedAt: new Date()
      },
      include: { evidence: true, owner: true }
    })
    
    console.log('Item updated in database:', updatedItem.name, 'Category:', updatedItem.category, 'Notes:', updatedItem.notes)

    return NextResponse.json({
      ...updatedItem,
      tags: updatedItem.tags ? JSON.parse(updatedItem.tags) : [],
      evidence: updatedItem.evidence.map(e => ({ 
        ...e, 
        createdAt: e.createdAt.toISOString(),
        type: e.type as 'photo' | 'video' | 'document' 
      }))
    })

  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user for tenant isolation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting item with ID:', itemId)

    // Check if item exists
    const item = await prisma.stolenItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { evidence: true }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check tenant isolation (law enforcement can delete any item)
    if (user.role !== 'law_enforcement' && item.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized to delete this item' }, { status: 403 })
    }

    // Delete item (this will cascade delete evidence due to schema)
    await prisma.stolenItem.delete({
      where: {
        id: parseInt(itemId)
      }
    })

    console.log('Item deleted successfully:', item.name)

    return NextResponse.json({
      message: `Item "${item.name}" and ${item.evidence.length} evidence files deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting item:', error)
    
    const isProduction = process.env.NODE_ENV === 'production'
    const errorMessage = isProduction
      ? 'An error occurred while deleting the item'
      : `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
