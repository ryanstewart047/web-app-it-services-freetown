#!/bin/bash

echo "🚀 Starting IT Services Freetown application..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Check if database is accessible and push schema
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Setting up database..."
    npx prisma db push --accept-data-loss || echo "⚠️ Database setup failed or already exists"
else
    echo "⚠️ DATABASE_URL not found, skipping database setup"
fi

# Start the application
echo "🌟 Starting Next.js application..."
exec npm run next:start
