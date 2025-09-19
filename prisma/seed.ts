import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const georgeUser = await prisma.user.upsert({
    where: { username: 'george' },
    update: {},
    create: {
      username: 'george',
      email: 'george@birkenfeldfarm.com',
      name: 'George Page',
      password: 'password',
      role: 'property_owner'
    }
  })

  const citizenUser = await prisma.user.upsert({
    where: { username: 'citizen' },
    update: {},
    create: {
      username: 'citizen',
      email: 'citizen@birkenfeldfarm.com',
      name: 'George Page',
      password: 'password',
      role: 'property_owner'
    }
  })

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'officer@police.gov',
      name: 'Police Officer',
      password: 'password',
      role: 'law_enforcement'
    }
  })

  // Create stolen items
  const items = [
    {
      name: 'John Deere Tractor Model 8R 250',
      description: 'Large agricultural tractor, green and yellow color scheme, with front loader attachment and GPS guidance system',
      serialNumber: 'JD8R250-2023-001',
      purchaseDate: '2023-03-15',
      purchaseCost: 285000,
      dateLastSeen: '2023-12-20',
      locationLastSeen: 'Main barn equipment storage area, Birkenfeld Farm',
      estimatedValue: 320000,
      category: 'tractors',
      tags: '["john deere", "tractor", "agricultural equipment", "gps"]',
      ownerId: georgeUser.id
    },
    {
      name: 'Case IH Magnum 255 Tractor',
      description: 'High-horsepower row crop tractor with precision ag technology and automated steering',
      serialNumber: 'CIHM255-2022-045',
      purchaseDate: '2022-08-22',
      purchaseCost: 245000,
      dateLastSeen: '2023-12-20',
      locationLastSeen: 'Equipment shed #2, southeast corner of property',
      estimatedValue: 275000,
      category: 'tractors',
      tags: '["case ih", "tractor", "precision ag", "steering"]',
      ownerId: georgeUser.id
    },
    {
      name: 'Kuhn Krause 5810 Disc Harrow',
      description: '48-foot wide tandem disc harrow with hydraulic depth control and transport wheels',
      serialNumber: 'KK5810-2021-112',
      purchaseDate: '2021-11-10',
      purchaseCost: 185000,
      dateLastSeen: '2023-12-19',
      locationLastSeen: 'Field equipment storage area, north of main barn',
      estimatedValue: 210000,
      category: 'equipment',
      tags: '["kuhn krause", "disc harrow", "field equipment"]',
      ownerId: georgeUser.id
    },
    {
      name: 'New Holland CR10.90 Combine',
      description: 'High-capacity grain combine harvester with automated yield monitoring and straw chopper',
      serialNumber: 'NHCR1090-2020-078',
      purchaseDate: '2020-06-15',
      purchaseCost: 425000,
      dateLastSeen: '2023-12-20',
      locationLastSeen: 'Combine shed, west side of property',
      estimatedValue: 480000,
      category: 'equipment',
      tags: '["new holland", "combine", "harvester", "grain"]',
      ownerId: georgeUser.id
    },
    {
      name: 'Fendt 930 Vario Tractor',
      description: '930 horsepower articulated tractor with continuously variable transmission and ISOBUS compatibility',
      serialNumber: 'F930V-2019-034',
      purchaseDate: '2019-09-28',
      purchaseCost: 385000,
      dateLastSeen: '2023-12-19',
      locationLastSeen: 'Heavy equipment parking area, south of main barn',
      estimatedValue: 420000,
      category: 'tractors',
      tags: '["fendt", "tractor", "vario", "isobus"]',
      ownerId: georgeUser.id
    }
  ]

  for (const itemData of items) {
    const item = await prisma.stolenItem.upsert({
      where: { 
        id: items.indexOf(itemData) + 1 
      },
      update: {},
      create: itemData
    })

    // Add sample evidence
    const evidenceTypes = [
      { type: 'photo', cloudinaryId: `crime_report/${item.name.toLowerCase().replace(/\s+/g, '_')}_main_view` },
      { type: 'photo', cloudinaryId: `crime_report/${item.name.toLowerCase().replace(/\s+/g, '_')}_side_view` },
      { type: 'document', cloudinaryId: `crime_report/${item.name.toLowerCase().replace(/\s+/g, '_')}_receipt` },
      { type: 'document', cloudinaryId: `crime_report/${item.name.toLowerCase().replace(/\s+/g, '_')}_manual` }
    ]

    for (const evidence of evidenceTypes) {
      await prisma.evidence.upsert({
        where: {
          id: (items.indexOf(itemData) * 10) + evidenceTypes.indexOf(evidence) + 1
        },
        update: {},
        create: {
          ...evidence,
          itemId: item.id,
          originalName: `${evidence.cloudinaryId.split('/').pop()}.${evidence.type === 'photo' ? 'jpg' : 'pdf'}`
        }
      })
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
