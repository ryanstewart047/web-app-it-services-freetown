# BridgeTech IT Services - Web Application

A comprehensive IT services web application for computer and mobile repairs in Freetown, Sierra Leone. Built with Next.js 14, TypeScript, and modern web technologies.

## Features

### 🔧 Core Services
- **Appointment Booking**: Easy online booking with date and time selection
- **Repair Tracking**: Real-time status updates for ongoing repairs
- **Automated Notifications**: Email notifications for appointments and repair updates
- **AI-Powered Troubleshooting**: Instant repair suggestions based on device and issue
- **Real-Time Chat Support**: Live chat with AI and human technicians

### 💻 Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Real-time**: Socket.io for live features
- **Email**: Nodemailer for automated notifications
- **AI**: Groq API (Llama 3.1) - FREE, ultra-fast AI chat and troubleshooting

### 🤖 AI Setup (Required for Chat & Troubleshooting)
**NEW!** We've switched to Groq for faster, free AI responses!

👉 **[Quick Start Guide](./QUICK_START_GROQ.md)** - Get your AI running in 2 minutes!
- Get free API key from https://console.groq.com/keys
- Add it to `lib/groq-ai-client.ts`
- No credit card required, 100% free!

📚 **[Detailed Setup Guide](./GROQ_API_SETUP.md)** - Full documentation and troubleshooting

## 🚀 Deployment Options

### Vercel Deployment (Recommended)
This application is optimized for deployment on Vercel. Check these guides:
- [Migrating from Railway to Vercel](./MIGRATING_TO_VERCEL.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Setting Up Vercel Postgres](./VERCEL_POSTGRES_SETUP.md)

### Alternative Hosting Options
If you prefer other hosting solutions:
- [Alternative Hosting Options](./ALTERNATIVE_HOSTING_OPTIONS.md)
- [PHP Form Handler Setup](./PHP_FORM_HANDLER_README.md) (for PHP-capable hosts)

### 🎨 Design System
- **Primary Color**: #040e40 (Dark Navy Blue)
- **Secondary Color**: #ff0000 (Red)
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-app-it-services-freetown
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── book-appointment/  # Appointment booking page
│   ├── track-repair/      # Repair tracking page
│   ├── troubleshoot/      # AI troubleshooting page
│   ├── chat/              # Live chat support page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Database client
│   └── email.ts          # Email utilities
└── prisma/               # Database schema
    └── schema.prisma     # Prisma schema
```

## Key Features Implementation

### Appointment Booking
- Form validation and submission
- Customer data management
- Email confirmations
- Calendar integration

### Repair Tracking
- Real-time status updates
- Timeline visualization
- Technician assignment
- Progress notifications

### AI Troubleshooting
- OpenAI integration
- Device-specific suggestions
- Step-by-step solutions
- Escalation to human support

### Live Chat Support
- Real-time messaging
- AI bot responses
- Human agent transfer
- Chat history

### Automated Notifications
- Appointment confirmations
- Repair status updates
- Completion notifications
- HTML email templates

## API Endpoints

- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get appointments
- `GET /api/repairs/:id` - Get repair status
- `POST /api/troubleshoot` - AI troubleshooting
- `POST /api/chat` - Chat messages

## Database Schema

The application uses Prisma with the following main models:
- **Customer**: User information and contact details
- **Appointment**: Repair appointments and scheduling
- **Repair**: Repair jobs and status tracking
- **Technician**: Staff members and their expertise
- **ChatSession**: Live chat conversations
- **AITroubleshooting**: AI-generated solutions

## Deployment

### Environment Setup
1. Set up production database (PostgreSQL recommended)
2. Configure email service (SMTP)
3. Set up OpenAI API key
4. Configure domain and SSL

### Deploy to Vercel
1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Deploy to Other Platforms
- Netlify: Use `next export` for static deployment
- Railway: Direct deployment with database
- DigitalOcean: App Platform deployment

## Configuration

### Email Setup
Configure SMTP settings in environment variables:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Configuration
For production, use PostgreSQL:
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

### AI Integration
Add OpenAI API key:
```
OPENAI_API_KEY="your-openai-api-key"
```

### Persistent Analytics & Repair Storage
By default, analytics snapshots and repair bookings are saved to `data/app-analytics.json` on the server. Configure these environment variables to control where data lives and optionally sync with GitHub Gists for shared hosting environments:

```
# Override the filesystem path for the analytics JSON file (optional)
APP_DATA_FILE="/absolute/path/to/app-analytics.json"

# Enable GitHub Gist sync (optional)
GITHUB_GIST_ID="your-gist-id"
GITHUB_TOKEN="ghp_yourPersonalAccessToken"
GITHUB_GIST_FILENAME="its-analytics.json" # defaults to this name when omitted
```

When `GITHUB_GIST_ID` and `GITHUB_TOKEN` are set, the APIs automatically read/write analytics and repair data from that gist—ideal for platforms without persistent disk. Without those variables, data is written to the local file specified by `APP_DATA_FILE` (or `data/app-analytics.json`).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@itservicesfreetown.com
- Phone: +232 XX XXX XXXX
- Address: 123 Main Street, Freetown, Sierra Leone

## Roadmap

### Upcoming Features
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Inventory management
- [ ] Customer portal
- [ ] Analytics dashboard
- [ ] Multi-location support

### Technical Improvements
- [ ] Performance optimization
- [ ] SEO enhancements
- [ ] Accessibility improvements
- [ ] Test coverage
- [ ] CI/CD pipeline
- [ ] Monitoring and logging
# Trigger deployment Thu Sep 25 12:31:42 UTC 2025
