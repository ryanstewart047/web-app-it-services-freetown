#!/bin/bash

# Vercel Environment Variables Generator
# This script helps generate the environment variables needed for Vercel deployment

echo "🚀 Vercel Environment Variables Generator"
echo "=========================================="
echo ""

# Generate secure secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SOCKET_IO_SECRET=$(openssl rand -base64 32)

echo "To set up your environment variables in Vercel, you will need to add the following:"
echo ""
echo "Database Configuration:"
echo "DATABASE_URL=your_database_url_here"
echo ""

echo "📧 Email Configuration:"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=587"
echo "SMTP_SECURE=false"
echo "SMTP_USER=your_email@gmail.com"
echo "SMTP_PASSWORD=your_app_password"
echo "FROM_EMAIL=support@itservicesfreetown.com"
echo ""

echo "🔐 Generated Secrets (copy these values):"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "SOCKET_IO_SECRET=$SOCKET_IO_SECRET"
echo ""

echo "📝 Instructions:"
echo "1. Create a free account on Vercel.com"
echo "2. Connect your GitHub repository"
echo "3. During setup, click on 'Environment Variables'"
echo "4. Add each of the variables listed above"
echo "5. For DATABASE_URL, you can use:"
echo "   - PlanetScale (free tier): https://planetscale.com"
echo "   - Supabase Postgres (free tier): https://supabase.com"
echo "   - Neon Postgres (free tier): https://neon.tech"
echo ""
echo "✅ After deployment, update the form action in book-appointment.html to point to '/api/appointments' instead of 'process-appointment.php'"
echo ""
