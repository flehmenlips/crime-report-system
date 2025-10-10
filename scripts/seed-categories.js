const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultCategories = [
  { name: 'electronics', description: 'Electronic devices and equipment', sortOrder: 1 },
  { name: 'jewelry', description: 'Jewelry and precious items', sortOrder: 2 },
  { name: 'vehicles', description: 'Cars, motorcycles, bicycles, etc.', sortOrder: 3 },
  { name: 'tools', description: 'Hand tools, power tools, equipment', sortOrder: 4 },
  { name: 'clothing', description: 'Clothing and accessories', sortOrder: 5 },
  { name: 'furniture', description: 'Furniture and home decor', sortOrder: 6 },
  { name: 'documents', description: 'Important documents and papers', sortOrder: 7 },
  { name: 'livestock', description: 'Farm animals and livestock', sortOrder: 8 },
  { name: 'fencing', description: 'Fencing materials and equipment', sortOrder: 9 },
  { name: 'appliance', description: 'Household appliances', sortOrder: 10 },
  { name: 'other', description: 'Other items not categorized', sortOrder: 11 }
]

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...')

    // Get all tenants
    const tenants = await prisma.tenant.findMany()
    console.log(`Found ${tenants.length} tenants`)

    for (const tenant of tenants) {
      console.log(`\n📝 Seeding categories for tenant: ${tenant.name} (${tenant.id})`)
      
      for (const category of defaultCategories) {
        // Check if category already exists
        const existing = await prisma.category.findUnique({
          where: {
            tenantId_name: {
              tenantId: tenant.id,
              name: category.name
            }
          }
        })

        if (existing) {
          console.log(`  ✅ Category "${category.name}" already exists`)
          continue
        }

        // Create the category
        await prisma.category.create({
          data: {
            name: category.name,
            description: category.description,
            tenantId: tenant.id,
            createdBy: 'system',
            isSystem: true,
            sortOrder: category.sortOrder
          }
        })

        console.log(`  ➕ Created category: "${category.name}"`)
      }
    }

    console.log('\n🎉 Category seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedCategories()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
