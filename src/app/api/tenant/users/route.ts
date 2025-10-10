import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all users for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId parameter is required' },
        { status: 400 }
      )
    }

    // Fetch all users for this tenant
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accessLevel: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`✅ Fetched ${users.length} users for tenant ${tenantId}`)

    return NextResponse.json({ users })

  } catch (error) {
    console.error('❌ Error fetching tenant users:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch tenant users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}