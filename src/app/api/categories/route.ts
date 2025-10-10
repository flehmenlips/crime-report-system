import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all categories for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const categories = await prisma.category.findMany({
      where: { tenantId },
      orderBy: [
        { isSystem: 'desc' }, // System categories first
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log('✅ Categories fetched:', { tenantId, count: categories.length })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, tenantId, createdBy } = body

    if (!name || !tenantId || !createdBy) {
      return NextResponse.json(
        { error: 'Name, tenantId, and createdBy are required' },
        { status: 400 }
      )
    }

    // Check if category already exists for this tenant
    const existingCategory = await prisma.category.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: name.trim()
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tenantId,
        createdBy,
        isSystem: false
      }
    })

    console.log('✅ Category created:', {
      id: category.id,
      name: category.name,
      tenantId: category.tenantId,
      createdBy: category.createdBy
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating category:', error)
    return NextResponse.json(
      {
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
