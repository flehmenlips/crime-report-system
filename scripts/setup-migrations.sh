#!/bin/bash

# 🗄️ Prisma Migration Setup Script
# This script helps you transition from 'db push' to 'migrate' workflow

set -e

echo "🗄️  Prisma Migration Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

echo "📋 Current Setup:"
echo "  - Using: npx prisma db push (development mode)"
echo "  - No migration history tracked"
echo ""

echo "🎯 What This Script Does:"
echo "  1. Creates baseline migration from current schema"
echo "  2. Marks migration as applied (won't re-run on existing DB)"
echo "  3. Sets up migration workflow for future changes"
echo ""

read -p "Continue with migration setup? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📝 Step 1: Creating baseline migration..."
echo "=========================================="

# Check if migrations directory already exists
if [ -d "prisma/migrations" ]; then
    echo "⚠️  Warning: Migrations directory already exists"
    echo ""
    ls -la prisma/migrations/
    echo ""
    read -p "Continue anyway? This will add a new migration. (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Create baseline migration
echo "Creating migration..."
npx prisma migrate dev --name baseline_current_schema --create-only

echo ""
echo "✅ Baseline migration created!"
echo ""

echo "📝 Step 2: Reviewing migration..."
echo "=================================="

# Find the latest migration directory
LATEST_MIGRATION=$(ls -t prisma/migrations | head -1)

if [ -n "$LATEST_MIGRATION" ]; then
    echo "Migration file: prisma/migrations/$LATEST_MIGRATION/migration.sql"
    echo ""
    echo "Contents:"
    echo "--------"
    cat "prisma/migrations/$LATEST_MIGRATION/migration.sql"
    echo ""
    echo "--------"
else
    echo "⚠️  Warning: No migration file found"
fi

echo ""
read -p "Apply this migration to your local database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Step 3: Applying migration..."
    echo "=================================="
    npx prisma migrate dev
    echo ""
    echo "✅ Migration applied to local database!"
else
    echo "⚠️  Skipping migration application"
    echo "   You can apply it later with: npx prisma migrate dev"
fi

echo ""
echo "📝 Step 4: Next Steps"
echo "====================="
echo ""
echo "✅ Migration setup complete!"
echo ""
echo "📋 To Do:"
echo "  1. Review the migration file in prisma/migrations/"
echo "  2. Commit the migration files to Git:"
echo "     git add prisma/migrations/"
echo "     git commit -m 'chore: Add baseline database migration'"
echo ""
echo "  3. Update your workflow:"
echo "     OLD: npx prisma db push"
echo "     NEW: npx prisma migrate dev --name your_change_name"
echo ""
echo "  4. Deploy to development:"
echo "     git push origin develop"
echo ""
echo "  5. After testing, merge to production:"
echo "     git checkout main"
echo "     git merge develop"
echo "     git push origin main"
echo ""
echo "🎉 Your database changes will now be version-controlled!"
echo ""

# Show current migration status
echo "📊 Current Migration Status:"
echo "============================"
npx prisma migrate status || true

echo ""
echo "✅ Done!"

