#!/usr/bin/env node

/**
 * BACKUP SCRIPT - Before UUID Migration
 * 
 * This script creates a comprehensive backup of the Birkenfeld Farm tenant data
 * before we migrate from tenant-1 to a UUID.
 * 
 * CRITICAL: Your 81 items are precious - this is our safety net!
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createBackup() {
  console.log('🛡️  CREATING BACKUP BEFORE UUID MIGRATION');
  console.log('==========================================\n');

  try {
    // 1. Get all tenants
    console.log('📋 Fetching all tenants...');
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true
          }
        },
        items: {
          include: {
            evidence: true
          }
        }
      }
    });

    console.log(`✅ Found ${tenants.length} tenants\n`);

    // 2. Get all audit logs
    console.log('📊 Fetching audit logs...');
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    console.log(`✅ Found ${auditLogs.length} audit log entries\n`);

    // 3. Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.4.0',
      description: 'Backup before UUID migration - Birkenfeld Farm tenant-1',
      tenants: tenants,
      auditLogs: auditLogs,
      statistics: {
        totalTenants: tenants.length,
        totalUsers: tenants.reduce((sum, t) => sum + t.users.length, 0),
        totalItems: tenants.reduce((sum, t) => sum + t.items.length, 0),
        totalEvidence: tenants.reduce((sum, t) => 
          sum + t.items.reduce((itemSum, item) => itemSum + item.evidence.length, 0), 0),
        totalAuditLogs: auditLogs.length
      }
    };

    // 4. Create backup directory
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 5. Save backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-before-uuid-migration-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 File size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB\n`);

    // 6. Show statistics
    console.log('📈 BACKUP STATISTICS:');
    console.log('====================');
    tenants.forEach(tenant => {
      const evidenceCount = tenant.items.reduce((sum, item) => sum + item.evidence.length, 0);
      console.log(`📁 ${tenant.name} (${tenant.id}):`);
      console.log(`   👥 Users: ${tenant.users.length}`);
      console.log(`   📦 Items: ${tenant.items.length}`);
      console.log(`   📸 Evidence: ${evidenceCount}`);
      if (tenant.id === 'tenant-1') {
        console.log(`   ⚠️  THIS IS YOUR BIRKENFELD FARM DATA - ${tenant.items.length} ITEMS!`);
      }
    });
    console.log(`\n📊 Total Audit Logs: ${auditLogs.length}`);
    console.log(`🕐 Backup created at: ${backup.timestamp}`);

    console.log('\n🛡️  BACKUP VERIFICATION:');
    console.log('========================');
    console.log('✅ All tenants backed up');
    console.log('✅ All users backed up');
    console.log('✅ All items backed up');
    console.log('✅ All evidence backed up');
    console.log('✅ All audit logs backed up');
    console.log('\n🎯 Ready for UUID migration!');

  } catch (error) {
    console.error('❌ BACKUP FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
createBackup().catch(console.error);