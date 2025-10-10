import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-server'

// GET - Fetch all users for a tenant
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId parameter is required' },
        { status: 400 }
      )
    }

    // Authorization: Users can only access their own tenant's users
    if (currentUser.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Access denied. You can only view users in your own tenant.' },
        { status: 403 }
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

    console.log(`✅ User "${currentUser.name}" fetched ${users.length} users for tenant ${tenantId}`)

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