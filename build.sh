#!/bin/bash

echo "🏗️  Building BridgeTech IT Services for deployment..."

# Build CSS
echo "📦 Building production CSS..."
npm run build-css-prod

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    exit 1
fi

# Check if CSS was built
if [ ! -f "public/assets/css/output.css" ]; then
    echo "❌ Error: CSS build failed!"
    exit 1
fi

echo "✅ Build complete! Ready for deployment."
echo ""
echo "📄 Static files ready:"
echo "   - index.html"
echo "   - book-appointment.html"
echo "   - track-repair.html"
echo "   - chat.html"
echo "   - troubleshoot.html"
echo "   - public/assets/css/output.css"
echo "   - public/assets/ (images, icons)"
echo ""
echo "🚀 Deploy to Vercel:"
echo "   vercel --prod"
