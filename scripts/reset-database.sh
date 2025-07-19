#!/bin/bash

echo "🔄 Resetting Mzansi Footwear Admin Database..."

# Step 1: Reset Prisma database
echo "📊 Resetting database schema..."
npx prisma db push --force-reset

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Seed database with initial data
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database reset complete!"
echo "🎉 Ready for development!"
