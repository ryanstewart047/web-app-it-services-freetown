# Real Backend Implementation Guide

## 🎯 Overview
Transform your static website into a fully functional IT services platform with real email confirmations, repair tracking, AI responses, and live notifications.

## 📋 Features to Implement

### 1. Email Confirmation System
- ✅ Automated booking confirmations
- ✅ Repair status updates
- ✅ Pickup notifications
- ✅ Professional email templates

### 2. Real-Time Repair Tracking
- ✅ Unique repair ID generation
- ✅ Status updates (Received → Diagnosing → Repairing → Complete)
- ✅ Database integration
- ✅ Customer notifications

### 3. AI Chat Integration
- ✅ OpenAI GPT integration
- ✅ Context-aware responses
- ✅ Escalation to human agents
- ✅ Chat history storage

### 4. Live Agent Notifications
- ✅ Real-time chat alerts
- ✅ Agent dashboard
- ✅ Queue management
- ✅ Customer handoff system

## 🛠 Technology Stack

### Backend
- **Framework**: Next.js 14 API Routes
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (if needed)

### Email Service
- **Provider**: Resend (recommended) or SendGrid
- **Templates**: React Email components
- **Delivery**: SMTP configuration

### AI Integration
- **Provider**: OpenAI GPT-4
- **Features**: Chat completions, context awareness
- **Fallback**: Predefined responses

### Real-time Features
- **WebSockets**: Socket.io
- **Notifications**: Server-Sent Events
- **Dashboard**: Real-time updates

### Deployment
- **Platform**: Vercel (recommended) or Railway
- **Database**: PlanetScale or Supabase
- **Domain**: Your existing itservicesfreetown.com

## 📦 Implementation Steps

### Step 1: Project Setup
```bash
# Install dependencies
npm install @prisma/client prisma
npm install resend react-email
npm install openai
npm install socket.io socket.io-client
npm install @types/node typescript
```

### Step 2: Database Schema
```prisma
// prisma/schema.prisma
model Appointment {
  id            String   @id @default(cuid())
  customerName  String
  email         String
  phone         String
  deviceType    String
  deviceModel   String
  issueDescription String
  preferredDate DateTime
  preferredTime String
  status        String   @default("pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Repair {
  id          String   @id @default(cuid())
  trackingId  String   @unique
  customerName String
  email       String
  phone       String
  deviceType  String
  deviceModel String
  issue       String
  status      RepairStatus @default(RECEIVED)
  notes       String?
  estimatedCompletion DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  statusHistory RepairStatusHistory[]
}

model RepairStatusHistory {
  id       String   @id @default(cuid())
  repairId String
  status   RepairStatus
  notes    String?
  createdAt DateTime @default(now())
  repair   Repair   @relation(fields: [repairId], references: [id])
}

model ChatSession {
  id        String   @id @default(cuid())
  sessionId String   @unique
  customerEmail String?
  isActive  Boolean  @default(true)
  assignedAgent String?
  createdAt DateTime @default(now())
  messages  ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  sender    MessageSender
  content   String
  timestamp DateTime @default(now())
  session   ChatSession @relation(fields: [sessionId], references: [id])
}

enum RepairStatus {
  RECEIVED
  DIAGNOSING
  WAITING_PARTS
  REPAIRING
  TESTING
  COMPLETED
  READY_PICKUP
  DELIVERED
}

enum MessageSender {
  USER
  AI
  AGENT
}
```

### Step 3: Email Service Setup
```typescript
// lib/email.ts
import { Resend } from 'resend';
import { AppointmentConfirmationEmail } from '../emails/appointment-confirmation';
import { RepairStatusEmail } from '../emails/repair-status';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentConfirmation(appointment: Appointment) {
  const { data, error } = await resend.emails.send({
    from: 'IT Services Freetown <noreply@itservicesfreetown.com>',
    to: [appointment.email],
    subject: `Appointment Confirmed - ${appointment.id}`,
    react: AppointmentConfirmationEmail({ appointment }),
  });

  if (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send confirmation email');
  }

  return data;
}

export async function sendRepairStatusUpdate(repair: Repair) {
  const { data, error } = await resend.emails.send({
    from: 'IT Services Freetown <noreply@itservicesfreetown.com>',
    to: [repair.email],
    subject: `Repair Update - ${repair.trackingId}`,
    react: RepairStatusEmail({ repair }),
  });

  return data;
}
```

### Step 4: OpenAI Integration
```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(message: string, context?: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful IT support assistant for IT Services Freetown. 
          You specialize in computer and mobile device repairs. 
          Be friendly, professional, and provide practical troubleshooting advice.
          If the issue seems complex, suggest booking an appointment or connecting with a human agent.
          ${context ? `Context: ${context}` : ''}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again or connect with a human agent.";
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm currently offline. Please connect with a human agent for immediate assistance.";
  }
}
```

### Step 5: Real-time Chat System
```typescript
// lib/socket.ts (Server-side)
import { Server } from 'socket.io';
import { generateAIResponse } from './openai';
import { prisma } from './prisma';

export function initializeSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', async (sessionId: string) => {
      socket.join(sessionId);
      
      // Create or get chat session
      const session = await prisma.chatSession.upsert({
        where: { sessionId },
        update: { isActive: true },
        create: { sessionId, isActive: true }
      });
    });

    socket.on('send-message', async (data) => {
      const { sessionId, message, sender } = data;
      
      // Save message to database
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content: message,
          sender: sender.toUpperCase()
        }
      });

      // Broadcast message to room
      io.to(sessionId).emit('receive-message', {
        content: message,
        sender,
        timestamp: new Date()
      });

      // Generate AI response if sender is user
      if (sender === 'user') {
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(message);
          
          // Save AI response
          await prisma.chatMessage.create({
            data: {
              sessionId,
              content: aiResponse,
              sender: 'AI'
            }
          });

          // Send AI response
          io.to(sessionId).emit('receive-message', {
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          });
        }, 1000 + Math.random() * 2000);
      }
    });

    socket.on('request-human-agent', async (sessionId: string) => {
      // Notify available agents
      socket.broadcast.emit('agent-request', {
        sessionId,
        customerInfo: 'New customer requesting human support'
      });

      // Update session to show agent requested
      await prisma.chatSession.update({
        where: { sessionId },
        data: { assignedAgent: 'PENDING' }
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
```

### Step 6: API Routes

#### Appointment Booking
```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        deviceType: data.deviceType,
        deviceModel: data.deviceModel,
        issueDescription: data.issueDescription,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
      }
    });

    // Send confirmation email
    await sendAppointmentConfirmation(appointment);

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
```

#### Repair Tracking
```typescript
// app/api/repairs/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { trackingId } = await request.json();
    
    const repair = await prisma.repair.findUnique({
      where: { trackingId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!repair) {
      return NextResponse.json(
        { error: 'Repair not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      repair: {
        trackingId: repair.trackingId,
        customerName: repair.customerName,
        deviceType: repair.deviceType,
        deviceModel: repair.deviceModel,
        status: repair.status,
        estimatedCompletion: repair.estimatedCompletion,
        statusHistory: repair.statusHistory
      }
    });
  } catch (error) {
    console.error('Repair tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track repair' },
      { status: 500 }
    );
  }
}
```

## 🚀 Deployment Instructions

### 1. Environment Variables
```env
# Database
DATABASE_URL="your-database-url"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# App URL
NEXT_PUBLIC_APP_URL="https://itservicesfreetown.com"
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📱 Mobile App Considerations
- Progressive Web App (PWA) capabilities
- Push notifications for repair updates
- Offline functionality for basic features
- Mobile-optimized chat interface

## 🔐 Security Features
- Input validation and sanitization
- Rate limiting for API endpoints
- Email verification for appointments
- CORS configuration
- Environment variable protection

## 📊 Analytics & Monitoring
- Repair completion metrics
- Customer satisfaction tracking
- Response time monitoring
- Error logging and alerting

## 💡 Advanced Features
- SMS notifications via Twilio
- Calendar integration for appointments
- Automated repair cost estimation
- Customer feedback system
- Multi-language support

## 🎯 Next Steps
1. Choose your preferred services (Resend, PlanetScale, etc.)
2. Set up accounts and get API keys
3. Implement one feature at a time
4. Test thoroughly before going live
5. Monitor and iterate based on usage

---

**Estimated Implementation Time**: 2-3 weeks for core features
**Monthly Operating Cost**: $20-50 (depending on usage)
**Skills Required**: JavaScript/TypeScript, API integration, Database management
