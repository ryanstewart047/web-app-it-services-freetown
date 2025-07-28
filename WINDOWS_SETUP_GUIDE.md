# IT Services Freetown - Windows Setup Guide

## 📦 Project Package Contents

Your downloadable project package (`web-app-it-services-freetown.zip`) contains:

### ✅ Complete Application Files
- **Source Code**: All React/Next.js components and pages
- **API Routes**: Backend endpoints for all functionality
- **Database Schema**: Prisma configuration and models
- **HTML Previews**: 5 standalone HTML files for immediate preview
- **Configuration**: All config files (package.json, tailwind, etc.)
- **Documentation**: README, requirements check, and setup guides

### 📁 Project Structure
```
web-app-it-services-freetown/
├── src/                          # Next.js application source
│   ├── app/                      # App Router pages and API routes
│   ├── components/               # Reusable React components
│   ├── lib/                      # Utility libraries (Prisma, email)
│   └── types/                    # TypeScript type definitions
├── prisma/                       # Database schema and config
├── *.html                        # Standalone preview files
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Styling configuration
├── .env.example                  # Environment variables template
└── README.md                     # Project documentation
```

## 🖥️ Windows Setup Instructions

### Step 1: Prerequisites Installation

1. **Install Node.js (Required)**
   - Download from: https://nodejs.org/
   - Choose the LTS version (recommended)
   - This includes npm package manager

2. **Install Git (Optional but recommended)**
   - Download from: https://git-scm.com/download/win
   - For version control and deployment

3. **Choose a Code Editor**
   - **VS Code** (Recommended): https://code.visualstudio.com/
   - **WebStorm**: https://www.jetbrains.com/webstorm/
   - **Sublime Text**: https://www.sublimetext.com/

### Step 2: Project Setup

1. **Extract the Project**
   ```cmd
   # Extract web-app-it-services-freetown.zip to your desired location
   # Example: C:\Projects\web-app-it-services-freetown\
   ```

2. **Open Command Prompt/PowerShell**
   - Press `Win + R`, type `cmd`, press Enter
   - Or use PowerShell or Windows Terminal

3. **Navigate to Project Directory**
   ```cmd
   cd C:\Projects\web-app-it-services-freetown
   ```

4. **Install Dependencies**
   ```cmd
   npm install
   ```

5. **Set Up Environment Variables**
   ```cmd
   copy .env.example .env.local
   ```
   
   Then edit `.env.local` with your settings:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Email Configuration (Optional for testing)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   FROM_EMAIL="noreply@itservicesfreetown.com"
   
   # OpenAI API (Optional for AI features)
   OPENAI_API_KEY="your-openai-api-key"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   
   # Socket.IO
   SOCKET_IO_SECRET="your-socket-secret"
   ```

6. **Initialize Database**
   ```cmd
   npm run db:generate
   npm run db:push
   ```

### Step 3: Running the Application

1. **Start Development Server**
   ```cmd
   npm run dev
   ```

2. **Open in Browser**
   - Navigate to: http://localhost:3000
   - The application should load successfully

3. **Alternative: Preview HTML Files**
   - Double-click any `.html` file to preview in browser
   - Works without Node.js installation

## 🚀 Available Scripts

```cmd
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run code linting
npm run db:push      # Update database schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open database viewer
```

## 🔧 Development Workflow

### For Immediate Testing
1. Open any `.html` file in your browser
2. All features work as standalone demos
3. No setup required

### For Full Development
1. Follow the complete setup above
2. Use `npm run dev` for hot reloading
3. Access all features at http://localhost:3000

## 📝 Key Features to Test

### ✅ Working Features (Standalone HTML)
- **Homepage**: `preview.html`
- **Appointment Booking**: `book-appointment.html`
- **Repair Tracking**: `track-repair.html`
- **AI Troubleshooting**: `troubleshoot.html`
- **Live Chat**: `chat.html`

### ✅ Full Application Features (After Setup)
- Real database integration
- Email notifications (when configured)
- API endpoints for all features
- Real-time Socket.io features
- AI integration (when API key provided)

## 🐛 Common Windows Issues & Solutions

### Issue: "npm is not recognized"
**Solution**: Reinstall Node.js and ensure it's added to PATH

### Issue: Permission errors
**Solution**: Run Command Prompt as Administrator

### Issue: Port 3000 already in use
**Solution**: 
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Database connection errors
**Solution**: Ensure you're in the project directory when running commands

## 📧 Production Deployment

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Option 2: Netlify
1. Build the project: `npm run build`
2. Upload the `out` folder to Netlify

### Option 3: Traditional Hosting
1. Build: `npm run build`
2. Upload files to your web server
3. Configure environment variables

## 📞 Support & Resources

- **Project Documentation**: README.md
- **Requirements Check**: REQUIREMENTS_CHECK.md
- **VS Code Settings**: `.vscode/` folder included
- **Database Schema**: `prisma/schema.prisma`

## 🎯 Next Steps After Setup

1. **Customize Branding**: Update colors, logos, and content
2. **Configure Email**: Set up SMTP for real notifications
3. **Add AI Features**: Get OpenAI API key for troubleshooting
4. **Database**: Switch to PostgreSQL for production
5. **Deploy**: Choose hosting platform and deploy

## ✨ What's Included & Ready

- ✅ Complete Next.js 14 application
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Prisma database setup
- ✅ Socket.io real-time features
- ✅ Email system integration
- ✅ AI troubleshooting framework
- ✅ 5 standalone HTML demos
- ✅ Production-ready code

**Your project is 100% complete and ready for Windows development!** 🎉
