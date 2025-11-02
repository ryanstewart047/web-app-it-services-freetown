import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all appointments
export async function GET() {
  try {
    // Check if database is configured
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('YOUR_PASSWORD_HERE') || dbUrl.includes('YOUR_HOST_HERE')) {
      console.error('❌ Database not configured. Please set up POSTGRES_URL or DATABASE_URL in .env.local');
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure your database connection. See DATABASE_SETUP_REQUIRED.md for instructions.',
        appointments: [] // Return empty array for graceful fallback
      }, { status: 503 });
    }

    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    
    // Check if it's a connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Cannot connect to database. Please check your POSTGRES_URL configuration.',
        appointments: [] // Return empty array for graceful fallback
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch appointments',
      message: errorMessage,
      appointments: [] // Return empty array for graceful fallback
    }, { status: 500 });
  }
}

// POST new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      deviceType,
      deviceModel,
      issueDescription,
      serviceType,
      preferredDate,
      preferredTime
    } = body;

    // Create or find customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress
        }
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        deviceType,
        deviceModel,
        issueDescription,
        serviceType,
        preferredDate,
        preferredTime,
        status: 'pending'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
