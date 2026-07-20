#!/bin/bash

# Admin Password Setup Script
# Generates secure password hash for admin authentication

echo "🔐 Admin Password Setup"
echo "======================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

echo "This script will help you set up a secure admin password."
echo ""

# Prompt for password
echo "Enter your new admin password (12+ characters recommended):"
read -s PASSWORD
echo ""

# Validate password
if [ ${#PASSWORD} -lt 8 ]; then
    echo "⚠️  Warning: Password is short. Consider using 12+ characters."
fi

# Generate password hash
echo "Generating password hash..."
PASSWORD_HASH=$(node -e "console.log(require('crypto').createHash('sha256').update('$PASSWORD').digest('hex'))")

# Generate JWT secret
echo "Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo ""
echo "✅ Credentials generated successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Copy these to your .env.local file:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ADMIN_PASSWORD_HASH=$PASSWORD_HASH"
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to save to .env.local
echo "Would you like to save these to .env.local? (y/n)"
read -r SAVE_TO_FILE

if [ "$SAVE_TO_FILE" = "y" ] || [ "$SAVE_TO_FILE" = "Y" ]; then
    # Backup existing .env.local if it exists
    if [ -f .env.local ]; then
        cp .env.local .env.local.backup
        echo "✅ Backed up existing .env.local to .env.local.backup"
    fi
    
    # Add or update variables
    if [ -f .env.local ]; then
        # Remove old entries if they exist
        sed -i.bak '/^ADMIN_PASSWORD_HASH=/d' .env.local
        sed -i.bak '/^JWT_SECRET=/d' .env.local
    fi
    
    # Append new values
    echo "" >> .env.local
    echo "# Admin Authentication (Generated on $(date))" >> .env.local
    echo "ADMIN_PASSWORD_HASH=$PASSWORD_HASH" >> .env.local
    echo "JWT_SECRET=$JWT_SECRET" >> .env.local
    
    echo "✅ Saved to .env.local"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. For Vercel deployment:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Add these as environment variables"
echo "   - Redeploy your application"
echo ""
echo "2. For Railway deployment:"
echo "   - Go to: https://railway.app/dashboard"
echo "   - Add these as environment variables"
echo "   - Railway will auto-deploy"
echo ""
echo "3. Test your login at:"
echo "   - /blog/admin"
echo "   - /receipt"
echo ""
echo "⚠️  IMPORTANT: Keep these credentials secure!"
echo "   Never commit .env.local to Git"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
