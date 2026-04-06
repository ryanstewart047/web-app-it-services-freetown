import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    // Check if email exists in the database and is active
    const technician = await prisma.technician.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!technician) {
       return NextResponse.json({ exists: false, error: 'Email not found in our database.' });
    }
    
    if (!technician.active) {
       return NextResponse.json({ exists: true, active: false, error: 'Account is deactivated. Contact admin.' });
    }

    return NextResponse.json({ exists: true, active: true });
  } catch (error: any) {
    console.error('Check Email Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
