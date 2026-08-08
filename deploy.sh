#!/bin/bash

echo "🚀 Deploying BridgeTech IT Services to itservicesfreetown.com"
echo "=================================================="

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "🌍 Your website will be available at:"
    echo "   https://itservicesfreetown.com"
    echo "   https://www.itservicesfreetown.com"
    echo ""
    echo "⏳ Note: If using a custom domain for the first time,"
    echo "   DNS propagation may take 5-48 hours."
    echo ""
    echo "🔍 Check deployment status:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "📖 Domain setup guide: ./CUSTOM_DOMAIN_SETUP.md"
else
    echo "❌ Deployment failed! Check the error messages above."
    exit 1
fi
