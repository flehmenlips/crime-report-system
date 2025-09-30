const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createSuperAdmin() {
  console.log('🔧 Creating SuperAdmin account...')

  try {
    // Check if superadmin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    })

    if (existingAdmin) {
      console.log('✅ SuperAdmin account already exists:', existingAdmin.email)
      return
    }

    // Create system tenant for superadmin
    const systemTenant = await prisma.tenant.create({
      data: {
        name: 'System Administration',
        description: 'System administration tenant for platform management',
        isActive: true,
      }
    })

    console.log('📊 Created system tenant:', systemTenant.id)

    // Create superadmin user
    const superAdmin = await prisma.user.create({
      data: {
        username: 'superadmin',
        email: 'admin@system.com',
        name: 'System Administrator',
        password: 'admin123', // In production, this should be hashed
        role: 'super_admin',
        accessLevel: 'owner',
        phone: '+1 (555) 000-0000',
        address: 'System Admin',
        city: 'System',
        state: 'System',
        zipCode: '00000',
        country: 'United States',
        company: 'Crime Report System',
        title: 'Super Administrator',
        bio: 'System administrator with full access to all tenants and system management.',
        emailVerified: true,
        isActive: true,
        tenantId: systemTenant.id,
      }
    })

    console.log('✅ SuperAdmin account created successfully!')
    console.log('📧 Email: admin@system.com')
    console.log('👤 Username: superadmin')
    console.log('🔑 Password: admin123')
    console.log('🆔 User ID:', superAdmin.id)
    console.log('🏢 Tenant ID:', systemTenant.id)

  } catch (error) {
    console.error('❌ Error creating SuperAdmin account:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
