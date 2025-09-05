#!/bin/bash

# Backend Implementation Setup Script
# Run this script to install all necessary dependencies for the real backend features

echo "🚀 Setting up IT Services Freetown Backend..."

# Install core dependencies
echo "📦 Installing core dependencies..."
npm install @prisma/client prisma
npm install resend react-email @react-email/components
npm install openai
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs

# Install optional real-time features
echo "📡 Installing real-time features..."
npm install socket.io socket.io-client
npm install pusher pusher-js

# Install email template dependencies
echo "📧 Installing email template dependencies..."  
npm install @react-email/render

# Install utility libraries
echo "🛠 Installing utilities..."
npm install date-fns
npm install zod # for validation
npm install uuid @types/uuid

# Install SMS service (optional)
echo "📱 Installing SMS service..."
npm install twilio

# Install payment processing (optional)
echo "💳 Installing payment processing..."
npm install stripe

# Install file upload service (optional)
echo "📷 Installing file upload service..."
npm install cloudinary multer @types/multer

# Development dependencies
echo "🔧 Installing development dependencies..."
npm install --save-dev @types/node typescript

# Database setup
echo "🗄 Setting up database..."
npx prisma generate
npx prisma db push

echo "✅ Backend setup complete!"
echo ""
echo "🔑 Next steps:"
echo "1. Copy .env.example to .env.local"
echo "2. Fill in your API keys:"
echo "   - Get Resend API key from: https://resend.com"
echo "   - Get OpenAI API key from: https://platform.openai.com"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Test the new features!"
echo ""
echo "📚 Documentation: See IMPLEMENTATION_GUIDE.md for detailed setup instructions"
