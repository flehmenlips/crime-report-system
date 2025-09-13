const { PrismaClient } = require('@prisma/client');

// Old SQLite client (update path if needed)
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'  // Relative to prisma folder; adjust if necessary
    }
  }
});

// New PostgreSQL client (uses DATABASE_URL from .env)
const newPrisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Step 1: Read from old DB
    console.log('Reading data from SQLite...');
    const users = await oldPrisma.user.findMany();
    const items = await oldPrisma.stolenItem.findMany();
    const evidence = await oldPrisma.evidence.findMany();

    console.log(`Found ${users.length} users, ${items.length} items, ${evidence.length} evidence records.`);

    // Step 2: Clear new DB (optional - comment out if you don't want to wipe existing data)
    // await newPrisma.evidence.deleteMany();
    // await newPrisma.stolenItem.deleteMany();
    // await newPrisma.user.deleteMany();

    // Step 3: Migrate Users (preserve IDs using createMany with skipDuplicates)
    console.log('Migrating users...');
    await newPrisma.user.createMany({
      data: users,
      skipDuplicates: true
    });

    // Step 4: Migrate Items
    console.log('Migrating items...');
    await newPrisma.stolenItem.createMany({
      data: items,
      skipDuplicates: true
    });

    // Step 5: Migrate Evidence
    console.log('Migrating evidence...');
    await newPrisma.evidence.createMany({
      data: evidence,
      skipDuplicates: true
    });

    console.log('Migration complete! Verify data in new DB.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

// Wrap async function for CommonJS
(async () => {
  await migrateData();
})().catch(e => {
  console.error('Script failed:', e);
  process.exit(1);
});
