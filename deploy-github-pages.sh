#!/bin/bash

# Deploy Next.js static export to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Copy essential files to output
cp .nojekyll out/
cp CNAME out/

# Create a temporary directory for GitHub Pages content
rm -rf gh-pages-temp
mkdir gh-pages-temp

# Copy all built files to temp directory
cp -r out/* gh-pages-temp/

# Initialize git in temp directory and push to gh-pages branch
cd gh-pages-temp
git init
git add .
git commit -m "Deploy Next.js static site to GitHub Pages - $(date)"

# Add remote and force push to gh-pages branch
git branch -M gh-pages
git remote add origin https://github.com/ryanstewart047/web-app-it-services-freetown.git
git push -f origin gh-pages

# Clean up
cd ..
rm -rf gh-pages-temp

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://itservicesfreetown.com"
