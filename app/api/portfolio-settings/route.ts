import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default settings
const DEFAULT_SETTINGS = {
  email: 'support@itservicesfreetown.com',
  phone: '+232 76 123 456',
  location: 'Freetown, Sierra Leone',
  profilePhoto: '/assets/profile-ryan.jpg',
  logoText: 'RJS',
};

// GET settings from Postgres
export async function GET() {
  try {
    const settings = await prisma.portfolioSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      email: settings.email,
      phone: settings.phone,
      location: settings.location,
      profilePhoto: settings.profilePhoto,
      logoText: settings.logoText,
    });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// POST/PUT settings to Postgres
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, settings } = body;

    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Delete all existing settings and create new one
    await prisma.portfolioSettings.deleteMany({});
    
    const savedSettings = await prisma.portfolioSettings.create({
      data: {
        email: settings.email,
        phone: settings.phone,
        location: settings.location,
        profilePhoto: settings.profilePhoto,
        logoText: settings.logoText,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        email: savedSettings.email,
        phone: savedSettings.phone,
        location: savedSettings.location,
        profilePhoto: savedSettings.profilePhoto,
        logoText: savedSettings.logoText,
      },
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving settings: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
