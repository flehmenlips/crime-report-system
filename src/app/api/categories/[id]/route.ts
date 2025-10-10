import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id
    const body = await request.json()
    const { name, description, sortOrder } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if name already exists for this tenant (excluding current category)
    if (name.trim() !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: {
          tenantId_name: {
            tenantId: existingCategory.tenantId,
            name: name.trim()
          }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sortOrder: sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
        updatedAt: new Date()
      }
    })

    console.log('✅ Category updated:', {
      id: updatedCategory.id,
      name: updatedCategory.name,
      tenantId: updatedCategory.tenantId
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('❌ Error updating category:', error)
    return NextResponse.json(
      {
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of system categories
    if (existingCategory.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system categories' },
        { status: 403 }
      )
    }

    // Check if category is being used by any items
    const itemsUsingCategory = await prisma.stolenItem.count({
      where: {
        tenantId: existingCategory.tenantId,
        category: existingCategory.name
      }
    })

    if (itemsUsingCategory > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category that is being used by items',
          itemsCount: itemsUsingCategory
        },
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    console.log('✅ Category deleted:', {
      id: categoryId,
      name: existingCategory.name,
      tenantId: existingCategory.tenantId
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting category:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
