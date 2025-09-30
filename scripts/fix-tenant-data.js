const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixTenantData() {
  try {
    console.log('🔧 Starting tenant data fix...')

    // 1. Create missing tenants for existing data
    const existingTenants = await prisma.tenant.findMany()
    console.log(`📊 Found ${existingTenants.length} existing tenants`)

    // Get all unique tenant IDs from users and items
    const users = await prisma.user.findMany({
      select: { tenantId: true }
    })
    const items = await prisma.stolenItem.findMany({
      select: { tenantId: true }
    })

    const allTenantIds = new Set([
      ...users.map(u => u.tenantId).filter(Boolean),
      ...items.map(i => i.tenantId).filter(Boolean)
    ])

    console.log(`📋 Found ${allTenantIds.size} unique tenant IDs in use`)

    // Create missing tenants
    for (const tenantId of allTenantIds) {
      const exists = existingTenants.find(t => t.id === tenantId)
      if (!exists) {
        console.log(`➕ Creating missing tenant: ${tenantId}`)
        await prisma.tenant.create({
          data: {
            id: tenantId,
            name: tenantId === 'tenant-1' ? 'Birkenfeld Farm' : `Tenant ${tenantId}`,
            description: tenantId === 'tenant-1' ? 'Original Birkenfeld Farm theft case' : `Auto-generated tenant for ${tenantId}`,
            isActive: true
          }
        })
      }
    }

    // 2. Update users with null tenantId to default tenant
    const usersWithoutTenant = await prisma.user.findMany({
      where: { tenantId: null }
    })
    
    if (usersWithoutTenant.length > 0) {
      console.log(`👥 Updating ${usersWithoutTenant.length} users with null tenantId`)
      await prisma.user.updateMany({
        where: { tenantId: null },
        data: { tenantId: 'tenant-1' }
      })
    }

    // 3. Update items with null tenantId to default tenant
    const itemsWithoutTenant = await prisma.stolenItem.findMany({
      where: { tenantId: null }
    })
    
    if (itemsWithoutTenant.length > 0) {
      console.log(`📦 Updating ${itemsWithoutTenant.length} items with null tenantId`)
      await prisma.stolenItem.updateMany({
        where: { tenantId: null },
        data: { tenantId: 'tenant-1' }
      })
    }

    console.log('✅ Tenant data fix completed successfully!')
  } catch (error) {
    console.error('❌ Error fixing tenant data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixTenantData()
