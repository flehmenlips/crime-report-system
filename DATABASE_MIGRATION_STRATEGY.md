# 🗄️ Database Migration Strategy: Dev to Production

## The Critical Question: What Happens When You Merge?

### ⚠️ **Short Answer: Code merges automatically, database changes DO NOT.**

---

## 🎯 Understanding the Problem

```
┌─────────────────────────────────────────────────────────┐
│           What Happens When You Merge                   │
└─────────────────────────────────────────────────────────┘

Development Branch (develop):
  ├─ Code changes: ✅ Merge to main
  ├─ Schema changes: ✅ Merge to main (as Prisma files)
  └─ Database data: ❌ DOES NOT MERGE

Production Database:
  ├─ Still has old schema
  ├─ Prisma schema file is updated (code)
  └─ Actual database structure is UNCHANGED
```

### **What This Means:**

```
Scenario: You add a new field to User model

Development:
  1. Update prisma/schema.prisma
  2. Run: npx prisma db push
  3. Dev database now has new field
  4. Test your code with new field
  5. Merge to main ✅

Production (After Merge):
  ├─ prisma/schema.prisma: ✅ Updated (merged)
  ├─ Production Database: ❌ Still old structure
  └─ Build fails or runtime errors! 💥
```

---

## 🚨 Common Problems & Solutions

### **Problem 1: Build Failures**

```bash
# After merging to main, Render build fails:
Error: Prisma schema and database are out of sync
Field 'newField' does not exist in database
```

**Why:** Your code expects the new field, but production database doesn't have it yet.

### **Problem 2: Runtime Errors**

```bash
# Even if build succeeds:
PrismaClientValidationError: Unknown field 'newField'
Database query failed: Column does not exist
```

**Why:** Application tries to use new fields that don't exist in production database.

### **Problem 3: Data Loss**

```bash
# If you change/remove fields without migrations:
⚠️  Data in removed fields is permanently deleted
⚠️  No way to recover without database backup
```

**Why:** `prisma db push` doesn't track history - it just forces the database to match.

---

## ✅ The Solution: Database Migrations

### **What Are Migrations?**

Migrations are **version-controlled SQL scripts** that track every database change:

```
prisma/migrations/
  ├─ 20250913042655_initial_migration/
  │   └─ migration.sql  (CREATE TABLE users...)
  ├─ 20251010153000_add_user_bio/
  │   └─ migration.sql  (ALTER TABLE users ADD COLUMN bio...)
  └─ 20251015120000_add_tenant_settings/
      └─ migration.sql  (CREATE TABLE tenant_settings...)
```

**Benefits:**
- ✅ **Version controlled** (tracked in Git)
- ✅ **Reversible** (can roll back)
- ✅ **Documented** (clear history of changes)
- ✅ **Safe** (prevents data loss)
- ✅ **Deployable** (runs automatically in production)

---

## 🔧 Current vs Recommended Approach

### **Your Current Approach (Development Mode):**

```bash
# What you're doing now:
npx prisma db push
```

**Pros:**
- ✅ Fast for development
- ✅ Immediate feedback
- ✅ No migration files to manage

**Cons:**
- ❌ No migration history
- ❌ Can't roll back changes
- ❌ Risk of data loss
- ❌ Production database not updated automatically
- ❌ No safety checks

### **Recommended Approach (Migration Mode):**

```bash
# What you should do:
npx prisma migrate dev --name add_user_bio
```

**Pros:**
- ✅ Creates migration file (tracked in Git)
- ✅ Safe data transformations
- ✅ Can roll back if needed
- ✅ Production database updates automatically
- ✅ Clear audit trail

**Cons:**
- ⚠️ Slightly more setup
- ⚠️ Need to name each migration

---

## 🚀 Recommended Workflow: Prisma Migrate

### **Step 1: Update Schema in Development**

```bash
# On develop branch
cd CrimeReport

# Edit prisma/schema.prisma
# Example: Add a new field to User model
```

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  name     String
  bio      String? // ← New field added
  // ... other fields
}
```

### **Step 2: Create Migration**

```bash
# Generate migration file
npx prisma migrate dev --name add_user_bio

# This will:
# 1. Create prisma/migrations/TIMESTAMP_add_user_bio/migration.sql
# 2. Apply migration to dev database
# 3. Regenerate Prisma Client
```

**Generated migration.sql:**
```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "bio" TEXT;
```

### **Step 3: Test Locally**

```bash
# Your dev database now has the new field
# Test your application with the changes
npm run dev

# Test thoroughly:
# - Create new users (with bio)
# - Update existing users (add bio)
# - Query users (access bio field)
```

### **Step 4: Commit Changes**

```bash
# Commit BOTH schema.prisma AND migration files
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "feat: Add bio field to User model"
git push origin develop
```

### **Step 5: Deploy to Development Server**

```bash
# Development Render service automatically:
# 1. Pulls latest code (including migration files)
# 2. Runs: npx prisma migrate deploy (in build command)
# 3. Applies migration to dev database
# 4. Builds application
```

**Update Render build command for dev service:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### **Step 6: Merge to Production**

```bash
# After thorough testing on dev
git checkout main
git merge develop
git tag -a v2.3.0 -m "Release v2.3.0: Add user bio feature"
git push origin main
git push origin v2.3.0
```

### **Step 7: Production Deployment**

```bash
# Production Render service automatically:
# 1. Pulls latest code
# 2. Runs: npx prisma migrate deploy
# 3. Applies ALL pending migrations to production database
# 4. Builds application
# ✅ Production database now has new field!
```

**Update Render build command for production:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

---

## 🔄 Complete Migration Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                Development Environment                       │
└─────────────────────────────────────────────────────────────┘
                            │
    1. Edit schema.prisma   │
    2. prisma migrate dev   │
    3. Test locally         │
                            ▼
                    ┌───────────────┐
                    │ Git Commit    │
                    │ - schema.prisma
                    │ - migrations/  │
                    └───────┬───────┘
                            │
                    4. Push to develop
                            │
                            ▼
                ┌─────────────────────┐
                │  Dev Render Service │
                │  (Auto-deploy)      │
                └─────────────────────┘
                            │
                    5. Runs: prisma migrate deploy
                            │
                            ▼
                ┌─────────────────────┐
                │  Dev Database       │
                │  ✅ Schema updated  │
                └─────────────────────┘
                            │
                    6. Test on dev site
                    7. Verify everything works
                            │
                            ▼
                    ┌───────────────┐
                    │  Merge to     │
                    │  main         │
                    └───────┬───────┘
                            │
                    8. Push to main
                            │
                            ▼
                ┌─────────────────────┐
                │  Prod Render Service│
                │  (Auto-deploy)      │
                └─────────────────────┘
                            │
                    9. Runs: prisma migrate deploy
                            │
                            ▼
                ┌─────────────────────┐
                │  Production Database│
                │  ✅ Schema updated  │
                └─────────────────────┘
```

---

## 🛡️ Safety Features of Migrations

### **1. Data Preservation**

Migrations can safely transform data:

```sql
-- Example: Renaming a field without data loss
-- Step 1: Add new field
ALTER TABLE "users" ADD COLUMN "full_name" TEXT;

-- Step 2: Copy data
UPDATE "users" SET "full_name" = "name";

-- Step 3: Remove old field
ALTER TABLE "users" DROP COLUMN "name";
```

### **2. Rollback Capability**

```bash
# If something goes wrong, roll back to previous migration
npx prisma migrate resolve --rolled-back <migration_name>
```

### **3. Migration History**

```bash
# See all applied migrations
npx prisma migrate status

# Output:
# ✅ 20250913042655_initial_migration
# ✅ 20251010153000_add_user_bio
# ⏳ 20251015120000_add_tenant_settings (pending)
```

### **4. Conflict Detection**

```bash
# Prisma detects if databases are out of sync
# and warns you before applying changes
⚠️  Warning: Database schema drift detected
```

---

## 🎯 Updating Your Current Setup

### **Step 1: Switch from `db push` to `migrate`**

**Current Render build commands:**
```bash
# ❌ Current (risky):
npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build

# ✅ Recommended:
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### **Step 2: Create Initial Migration (One-Time)**

```bash
# On your local machine, on develop branch:
cd CrimeReport

# Create baseline migration from current schema
npx prisma migrate dev --name baseline_migration

# This creates migration files from your current schema
# and marks them as applied to your local database
```

### **Step 3: Update Render Services**

**Development Service:**
1. Go to Render Dashboard → Your dev service
2. Click "Environment" tab
3. Update "Build Command":
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

**Production Service:**
1. Go to Render Dashboard → Your production service
2. Click "Environment" tab
3. Update "Build Command":
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### **Step 4: Apply Baseline to Production**

```bash
# Commit and push baseline migration
git add prisma/migrations/
git commit -m "chore: Add baseline database migration"
git push origin develop

# After testing, merge to main
git checkout main
git merge develop
git push origin main

# Production will automatically run: prisma migrate deploy
# This applies the baseline migration (marks current state)
```

---

## 📋 Migration Best Practices

### **1. Always Test Migrations First**

```
✅ Test on local dev database
✅ Test on Render dev environment
✅ Verify data integrity
✅ Check application functionality
❌ Never test directly on production
```

### **2. Descriptive Migration Names**

```bash
# ✅ Good names:
npx prisma migrate dev --name add_user_bio_field
npx prisma migrate dev --name create_tenant_settings_table
npx prisma migrate dev --name rename_owner_to_user_id

# ❌ Bad names:
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### **3. Small, Focused Migrations**

```
✅ One migration per feature/change
✅ Easy to review and understand
✅ Easy to roll back if needed

❌ Avoid huge migrations with many changes
❌ Hard to debug if something breaks
```

### **4. Backup Before Major Changes**

```bash
# Before destructive changes (removing fields/tables):

# 1. Export data from Render dashboard
# 2. Or use pg_dump:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 3. Test migration on dev first
# 4. Keep backup for 30 days
```

### **5. Document Breaking Changes**

```bash
# In migration commit message:
git commit -m "feat: Add tenant isolation

BREAKING CHANGE: All queries now require tenantId.
Requires data migration to set default tenant for existing records."
```

---

## 🔧 Common Migration Scenarios

### **Scenario 1: Adding a Required Field**

```prisma
model User {
  id       String @id
  email    String @unique
  tenantId String // ← New required field
}
```

**Problem:** Existing users don't have tenantId

**Solution:** Two-step migration

```bash
# Step 1: Add as optional
npx prisma migrate dev --name add_tenant_id_optional

# Step 2: Update existing data, then make required
npx prisma migrate dev --name make_tenant_id_required
```

### **Scenario 2: Renaming a Field**

```prisma
model StolenItem {
  id          Int @id
  description String // ← Was 'desc', now 'description'
}
```

**Migration handles this:**
```sql
ALTER TABLE "stolen_items" RENAME COLUMN "desc" TO "description";
```

### **Scenario 3: Changing Field Type**

```prisma
model StolenItem {
  id    Int @id
  value Float // ← Was Int, now Float
}
```

**Migration handles conversion:**
```sql
ALTER TABLE "stolen_items" ALTER COLUMN "value" TYPE DOUBLE PRECISION;
```

---

## 🎯 Summary: What Happens When You Merge?

### **Without Migrations (Current Setup):**
```
1. Merge code to main ✅
2. Production builds ✅
3. Database unchanged ❌
4. Application crashes 💥
5. Manual intervention needed 🚨
```

### **With Migrations (Recommended):**
```
1. Merge code + migrations to main ✅
2. Production runs: prisma migrate deploy ✅
3. Database automatically updated ✅
4. Application works perfectly ✅
5. Fully automated 🎉
```

---

## 🚀 Action Plan

**Immediate Steps:**

- [ ] Create baseline migration locally
- [ ] Update Render build commands (both dev and prod)
- [ ] Test migration workflow on develop branch
- [ ] Commit migration files to Git
- [ ] Update documentation

**Going Forward:**

- [ ] Use `prisma migrate dev` instead of `prisma db push`
- [ ] Always commit migration files
- [ ] Test on dev environment before production
- [ ] Keep database backups for major changes

---

## 📖 Additional Resources

- **Prisma Migrate Docs:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Migration Workflows:** https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate
- **Troubleshooting:** https://www.prisma.io/docs/guides/database/production-troubleshooting

---

## 🎉 Conclusion

**The key insight:**

> Code changes merge automatically through Git.
> Database changes must be tracked as migration files.
> Migration files are code that Git tracks and deploys.

By using Prisma Migrate, your database schema changes become **version-controlled, automated, and safe** - just like your application code!

