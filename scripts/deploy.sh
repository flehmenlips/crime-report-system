#!/bin/bash

# Multi-tenant deployment script for Render.com
echo "🚀 Starting multi-tenant deployment..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Push schema changes (with optional tenant columns)
echo "🗄️ Pushing database schema changes..."
npx prisma db push --accept-data-loss

# Step 4: Run tenant migration
echo "🏢 Running tenant migration..."
npm run migrate:tenants

# Step 5: Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Deployment completed successfully!"
