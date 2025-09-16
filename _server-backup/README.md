# Server Deployment Backup

This directory contains all the server-side configurations and API routes that are not compatible with GitHub Pages static hosting but are needed for full server deployment (Vercel, Netlify, etc.).

## Backed Up Files:

### API Routes (app/api/)
- `/api/chat` - AI chat support with Gemini integration
- `/api/appointments` - Appointment booking and management
- `/api/repairs` - Repair tracking system
- `/api/troubleshoot` - Troubleshooting guide API
- `/api/agents` - Agent request handling
- `/api/socketio` - Real-time communication

### Database Configuration
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migration files
- `lib/prisma.ts` - Prisma client configuration

### Server Libraries
- `lib/email.ts` - Email service configuration
- `lib/notification-service.ts` - Notification handling
- `lib/repair-tracking.ts` - Repair tracking logic

### Environment Variables Needed:
```env
# Database
DATABASE_URL="postgresql://..."

# AI Service
GEMINI_API_KEY="your-gemini-api-key"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Domain Configuration
NEXT_PUBLIC_BASE_URL="https://itservicesfreetown.com"
```

## Restoration Instructions:

To restore full server functionality:

1. Copy API routes back: `cp -r _server-backup/api app/`
2. Restore Prisma config: `cp _server-backup/schema.prisma prisma/`
3. Restore server libs: `cp _server-backup/lib/* lib/`
4. Update next.config.js to remove static export
5. Set up environment variables
6. Run database migrations: `npx prisma migrate deploy`

## Static vs Server Features:

### Static (GitHub Pages):
- ✅ Landing page with hero section
- ✅ Services showcase
- ✅ Contact information
- ✅ Static troubleshooting guides
- ✅ Basic form submissions (via external services)

### Server (Vercel/Netlify):
- ✅ All static features +
- ✅ AI-powered chat support
- ✅ Real-time appointment booking
- ✅ Repair tracking system
- ✅ Database-driven content
- ✅ Email notifications
- ✅ Dynamic troubleshooting
