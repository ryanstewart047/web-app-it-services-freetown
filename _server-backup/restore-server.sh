#!/bin/bash

# Server Deployment Restoration Script
# Run this script to restore full server functionality

echo "🔄 Restoring server deployment configuration..."

# Restore API routes
echo "📁 Restoring API routes..."
cp -r _server-backup/api app/

# Restore Prisma configuration
echo "🗄️ Restoring database configuration..."
cp _server-backup/schema.prisma prisma/ 2>/dev/null || true
cp -r _server-backup/migrations prisma/ 2>/dev/null || true

# Restore server libraries
echo "📚 Restoring server libraries..."
cp _server-backup/lib/* lib/ 2>/dev/null || true

# Restore server configuration
echo "⚙️ Restoring server configuration..."
cp _server-backup/next.config.server.js next.config.js

# Copy environment template
echo "🔧 Creating environment template..."
cp _server-backup/.env.server.example .env.example

# Install server dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate 2>/dev/null || true

echo "✅ Server deployment configuration restored!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in .env.local"
echo "2. Configure your database"
echo "3. Run: npx prisma migrate deploy"
echo "4. Deploy to your server platform (Vercel, Netlify, etc.)"
