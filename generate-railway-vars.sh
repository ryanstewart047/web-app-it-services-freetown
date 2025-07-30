#!/bin/bash

# Railway Environment Variables Generator
# This script helps generate secure secrets for Railway deployment

echo "🚀 Railway Environment Variables Generator"
echo "=========================================="
echo ""

echo "📧 Email Configuration:"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=587"
echo "SMTP_USER=itservicesfreetown@gmail.com"
echo "FROM_EMAIL=support@itservicesfreetown.com"
echo ""

echo "🔐 Generated Secrets:"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "SOCKET_IO_SECRET=$(openssl rand -base64 32)"
echo ""

echo "🤖 AI Configuration:"
echo "GEMINI_API_KEY=AIzaSyDinSiRr6Gya3Q3Gy5f-Mx5otdOR7qg9q4"
echo ""

echo "📝 Manual Setup Required:"
echo "========================"
echo "1. SMTP_PASS - Get Gmail App Password from Google Account Settings"
echo "2. DATABASE_URL - Will be auto-generated when you add PostgreSQL service"
echo "3. NEXTAUTH_URL - Set to your Railway domain (https://your-app.up.railway.app)"
echo ""

echo "📋 Copy the values above to your Railway project variables!"
echo ""
echo "For detailed setup instructions, see: RAILWAY_ENV_SETUP.md"
