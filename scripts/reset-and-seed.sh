#!/bin/bash

echo "🔄 Resetting database and seeding with fresh data..."

# Reset the database (this will also run migrations)
echo "📥 Resetting database..."
pnpm db:reset --force

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Apply migrations to ensure tables exist
echo "⬆️ Applying migrations..."
pnpm prisma migrate deploy

# Run the seed script
echo "🌱 Seeding database..."
pnpm db:seed

echo "✅ Database reset and seeded successfully!"
echo ""
echo "🔑 You can now login with:"
echo "Email: admin@mzansifootwear.com"
echo "Password: admin123"
