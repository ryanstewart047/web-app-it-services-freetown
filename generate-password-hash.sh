#!/bin/bash

# Generate secure password hash for admin authentication
# Usage: ./generate-password-hash.sh

echo "🔐 Admin Password Hash Generator"
echo "================================"
echo ""
echo "This will generate a secure SHA-256 hash for your admin password."
echo ""
read -sp "Enter your new admin password: " PASSWORD
echo ""
echo ""

if [ -z "$PASSWORD" ]; then
    echo "❌ Error: Password cannot be empty"
    exit 1
fi

if [ ${#PASSWORD} -lt 8 ]; then
    echo "⚠️  Warning: Password is less than 8 characters. Consider using a stronger password."
fi

# Generate hash
HASH=$(node -e "console.log(require('crypto').createHash('sha256').update('$PASSWORD').digest('hex'))")

echo "✅ Password hash generated successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your password hash is:"
echo ""
echo "  $HASH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Select your project: web-app-it-services-freetown"
echo "3. Go to Settings → Environment Variables"
echo "4. Add a new variable:"
echo "   Name:  ADMIN_PASSWORD_HASH"
echo "   Value: $HASH"
echo "5. Click Save and redeploy your site"
echo ""
echo "⚠️  Keep this hash private! Anyone with this hash can create"
echo "    an authentication system for your password."
echo ""
