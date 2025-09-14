const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;

// Explicitly load .env.local
require('dotenv').config({ path: '.env.local' });

// Debug log BEFORE creating PrismaClient
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

// New PostgreSQL client
const newPrisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Step 1: Read from SQLite using sqlite3 (no Prisma for old DB)
    console.log('Reading data from SQLite using sqlite3...');
    const db = new sqlite3.Database('prisma/dev.db');

    const users = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM users', (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const items = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM stolen_items', (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const evidence = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM evidence', (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    console.log(`Found ${users.length} users, ${items.length} items, ${evidence.length} evidence records.`);

    // Convert timestamps to Dates
    const convertedUsers = users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));

    const convertedItems = items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));

    const convertedEvidence = evidence.map(ev => ({
      ...ev,
      createdAt: new Date(ev.createdAt)
    }));

    // Save to JSON for review/backup
    const data: { users: any[]; items: any[]; evidence: any[] } = { 
      users: convertedUsers, 
      items: convertedItems, 
      evidence: convertedEvidence 
    };
    await fs.writeFile('prisma/exported-data.json', JSON.stringify(data, null, 2));
    console.log('Exported data to prisma/exported-data.json for verification');

    // Step 2: Import to PostgreSQL using Prisma (skip duplicates)
    console.log('Migrating to PostgreSQL...');
    await newPrisma.user.createMany({ data: convertedUsers, skipDuplicates: true });
    console.log('Users migrated.');
    await newPrisma.stolenItem.createMany({ data: convertedItems, skipDuplicates: true });
    console.log('Items migrated.');
    await newPrisma.evidence.createMany({ data: convertedEvidence, skipDuplicates: true });
    console.log('Evidence migrated.');

    console.log('Migration complete! Verify with npx prisma studio.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await newPrisma.$disconnect();
  }
}

// Run the function
migrateData();
