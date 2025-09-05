#!/bin/bash

echo "🚀 IT Services Freetown - Gmail Setup for Email Notifications"
echo "============================================================="
echo ""

echo "📧 Setting up Gmail App Password for automated emails..."
echo ""

echo "Steps to get Gmail App Password:"
echo "1. Go to https://myaccount.google.com/"
echo "2. Click 'Security' in the left sidebar"
echo "3. Under 'Signing in to Google', click '2-Step Verification'"
echo "4. If not enabled, enable 2-Step Verification first"
echo "5. Click 'App passwords' at the bottom"
echo "6. Select 'Mail' as the app"
echo "7. Select 'Other (Custom name)' as device"
echo "8. Enter 'IT Services Freetown' as the name"
echo "9. Click 'Generate'"
echo "10. Copy the 16-character password (like: abcd efgh ijkl mnop)"
echo ""

echo "📝 Email addresses configured:"
echo "   SMTP_USER: itservicesfreetown@gmail.com"
echo "   FROM_EMAIL: support@itservicesfreetown.com"
echo ""

echo "⚡ Next steps:"
echo "1. Get Gmail App Password using steps above"
echo "2. Deploy to Railway following RAILWAY_DEPLOYMENT.md"
echo "3. Set environment variables in Railway dashboard"
echo "4. Test email notifications on production"
echo ""

echo "📖 Full deployment guide: RAILWAY_DEPLOYMENT.md"
echo "🎯 Current status: Ready for Railway deployment!"

# Check if running on macOS and offer to open Gmail settings
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    read -p "🔗 Open Gmail account settings in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://myaccount.google.com/security"
    fi
fi
