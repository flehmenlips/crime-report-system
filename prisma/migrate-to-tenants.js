const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToTenants() {
  console.log('🏢 Starting tenant migration...')
  
  try {
    // Step 1: Create the default "Birkenfeld Farm" tenant
    console.log('📝 Creating default tenant...')
    const defaultTenant = await prisma.tenant.upsert({
      where: { id: 'tenant-1' },
      update: {},
      create: {
        id: 'tenant-1',
        name: 'Birkenfeld Farm',
        description: 'Original Birkenfeld Farm theft case',
        isActive: true
      }
    })
    console.log('✅ Created tenant:', defaultTenant.name)

    // Step 2: Update all existing users to use the default tenant
    console.log('👥 Updating users...')
    const updatedUsers = await prisma.user.updateMany({
      where: {
        tenantId: null
      },
      data: {
        tenantId: 'tenant-1'
      }
    })
    console.log(`✅ Updated ${updatedUsers.count} users`)

    // Step 3: Update all existing stolen items to use the default tenant
    console.log('📦 Updating stolen items...')
    const updatedItems = await prisma.stolenItem.updateMany({
      where: {
        tenantId: null
      },
      data: {
        tenantId: 'tenant-1'
      }
    })
    console.log(`✅ Updated ${updatedItems.count} stolen items`)

    // Step 4: Add accessLevel to users (default to 'owner' for existing users)
    console.log('🔐 Adding access levels...')
    const updatedAccessLevels = await prisma.user.updateMany({
      where: {
        accessLevel: null
      },
      data: {
        accessLevel: 'owner'
      }
    })
    console.log(`✅ Updated access levels for ${updatedAccessLevels.count} users`)

    console.log('🎉 Migration completed successfully!')
    
    // Show summary
    const userCount = await prisma.user.count()
    const itemCount = await prisma.stolenItem.count()
    const tenantCount = await prisma.tenant.count()
    
    console.log('\n📊 Migration Summary:')
    console.log(`- Tenants: ${tenantCount}`)
    console.log(`- Users: ${userCount}`)
    console.log(`- Stolen Items: ${itemCount}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateToTenants()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
